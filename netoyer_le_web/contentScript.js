console.log("[Platon Cleaner] contentScript chargé sur", window.location.href);

let editMode = false;
let highlightedElement = null;
let badgeRoot = null;
let domObserver = null;   // Observer pour les sites dynamiques (YouTube, Gmail, etc.)

/* ========= 1. CLÉS DE STOCKAGE ========= */

const STORAGE_KEY = "platonRules";              // Règles de masquage
const GROW_STORAGE_KEY = "platonGrowRules";     // Règles d'agrandissement
const DISABLED_DOMAINS_KEY = "platonDisabledDomains";
const GLOBAL_DISABLED_KEY = "platonGlobalDisabled";

/* ========= 2. OUTILS DE STOCKAGE ========= */

function getDomain() {
  return window.location.hostname;
}

/* --- Masquage --- */

function loadAllHideRules(callback) {
  chrome.storage.local.get([STORAGE_KEY], (data) => {
    const rules = data[STORAGE_KEY] || {};
    callback(rules);
  });
}

function saveAllHideRules(rules, callback) {
  const obj = {};
  obj[STORAGE_KEY] = rules;
  chrome.storage.local.set(obj, () => {
    if (callback) callback();
  });
}

function addHideRuleForDomain(domain, selector) {
  loadAllHideRules((rules) => {
    if (!rules[domain]) rules[domain] = [];
    if (!rules[domain].includes(selector)) {
      rules[domain].push(selector);
      console.log("[Platon Cleaner] Règle de masquage ajoutée pour", domain, ":", selector);
      saveAllHideRules(rules);
    } else {
      console.log("[Platon Cleaner] Règle de masquage déjà existante :", selector);
    }
  });
}

/* --- Agrandissement --- */

function loadAllGrowRules(callback) {
  chrome.storage.local.get([GROW_STORAGE_KEY], (data) => {
    const rules = data[GROW_STORAGE_KEY] || {};
    callback(rules);
  });
}

function saveAllGrowRules(rules, callback) {
  const obj = {};
  obj[GROW_STORAGE_KEY] = rules;
  chrome.storage.local.set(obj, () => {
    if (callback) callback();
  });
}

function addGrowRuleForDomain(domain, selector) {
  loadAllGrowRules((rules) => {
    if (!rules[domain]) rules[domain] = [];
    if (!rules[domain].includes(selector)) {
      rules[domain].push(selector);
      console.log("[Platon Cleaner] Règle d'agrandissement ajoutée pour", domain, ":", selector);
      saveAllGrowRules(rules);
    } else {
      console.log("[Platon Cleaner] Règle d'agrandissement déjà existante :", selector);
    }
  });
}

/* --- Reset --- */

function resetDomain(domain, callback) {
  loadAllHideRules((hideRules) => {
    loadAllGrowRules((growRules) => {
      if (hideRules[domain]) {
        delete hideRules[domain];
        console.log("[Platon Cleaner] Règles de masquage supprimées pour", domain);
      }
      if (growRules[domain]) {
        delete growRules[domain];
        console.log("[Platon Cleaner] Règles d'agrandissement supprimées pour", domain);
      }
      saveAllHideRules(hideRules, () => {
        saveAllGrowRules(growRules, () => {
          if (callback) callback();
        });
      });
    });
  });
}

function resetAll(callback) {
  const empty = {};
  saveAllHideRules(empty, () => {
    saveAllGrowRules(empty, () => {
      console.log("[Platon Cleaner] Toutes les règles ont été réinitialisées (masquage + agrandissement)");
      if (callback) callback();
    });
  });
}

// Résumé global (pour la page d'options : on ne considère pour l'instant que les masquages)
function getRulesSummary(callback) {
  loadAllHideRules((rules) => {
    callback(rules);
  });
}

/* --- Désactivation par site / globale --- */

function isSiteDisabled(domain, callback) {
  chrome.storage.local.get([DISABLED_DOMAINS_KEY], (data) => {
    const map = data[DISABLED_DOMAINS_KEY] || {};
    callback(Boolean(map[domain]));
  });
}

function setSiteDisabled(domain, disabled, callback) {
  chrome.storage.local.get([DISABLED_DOMAINS_KEY], (data) => {
    const map = data[DISABLED_DOMAINS_KEY] || {};
    if (disabled) {
      map[domain] = true;
    } else {
      delete map[domain];
    }
    const obj = {};
    obj[DISABLED_DOMAINS_KEY] = map;
    chrome.storage.local.set(obj, () => callback && callback());
  });
}

function isGlobalDisabled(callback) {
  chrome.storage.local.get([GLOBAL_DISABLED_KEY], (data) => {
    callback(Boolean(data[GLOBAL_DISABLED_KEY]));
  });
}

