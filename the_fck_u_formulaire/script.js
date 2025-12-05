// =========================
// script.js – Limbo Key Edition
// 5s dance + 5s guess + evasive Yes + timers everywhere
// =========================

// DOM references
const inputs = Array.from(document.querySelectorAll(".digit-input"));
const resultEl = document.getElementById("result");
const timerValueEl = document.getElementById("timer-value");
const resetBtn = document.getElementById("reset-btn");

// =========================
// CONFIG
// =========================

// Bomb for entering digits
const BASE_TIME = 60;        // seconds to type the phone number
const TICK_MS = 100;         // timer tick frequency
const SPEED_MULT = 1.25;     // how much faster after each digit
const MAX_SPEED = 6;         // cap speed

// Validate phase split:
//  - 5 seconds of "dance" (shuffling, no timer)
//  - 5 seconds of "guess" (timer running)
const DANCE_DURATION_MS = 5000;       // 5s animation
const VALIDATE_GUESS_TIME = 5;        // 5s to choose the key

// Confirm phase (Yes/No) timer
const CONFIRM_TIME = 10;               // seconds to answer Yes/No

// Cooldown after failing
const COOLDOWN_MS = 3000;            // ms of "stunned" greyed-out inputs

// Limbo-style validate buttons
const NUM_VALIDATE_BUTTONS = 8;      // 4x2 grid
const SHUFFLE_INTERVAL_MS = 500;     // how often they move during dance

// Red pre-flash on the real key (twice)
const PRE_FLASH_MS = 250;           // how long each red glow lasts
const PRE_FLASH_GAP_MS = 150;       // gap between the two glows

// Confirm "Yes" evasive behavior
const YES_DODGES_REQUIRED = 10;      // how many times Yes dodges before accepting
const YES_MIN_DURATION = 0.15;      // min smooth move duration (seconds)
const YES_MAX_DURATION = 0.8;       // max smooth move duration (seconds)


// =========================
// STATE
// =========================

// Phone number typing state
let currentIndex = 0;        // which logical digit (0..9) is next
let timeLeft = BASE_TIME;
let timeSpeed = 1;
let timerId = null;
let isLocked = false;        // true during cooldown
let cooldownId = null;
let hasStarted = false;      // entry bomb starts only after first digit
// phases: "entry" | "dance" | "guess" | "confirm" | "done"
let phase = "entry";

// Validate (Limbo key) state
let validateButtons = [];    // array of button elements
let correctButtonIndex = 0;  // index in validateButtons
let shuffleIntervalId = null;
let highlightTimeoutId = null;
let danceTimeoutId = null;
let slotCenters = [];        // slot index -> {left, top}
let buttonSlotIndex = [];    // button index -> slot index

// Confirm buttons state
let yesBtn = null;
let noBtn = null;
let yesDodgeCount = 0;


// =========================
// TIMER LOGIC
// =========================

function updateTimerDisplay() {
  timerValueEl.textContent = timeLeft.toFixed(1);
}

function startTimer() {
  if (timerId) clearInterval(timerId);

  timerId = setInterval(() => {
    if (isLocked) return; // do not tick while locked / cooldown

    timeLeft -= (TICK_MS / 1000) * timeSpeed;

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerDisplay();
      clearInterval(timerId);
      timerId = null;
      handleBombExplosion();
    } else {
      updateTimerDisplay();
    }
  }, TICK_MS);
}

function accelerateTimer() {
  // Only accelerate during entry phase
  if (phase !== "entry") return;
  timeSpeed = Math.min(MAX_SPEED, timeSpeed * SPEED_MULT);
}


// =========================
// BOMB EXPLOSION / COOLDOWN
// =========================

function handleBombExplosion() {
  isLocked = true;
  hasStarted = false;
  clearNextHighlight();
  destroyValidateButtons();
  destroyConfirmButtons();

  inputs.forEach(i => i.classList.add("locked"));

  if (phase === "guess") {
    resultEl.textContent = "💥 You ran out of time to choose! Cooldown…";
  } else if (phase === "dance") {
    resultEl.textContent = "💥 Something went wrong during the dance. Cooldown…";
  } else if (phase === "confirm") {
    resultEl.textContent = "💥 Too slow to answer… Cooldown…";
  } else {
    resultEl.textContent = "💥 Time's up! Cooldown…";
  }

  if (cooldownId) clearTimeout(cooldownId);
  cooldownId = setTimeout(() => {
    isLocked = false;
    inputs.forEach(i => i.classList.remove("locked"));
    cooldownId = null;
    resetGame("😵 You couldn't keep up. New round!");
  }, COOLDOWN_MS);
}


// =========================
// FLYING DIGIT INPUTS
// =========================

inputs.forEach((input, idx) => {
  input.dataset.logicalIndex = String(idx);
});

function placeInputsRandomly() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const topOffset = 90; // avoid top bar

  inputs.forEach(input => {
    const left = Math.random() * (vw - 80) + 10;
    const top  = Math.random() * (vh - topOffset - 140) + topOffset;
    input.style.left = `${left}px`;
    input.style.top  = `${top}px`;
  });
}

function getCurrentInput() {
  return inputs.find(i => Number(i.dataset.logicalIndex) === currentIndex);
}

function setNextHighlight() {
  inputs.forEach(i => i.classList.remove("next"));
  if (phase !== "entry") return;
  const cur = getCurrentInput();
  if (cur) cur.classList.add("next");
}

function clearNextHighlight() {
  inputs.forEach(i => i.classList.remove("next"));
}


// =========================
// DIGIT HELPERS & RESULT
// =========================

function findNextEmptyLogicalIndex() {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs.find(el => Number(el.dataset.logicalIndex) === i);
    if (input && !input.value) return i;
  }
  return null;
}

function getCurrentNumber() {
  const ordered = [...inputs].sort(
    (a, b) => Number(a.dataset.logicalIndex) - Number(b.dataset.logicalIndex)
  );
  return ordered.map(i => i.value || "•").join("");
}

function updateResult() {
  const ordered = [...inputs].sort(
    (a, b) => Number(a.dataset.logicalIndex) - Number(b.dataset.logicalIndex)
  );
  const digits = ordered.map(i => i.value || "•");
  const number = digits.join("");

  if (digits.every(d => d !== "•") && phase === "entry") {
    // All digits entered → go into dance phase
    phase = "dance";

    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    timeLeft = 0; // no timer during dance
    updateTimerDisplay();

    resultEl.innerHTML =
      `☎️ Number entered: <strong>${number}</strong><br>` +
      `Watch the keys dance for 5 seconds, then you’ll have <strong>5 seconds</strong> to choose the real one.`;

    createValidateButtons();
  } else if (phase === "entry") {
    resultEl.textContent = "Progress: " + number;
  }
}


// =========================
// LIMBO-STYLE VALIDATE BUTTONS
// =========================

function createValidateButtons() {
  destroyValidateButtons();

  validateButtons = [];
  slotCenters = [];
  buttonSlotIndex = [];

  correctButtonIndex = Math.floor(Math.random() * NUM_VALIDATE_BUTTONS);

  // 1) Create all buttons
  for (let i = 0; i < NUM_VALIDATE_BUTTONS; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "validate-btn";
    btn.textContent = "Validate";

    btn.dataset.index = String(i);
    btn.dataset.correct = i === correctButtonIndex ? "true" : "false";

    // Prevent keyboard activation
    btn.tabIndex = -1;
    btn.addEventListener("keydown", e => e.preventDefault());

    btn.addEventListener("click", () => {
      if (isLocked || phase !== "guess") return; // only valid during guess
      if (btn.dataset.correct === "true") {
        handleValidateSuccess();
      } else {
        handleBombExplosion();
      }
    });

    document.body.appendChild(btn);
    validateButtons.push(btn);
  }

  // 2) Compute slots
  computeValidateSlots();

  // Initial assignment: button i -> slot i
  for (let i = 0; i < NUM_VALIDATE_BUTTONS; i++) {
    buttonSlotIndex[i] = i;
    const pos = slotCenters[i];
    placeValidateButton(validateButtons[i], pos.left, pos.top);
  }

  // 3) Red double pre-flash on the correct button, THEN start dancing
  const correctBtn = validateButtons[correctButtonIndex];
  if (correctBtn) {
    runPreflashSequence(correctBtn);
  } else {
    startValidateShuffle();
  }
}