function setGlobalDisabled(disabled, callback) {
  const obj = {};
  obj[GLOBAL_DISABLED_KEY] = !!disabled;
  chrome.storage.local.set(obj, () => callback && callback());
}

/* ========= 3. MASQUER / MONTRER / AGRANDIR ========= */

function hideElement(el) {
  if (!el) return;

  // On mémorise le display d'origine une seule fois
  if (el.dataset.platonHidden !== "1") {
    el.dataset.platonDisplayBefore = el.style.display || "";
  }

  el.dataset.platonHidden = "1";
  el.style.display = "none";
}

function showElement(el) {
  if (!el || el.dataset.platonHidden !== "1") return;
  el.style.display = el.dataset.platonDisplayBefore || "";
}

/* --- Agrandissement des blocs --- */

function growElement(el) {
  if (!el) return;

  if (el.dataset.platonGrow === "1") {
    // déjà agrandi
    return;
  }

  // On mémorise quelques styles importants
  el.dataset.platonGrow = "1";
  el.dataset.platonGrowWidth = el.style.width || "";
  el.dataset.platonGrowMaxWidth = el.style.maxWidth || "";
  el.dataset.platonGrowFlex = el.style.flex || "";
  el.dataset.platonGrowGridColumn = el.style.gridColumn || "";
  el.dataset.platonGrowMargin = el.style.margin || "";
  el.dataset.platonGrowDisplay = el.style.display || "";

  // On essaie de lui donner le plus de place possible
  el.style.display = "block";
  el.style.width = "100%";
  el.style.maxWidth = "none";
  el.style.flex = "1 1 auto";
  el.style.gridColumn = "1 / -1";
  el.style.margin = "0 auto";
}

function restoreElementSize(el) {
  if (!el || el.dataset.platonGrow !== "1") return;

  el.style.width = el.dataset.platonGrowWidth || "";
  el.style.maxWidth = el.dataset.platonGrowMaxWidth || "";
  el.style.flex = el.dataset.platonGrowFlex || "";
  el.style.gridColumn = el.dataset.platonGrowGridColumn || "";
  el.style.margin = el.dataset.platonGrowMargin || "";
  el.style.display = el.dataset.platonGrowDisplay || "";

  delete el.dataset.platonGrow;
  delete el.dataset.platonGrowWidth;
  delete el.dataset.platonGrowMaxWidth;
  delete el.dataset.platonGrowFlex;
  delete el.dataset.platonGrowGridColumn;
  delete el.dataset.platonGrowMargin;
  delete el.dataset.platonGrowDisplay;
}

/* ========= 4. APPLICATION DES RÈGLES ========= */

function applyHideSelectors(selectors) {
  let hiddenCount = 0;

  selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        hideElement(el);
        hiddenCount++;
      });
    } catch (e) {
      console.warn("[Platon Cleaner] Sélecteur de masquage invalide :", selector);
    }
  });

  return hiddenCount;
}

function applyGrowSelectors(selectors) {
  selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        growElement(el);
      });
    } catch (e) {
      console.warn("[Platon Cleaner] Sélecteur d'agrandissement invalide :", selector);
    }
  });
}

/**
 * Crée un MutationObserver pour ré-appliquer les règles quand le DOM change.
 * (masquage + agrandissement)
 */
function setupDomObserver(hideSelectors, growSelectors) {
  if (!document.body) return;

  if (domObserver) {
    domObserver.disconnect();
    domObserver = null;
  }

  const allSelectors = [
    ...(hideSelectors || []),
    ...(growSelectors || [])
  ];
  if (allSelectors.length === 0) return;

  domObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        // Masquage
        hideSelectors.forEach((selector) => {
          try {
            if (node.matches && node.matches(selector)) hideElement(node);
            node.querySelectorAll && node.querySelectorAll(selector).forEach(hideElement);
          } catch (e) {}
        });

        // Agrandissement
        growSelectors.forEach((selector) => {
          try {
            if (node.matches && node.matches(selector)) growElement(node);
            node.querySelectorAll && node.querySelectorAll(selector).forEach(growElement);
          } catch (e) {}
        });
      });
    }
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[Platon Cleaner] MutationObserver actif pour ce domaine (hide + grow).");
}

function applyRulesForCurrentDomain() {
  const domain = getDomain();

  isGlobalDisabled((globalDisabled) => {
    if (globalDisabled) {
      console.log("[Platon Cleaner] Nettoyage global désactivé.");
      setupBadge(0);
      if (domObserver) {
        domObserver.disconnect();
        domObserver = null;
      }
      return;
    }

    isSiteDisabled(domain, (siteDisabled) => {
      if (siteDisabled) {
        console.log("[Platon Cleaner] Nettoyage désactivé sur ce site :", domain);
        setupBadge(0);
        if (domObserver) {
          domObserver.disconnect();
          domObserver = null;
        }
        return;
      }

      loadAllHideRules((hideRules) => {
        loadAllGrowRules((growRules) => {
          const hideSelectors = hideRules[domain] || [];
          const growSelectors = growRules[domain] || [];

          console.log("[Platon Cleaner] Règles masquage pour", domain, ":", hideSelectors);
          console.log("[Platon Cleaner] Règles agrandissement pour", domain, ":", growSelectors);

          const hiddenCount = applyHideSelectors(hideSelectors);
          applyGrowSelectors(growSelectors);

          setupBadge(hiddenCount);
          setupDomObserver(hideSelectors, growSelectors);
        });
      });
    });
  });
}

/* ========= 5. CALCUL DU SÉLECTEUR (spécial YouTube amélioré) ========= */

function getUniqueSelector(el) {
  if (!el) return "";

  // 1) Si l'élément ou un parent a un id (et que ce n'est pas le nôtre), on l'utilise
  let current = el;
  while (current && current !== document.documentElement) {
    if (
      current.id &&
      !current.id.startsWith("platon-cleaner") &&
      !current.id.startsWith("toast-container")
    ) {
      return "#" + current.id;
    }
    current = current.parentElement;
  }

  // 2) Cas particulier YouTube : viser les gros blocs <ytd-...>
  const domain = getDomain();
  if (domain.includes("youtube.com")) {
    current = el;
    while (current && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase();

      if (tag.startsWith("ytd-")) {
        let selector = tag;

        if (current.classList.length > 0) {
          selector += "." + Array.from(current.classList)
            .slice(0, 2)
            .join(".");
        }

        console.log("[Platon Cleaner] Sélecteur YouTube généré :", selector);
        return selector;
      }

      current = current.parentElement;
    }
  }

  // 3) Fallback générique pour les autres sites
  let path = [];
  current = el;

  while (current && current.nodeType === 1 && path.length < 4) {
    let selector = current.nodeName.toLowerCase();

    if (current.classList.length > 0) {
      selector += "." + Array.from(current.classList)
        .slice(0, 2)
        .join(".");
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.nodeName === current.nodeName
      );
      if (siblings.length > 1 && path.length === 0) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  const finalSelector = path.join(" > ");
  console.log("[Platon Cleaner] Sélecteur générique généré :", finalSelector);
  return finalSelector;
}

/* ========= 6. MODE ÉDITION ========= */

function setEditMode(enabled) {
  if (enabled === editMode) return;
  editMode = enabled;

  console.log("[Platon Cleaner] Mode édition =", editMode);

  if (editMode) {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, true);
  } else {
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("mouseout", handleMouseOut);
    document.removeEventListener("click", handleClick, true);
    clearHighlight();
  }
}

function handleMouseOver(e) {
  if (!editMode) return;
  if (e.target.closest && e.target.closest("#platon-cleaner-badge")) return;
  highlightElement(e.target);
}

function handleMouseOut(e) {
  if (!editMode) return;
  clearHighlight();
}

function handleClick(e) {
  if (!editMode) return;
  if (e.target.closest && e.target.closest("#platon-cleaner-badge")) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  const tag = el.tagName.toLowerCase();
  if (tag === "html" || tag === "body") {
    console.log("[Platon Cleaner] Refus de cibler :", tag);
    return;
  }

  const selector = getUniqueSelector(el);
  const domain = getDomain();

  if (e.shiftKey) {
    // SHIFT + clic → agrandir le bloc
    console.log("[Platon Cleaner] Élément cliqué → AGRANDI (Shift+clic) :", el);
    console.log("[Platon Cleaner] Sélecteur agrandissement :", selector);
    addGrowRuleForDomain(domain, selector);
    growElement(el);
  } else {
    // Clic normal → masquer
    console.log("[Platon Cleaner] Élément cliqué → MASQUÉ :", el);
    console.log("[Platon Cleaner] Sélecteur masquage :", selector);
    addHideRuleForDomain(domain, selector);
    hideElement(el);
  }

  clearHighlight();
}

function highlightElement(el) {
  clearHighlight();
  highlightedElement = el;
  highlightedElement.__originalOutline = el.style.outline;
  el.style.outline = "2px solid red";
  el.style.outlineOffset = "2px";
}

function clearHighlight() {
  if (!highlightedElement) return;
  highlightedElement.style.outline =
    highlightedElement.__originalOutline || "";
  highlightedElement = null;
}