function computeValidateSlots() {
  slotCenters = [];

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const sample = validateButtons[0];
  const rect = sample.getBoundingClientRect();
  const btnW = rect.width || 110;
  const btnH = rect.height || 38;

  const cols = 4;
  const rows = 2;

  const hGap = btnW * 0.8;
  const vGap = btnH * 1.3;

  const totalW = btnW * cols + hGap * (cols - 1);
  const totalH = btnH * rows + vGap * (rows - 1);

  const startX = (vw - totalW) / 2 + btnW / 2;
  const startY = (vh - totalH) / 2 + btnH / 2 + 15; // slightly below center

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (btnW + hGap);
      const y = startY + r * (btnH + vGap);
      slotCenters.push({ left: x, top: y }); // slot index = r*4 + c
    }
  }
}

function placeValidateButton(btn, centerX, centerY) {
  const rect = btn.getBoundingClientRect();
  const w = rect.width || 110;
  const h = rect.height || 38;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 10;

  let left = centerX - w / 2;
  let top  = centerY - h / 2;

  left = Math.max(margin, Math.min(vw - w - margin, left));
  top  = Math.max(margin, Math.min(vh - h - margin, top));

  btn.style.left = `${left}px`;
  btn.style.top  = `${top}px`;
}

// Red double-flash sequence on the correct button
function runPreflashSequence(btn) {
  let flashes = 0;

  const doFlash = () => {
    if (phase !== "dance") {
      btn.classList.remove("validate-preflash");
      return;
    }

    if (flashes >= 2) {
      btn.classList.remove("validate-preflash");
      startValidateShuffle(); // only after both flashes
      return;
    }

    btn.classList.add("validate-preflash");
    highlightTimeoutId = setTimeout(() => {
      btn.classList.remove("validate-preflash");
      flashes++;
      highlightTimeoutId = setTimeout(doFlash, PRE_FLASH_GAP_MS);
    }, PRE_FLASH_MS);
  };

  doFlash();
}

function startValidateShuffle() {
  // Start the dance (5 seconds)
  if (shuffleIntervalId) clearInterval(shuffleIntervalId);

  shuffleIntervalId = setInterval(() => {
    if (phase !== "dance" || isLocked) return;
    shuffleValidateButtons();
  }, SHUFFLE_INTERVAL_MS);

  // Schedule the end of dance → start guess + timer
  if (danceTimeoutId) clearTimeout(danceTimeoutId);
  danceTimeoutId = setTimeout(() => {
    if (phase !== "dance" || isLocked) return;

    // Stop shuffling (freeze positions)
    stopValidateShuffle();

    // Move to guess phase
    phase = "guess";
    timeLeft = VALIDATE_GUESS_TIME;
    timeSpeed = 1;
    updateTimerDisplay();

    resultEl.innerHTML =
      `Now click the real <strong>Validate</strong> button! You have <strong>${VALIDATE_GUESS_TIME}</strong> seconds.`;

    startTimer(); // now the validate bomb starts ticking
  }, DANCE_DURATION_MS);
}

function stopValidateShuffle() {
  if (shuffleIntervalId) {
    clearInterval(shuffleIntervalId);
    shuffleIntervalId = null;
  }
}