/* ========= 7. BADGE D'INFO (AVANT / APRÈS / FERMER) ========= */

function setupBadge(count) {
  if (!document.body) return;

  if (!badgeRoot) {
    badgeRoot = document.createElement("div");
    badgeRoot.id = "platon-cleaner-badge";
    Object.assign(badgeRoot.style, {
      position: "fixed",
      bottom: "10px",
      right: "10px",
      background: "rgba(54,1,108,0.9)",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontFamily: "system-ui, sans-serif",
      zIndex: 2147483647,
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      maxWidth: "260px",
    });

    badgeRoot.innerHTML = `
      <div style="font-weight:bold; margin-bottom:4px;">Platon Cleaner</div>
      <div id="platon-cleaner-count"></div>
      <div style="margin-top:6px; display:flex; gap:4px; flex-wrap:wrap;">
        <button id="platon-cleaner-before"
          style="font-size:11px; padding:2px 6px; border-radius:4px; border:none; cursor:pointer;">
          Avant
        </button>
        <button id="platon-cleaner-after"
          style="font-size:11px; padding:2px 6px; border-radius:4px; border:none; cursor:pointer;">
          Après
        </button>
        <button id="platon-cleaner-close"
          style="font-size:11px; padding:2px 6px; border-radius:4px; border:none; cursor:pointer;">
          Fermer
        </button>
      </div>
    `;

    document.body.appendChild(badgeRoot);

    const beforeBtn = badgeRoot.querySelector("#platon-cleaner-before");
    const afterBtn  = badgeRoot.querySelector("#platon-cleaner-after");
    const closeBtn  = badgeRoot.querySelector("#platon-cleaner-close");

    beforeBtn.addEventListener("click", () => {
      const allHidden = document.querySelectorAll("[data-platon-hidden]");
      allHidden.forEach((el) => {
        showElement(el);   // tout ré-afficher → "Avant"
      });
    });

    afterBtn.addEventListener("click", () => {
      const allHidden = document.querySelectorAll("[data-platon-hidden]");
      allHidden.forEach((el) => {
        hideElement(el);   // re-masquer → "Après"
      });
    });

    closeBtn.addEventListener("click", () => {
      badgeRoot.remove();
      badgeRoot = null;
    });
  }

  const countDiv = badgeRoot.querySelector("#platon-cleaner-count");
  if (count > 0) {
    countDiv.textContent = `${count} élément(s) masqué(s) sur cette page`;
  } else {
    countDiv.textContent = "Aucun élément masqué sur cette page";
  }
}

/* ========= 8. MESSAGES DEPUIS LA POPUP ========= */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const domain = getDomain();

  if (message.type === "TOGGLE_EDIT_MODE") {
    setEditMode(message.enabled);
    sendResponse({ ok: true, editMode });
  }

  else if (message.type === "RESET_CURRENT_SITE") {
    resetDomain(domain, () => {
      sendResponse({ ok: true, reset: "domain", domain });
      window.location.reload();
    });
    return true;
  }

  else if (message.type === "RESET_ALL") {
    resetAll(() => {
      sendResponse({ ok: true, reset: "all" });
      window.location.reload();
    });
    return true;
  }

  else if (message.type === "GET_RULES_SUMMARY") {
    getRulesSummary((rules) => {
      sendResponse({ ok: true, rules });
    });
    return true;
  }

  else if (message.type === "TOGGLE_SITE_DISABLED") {
    setSiteDisabled(domain, message.disabled, () => {
      sendResponse({ ok: true, siteDisabled: message.disabled, domain });
      window.location.reload();
    });
    return true;
  }

  else if (message.type === "TOGGLE_GLOBAL_DISABLED") {
    setGlobalDisabled(message.disabled, () => {
      sendResponse({ ok: true, globalDisabled: message.disabled });
      window.location.reload();
    });
    return true;
  }

  else if (message.type === "GET_STATUS") {
    isGlobalDisabled((globalDisabled) => {
      isSiteDisabled(domain, (siteDisabled) => {
        const hiddenCount = document.querySelectorAll("[data-platon-hidden]").length;
        sendResponse({
          ok: true,
          domain,
          globalDisabled,
          siteDisabled,
          hiddenCount,
        });
      });
    });
    return true;
  }
});

/* ========= 9. GESTION DES SITES SPA (YouTube, Gmail, etc.) ========= */

let lastUrl = location.href;

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("[Platon Cleaner] URL changée → ré-application des règles :", lastUrl);
    applyRulesForCurrentDomain();
  }
}, 1000);

/* ========= 10. AU CHARGEMENT ========= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyRulesForCurrentDomain);
} else {
  applyRulesForCurrentDomain();
}