// Full permutation each tick -> smooth "dance" thanks to CSS transitions
function shuffleValidateButtons() {
  const N = NUM_VALIDATE_BUTTONS;
  if (slotCenters.length !== N) return;

  const slots = [];
  for (let i = 0; i < N; i++) slots.push(i);

  // Fisher–Yates shuffle
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  // Assign shuffled slots
  for (let i = 0; i < N; i++) {
    buttonSlotIndex[i] = slots[i];
  }

  // Apply positions
  for (let i = 0; i < N; i++) {
    const btn = validateButtons[i];
    const slot = buttonSlotIndex[i];
    const pos = slotCenters[slot];
    if (btn && pos) placeValidateButton(btn, pos.left, pos.top);
  }
}

function destroyValidateButtons() {
  stopValidateShuffle();

  if (highlightTimeoutId) {
    clearTimeout(highlightTimeoutId);
    highlightTimeoutId = null;
  }
  if (danceTimeoutId) {
    clearTimeout(danceTimeoutId);
    danceTimeoutId = null;
  }

  validateButtons.forEach(btn => {
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
  });
  validateButtons = [];
  slotCenters = [];
  buttonSlotIndex = [];
}


// =========================
// CONFIRM YES/NO BUTTONS
// =========================

function createConfirmButtons(number) {
  destroyConfirmButtons();
  yesDodgeCount = 0;

  // Create Yes button
  yesBtn = document.createElement("button");
  yesBtn.type = "button";
  yesBtn.className = "confirm-btn confirm-yes";
  yesBtn.textContent = "Yes";
  yesBtn.tabIndex = -1;

  // Create No button
  noBtn = document.createElement("button");
  noBtn.type = "button";
  noBtn.className = "confirm-btn confirm-no";
  noBtn.textContent = "No";
  noBtn.tabIndex = -1;

  document.body.appendChild(yesBtn);
  document.body.appendChild(noBtn);

  // Initial placement (center-ish)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const centerX = vw / 2;
  const centerY = vh / 2 + 60;

  placeConfirmButton(yesBtn, centerX - 80, centerY);
  placeConfirmButton(noBtn, centerX + 80, centerY);

  yesBtn.addEventListener("click", onYesClick);
  noBtn.addEventListener("click", () => {
    if (isLocked || phase !== "confirm") return;
    resetGame("❌ Okay, let's try again.");
  });
}

function destroyConfirmButtons() {
  if (yesBtn) {
    yesBtn.removeEventListener("click", onYesClick);
    if (yesBtn.parentNode) yesBtn.parentNode.removeChild(yesBtn);
    yesBtn = null;
  }
  if (noBtn) {
    if (noBtn.parentNode) noBtn.parentNode.removeChild(noBtn);
    noBtn = null;
  }
}

function placeConfirmButton(btn, centerX, centerY) {
  const rect = btn.getBoundingClientRect();
  const w = rect.width || 80;
  const h = rect.height || 32;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 10;

  let left = centerX - w / 2;
  let top  = centerY - h / 2;

  left = Math.max(margin, Math.min(vw - w - margin, left));
  top  = Math.max(70, Math.min(vh - h - margin, top)); // avoid top bar

  btn.style.left = `${left}px`;
  btn.style.top  = `${top}px`;
}

function moveYesButtonRandom() {
  if (!yesBtn) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const topMin = 70;
  const topMax = vh - 80;

  const targetX = Math.random() * (vw - 160) + 80;
  const targetY = Math.random() * (topMax - topMin) + topMin;

  // Random duration between YES_MIN_DURATION and YES_MAX_DURATION
  const dur = YES_MIN_DURATION + Math.random() * (YES_MAX_DURATION - YES_MIN_DURATION);
  yesBtn.style.transition =
    `left ${dur}s ease, top ${dur}s ease, transform 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s`;

  placeConfirmButton(yesBtn, targetX, targetY);
}

function onYesClick(e) {
  if (isLocked || phase !== "confirm") return;

  if (yesDodgeCount < YES_DODGES_REQUIRED) {
    yesDodgeCount++;
    moveYesButtonRandom();
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Enough dodges -> accept Yes
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  phase = "done";
  destroyConfirmButtons();

  const number = getCurrentNumber();
  resultEl.innerHTML =
    `✅ Confirmed! Your number <strong>${number}</strong> has survived maximum annoyance.<br>` +
    `<small>Hit "Reset" if you want to suffer again.</small>`;
}


// =========================
// VALIDATE → CONFIRM SUCCESS FLOW
// =========================

function handleValidateSuccess() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  destroyValidateButtons();
  clearNextHighlight();

  const number = getCurrentNumber();
  phase = "confirm";

  // Timer for Yes/No phase
  timeLeft = CONFIRM_TIME;
  timeSpeed = 1;
  updateTimerDisplay();
  startTimer();

  resultEl.innerHTML =
    `Is this your number? <strong>${number}</strong><br>` +
    `<small>You have ${CONFIRM_TIME} seconds to answer. Good luck catching "Yes".</small>`;

  createConfirmButtons(number);
}


// =========================
// GAME RESET
// =========================

function resetGame(message) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  if (cooldownId) {
    clearTimeout(cooldownId);
    cooldownId = null;
  }

  destroyValidateButtons();
  destroyConfirmButtons();

  isLocked = false;
  hasStarted = false;
  phase = "entry";

  inputs.forEach(i => {
    i.classList.remove("locked");
    i.value = "";
  });

  timeLeft = BASE_TIME;
  timeSpeed = 1;
  updateTimerDisplay();

  currentIndex = 0;
  placeInputsRandomly();
  setNextHighlight();

  resultEl.textContent =
    message ||
    "Type your phone number before the bomb explodes! (Timer starts after first digit)";

  const c = getCurrentInput();
  if (c) c.focus();
}


// =========================
// INPUT BEHAVIOUR
// =========================

inputs.forEach(input => {
  input.addEventListener("paste", e => e.preventDefault());
  input.addEventListener("drop", e => e.preventDefault());
  input.addEventListener("contextmenu", e => e.preventDefault());

  input.addEventListener("focus", () => {
    if (isLocked || phase !== "entry") {
      input.blur();
      return;
    }
    const logical = Number(input.dataset.logicalIndex);
    if (logical !== currentIndex && currentIndex !== -1) {
      input.blur();
      const current = getCurrentInput();
      if (current) {
        current.classList.add("error");
        setTimeout(() => current.classList.remove("error"), 150);
        current.focus();
      }
    }
  });

  input.addEventListener("keydown", e => {
    if (isLocked || phase !== "entry") {
      e.preventDefault();
      return;
    }

    const allowedKeys = ["Backspace", "Delete"];
    const logical = Number(input.dataset.logicalIndex);

    if (["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (logical !== currentIndex) {
      e.preventDefault();
      input.classList.add("error");
      setTimeout(() => input.classList.remove("error"), 150);
      return;
    }

    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      input.classList.add("error");
      setTimeout(() => input.classList.remove("error"), 150);
    }

    if (allowedKeys.includes(e.key)) {
      e.preventDefault();
      input.value = "";
      updateResult();
    }
  });

  input.addEventListener("input", () => {
    if (isLocked || phase !== "entry") {
      input.value = "";
      return;
    }

    const logical = Number(input.dataset.logicalIndex);
    if (logical !== currentIndex) {
      input.value = "";
      return;
    }

    let v = input.value;
    if (v.length > 1) {
      v = v.slice(-1);
      input.value = v;
    }

    if (!/^[0-9]$/.test(v)) {
      input.value = "";
      input.classList.add("error");
      setTimeout(() => input.classList.remove("error"), 150);
      return;
    }

    // First digit: start the entry bomb
    if (!hasStarted) {
      hasStarted = true;
      startTimer();
    }

    accelerateTimer();

    input.blur();
    updateResult();

    const next = findNextEmptyLogicalIndex();
    if (next === null) return;

    currentIndex = next;
    placeInputsRandomly();
    setNextHighlight();
  });
});


// =========================
// RESET BUTTON + INIT
// =========================

resetBtn.addEventListener("click", () => {
  resetGame("🔁 Manual reset. Try again!");
});

window.addEventListener("load", () => {
  resetGame();
});
