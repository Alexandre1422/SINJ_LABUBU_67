// ============================
// RETRO GLITCH ARCADE - PURE JS
// ============================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Create the entire HTML structure programmatically
    createPageStructure();
    
    // Initialize game after page is built
    setTimeout(initGame, 100);
});

// ============================
// PAGE CONSTRUCTION
// ============================

function createPageStructure() {
    // Create main container
    const container = document.createElement('div');
    container.className = 'font-sans min-h-screen flex items-center justify-center p-4 bg-gray-900';
    container.style.backgroundColor = '#0d0d0d';
    
    // Create cabinet frame
    const cabinetFrame = document.createElement('div');
    cabinetFrame.className = 'cabinet-frame bg-cabinet-dark p-6 md:p-10 rounded-xl shadow-2xl max-w-lg w-full';
    cabinetFrame.style.backgroundColor = '#1a1a1a';
    
    // Add animation style for cabinet frame
    const style = document.createElement('style');
    style.textContent = `
        @keyframes color-flicker {
            0%, 100% { filter: hue-rotate(0deg); }
            5% { filter: hue-rotate(5deg); }
            10% { filter: hue-rotate(-5deg); }
            15% { filter: hue-rotate(2deg); }
            20% { filter: hue-rotate(-3deg); }
            95% { filter: hue-rotate(1deg); }
        }
        
        .cabinet-frame {
            animation: color-flicker 10s infinite alternate;
        }
        
        .crt-screen-container {
            position: relative;
            background-color: #001500;
            box-shadow: 0 0 40px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.2);
            border-radius: 5% / 15%;
            overflow: hidden;
            border: 8px solid #0a0a0a;
            transition: opacity 0.5s ease-out; /* Added for fade effect */
        }
        
        .crt-screen-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.3),
                rgba(0, 0, 0, 0.1) 1px,
                transparent 1px,
                transparent 3px
            );
            z-index: 10;
            opacity: 0.5;
            filter: blur(0.5px);
        }
        
        .crt-screen-container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: radial-gradient(circle, transparent 75%, rgba(0, 255, 0, 0.1) 100%);
            z-index: 11;
        }
        
        #player-indicator {
            transition: transform 0.1s;
        }
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .font-arcade {
            font-family: 'Press Start 2P', monospace;
        }
        
        /* Added transition to header score and info panel */
        #header-score, #info-panel {
            transition: opacity 0.5s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Create header/marquee
    const header = document.createElement('header');
    header.className = 'text-center mb-6';
    
    const title = document.createElement('h1');
    title.className = 'font-arcade text-3xl md:text-5xl text-crt-green uppercase tracking-wider leading-none';
    title.textContent = 'GLITCH MAZE';
    title.style.color = '#00ff00';
    title.style.textShadow = '0 0 10px #00ff00, 0 0 20px #005500';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'font-arcade text-xs text-cabinet-accent mt-2';
    subtitle.textContent = 'INSERT COIN • SCORE: 0';
    subtitle.id = 'header-score';
    subtitle.style.color = '#cc0000';
    
    header.appendChild(title);
    header.appendChild(subtitle);
    cabinetFrame.appendChild(header);
    
    // Create CRT screen container
    const crtContainer = document.createElement('div');
    crtContainer.className = 'crt-screen-container aspect-square w-full';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.className = 'w-full h-full block';
    crtContainer.appendChild(canvas);
    
    // Create controls indicator
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';
    controlsDiv.className = 'bottom-0 left-0 w-full p-4 flex justify-center space-x-4 bg-cabinet-dark/50';
    controlsDiv.style.backgroundColor = 'rgba(26, 26, 26, 0.5)';
    
    const playerIndicator = document.createElement('div');
    playerIndicator.id = 'player-indicator';
    
    controlsDiv.appendChild(playerIndicator);
    crtContainer.appendChild(controlsDiv);
    cabinetFrame.appendChild(crtContainer);
    
    // Create info panel with score display
    const infoPanel = document.createElement('div');
    infoPanel.id = 'info-panel'; // Added ID
    infoPanel.className = 'mt-6 p-3 bg-cabinet-dark/80 rounded-lg border border-cabinet-accent shadow-inner';
    infoPanel.style.backgroundColor = 'rgba(26, 26, 26, 0.8)';
    infoPanel.style.borderColor = '#cc0000';

    // Create a container for multiple info lines
    const infoContainer = document.createElement('div');
    infoContainer.className = 'space-y-1';

    // Score display (always visible at the top)
    const scoreDisplay = document.createElement('p');
    scoreDisplay.id = 'score-display';
    scoreDisplay.className = 'font-arcade text-sm text-crt-green text-center';
    scoreDisplay.style.color = '#00ff00';
    scoreDisplay.innerHTML = 'SCORE: <span id="score">0</span> | DOTS: <span id="dots-count">0</span>/<span id="total-dots">0</span>';

    // Controls display
    const controlsDisplay = document.createElement('p');
    controlsDisplay.className = 'font-arcade text-xs text-crt-green text-center';
    controlsDisplay.style.color = '#00ff00';
    controlsDisplay.innerHTML = 'WASD / ARROWS TO MOVE | WALLS CHANGE IN <span id="timer">5</span>S';

    // Status message (for temporary messages)
    const statusMessage = document.createElement('p');
    statusMessage.id = 'status-message';
    statusMessage.className = 'font-arcade text-xs text-cabinet-accent text-center mt-1';
    statusMessage.style.color = '#cc0000';

    // Assemble the info panel
    infoContainer.appendChild(scoreDisplay);
    infoContainer.appendChild(controlsDisplay);
    infoContainer.appendChild(statusMessage);
    infoPanel.appendChild(infoContainer);
    cabinetFrame.appendChild(infoPanel);

    // Assemble the page
    container.appendChild(cabinetFrame);
    document.body.appendChild(container);
    
    // Load required fonts
    loadFonts();
}

function loadFonts() {
    // Create link elements for fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Load Tailwind CSS
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    tailwindScript.onload = function() {
        // Configure Tailwind after it loads
        if (typeof tailwind !== 'undefined') {
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Inter', 'sans-serif'],
                            arcade: ['"Press Start 2P"', 'monospace'],
                        },
                        colors: {
                            'crt-green': '#00ff00',
                            'crt-bg': '#001500',
                            'cabinet-dark': '#1a1a1a',
                            'cabinet-accent': '#cc0000',
                        }
                    }
                }
            };
        }
    };
    document.head.appendChild(tailwindScript);
}

// ============================
// GAME LOGIC
// ============================

// Game Constants
const GRID_SIZE = 15;
let TILE_SIZE = 0;
const WALL_COLOR = 'rgba(0, 255, 0, 0.8)';
const PLAYER_COLOR = 'rgb(255, 255, 0)';
const GLITCH_INTERVAL = 100;
const WALL_CHANGE_TIME = 3600;

// Variables pour l'image Pac-Man (À AJOUTER)
let pacmanImage = new Image();
let pacmanImageLoaded = false;

// Game State
let canvas, ctx;
let gameWidth, gameHeight;
let playerX = 7, playerY = 7;
let playerDrawX, playerDrawY;
let wallConfigIndex = 0;
let wallTimer = WALL_CHANGE_TIME;
let wallTimerInterval;
let keys = {};
let isMoving = false;

// Wall configurations
const wallConfigs = [
    [
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    ],
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    [
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
];

// Utility Functions
function loadPacmanImage() {
    pacmanImage.onload = function() {
        pacmanImageLoaded = true;
        console.log("Pac-Man image (ubo.png) loaded successfully.");
    };
    
    // Le chemin est 'ubo.png' car il est dans le même répertoire
    pacmanImage.src = 'ubo.png'; 

    pacmanImage.onerror = function() {
        console.error("Échec du chargement de l'image Pac-Man: ubo.png. Utilisation du cercle de repli.");
    };
}
function resizeCanvas() {
    const container = document.querySelector('.crt-screen-container');
    if (!container) return;

    const size = container.clientWidth;
    canvas.width = size;
    canvas.height = size;
    gameWidth = size;
    gameHeight = size;
    TILE_SIZE = gameWidth / GRID_SIZE;

    playerDrawX = (playerX + 0.5) * TILE_SIZE;
    playerDrawY = (playerY + 0.5) * TILE_SIZE;
    shadows.forEach(shadow => {
    shadow.drawX = (shadow.x + 0.5) * TILE_SIZE;
    shadow.drawY = (shadow.y + 0.5) * TILE_SIZE;
 })
    dots.forEach(dot => {
    dot.drawX = (dot.x + 0.5) * TILE_SIZE;
    dot.drawY = (dot.y + 0.5) * TILE_SIZE;
});
}

function drawMaze() {
    const currentMaze = wallConfigs[wallConfigIndex];
    ctx.fillStyle = WALL_COLOR;

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (currentMaze[y][x] === 1) {
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    // Les positions sont basées sur le centre du joueur
    const TILE_CENTER_X = playerDrawX; 
    const TILE_CENTER_Y = playerDrawY;
    
    // La taille du dessin (90% de la taille de la tuile)
    const DRAW_SIZE = TILE_SIZE * 0.9; 
    
    // Calcul des coordonnées du coin supérieur gauche pour centrer l'image
    const DRAW_X = TILE_CENTER_X - DRAW_SIZE / 2;
    const DRAW_Y = TILE_CENTER_Y - DRAW_SIZE / 2;
    
    if (pacmanImageLoaded) {
        // Dessiner l'image (ubo.png)
        // ctx.drawImage(image, x, y, width, height);
        ctx.drawImage(pacmanImage, DRAW_X, DRAW_Y, DRAW_SIZE, DRAW_SIZE);
    } else {
        // Option de repli (fallback) si l'image n'est pas chargée (dessin d'un cercle avec effet de lueur)
        const radius = DRAW_SIZE / 2;
        ctx.fillStyle = PLAYER_COLOR; 
        
        // Dessin du cercle de base
        ctx.beginPath();
        ctx.arc(TILE_CENTER_X, TILE_CENTER_Y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Dessin de l'effet de lueur (comme dans votre ancienne fonction)
        ctx.shadowBlur = 10;
        ctx.shadowColor = PLAYER_COLOR;
        ctx.fillStyle = PLAYER_COLOR;
        
        ctx.beginPath();
        ctx.arc(TILE_CENTER_X, TILE_CENTER_Y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

function applyGlitchEffect(timestamp) {
    if (Math.random() < 0.05) {
        const shift = (Math.random() - 0.5) * 5;
        ctx.translate(shift, 0);
    }
    
    const imageData = ctx.getImageData(0, 0, gameWidth, gameHeight);
    const data = imageData.data;
    const shiftAmount = Math.random() < 0.5 ? 2 : -2;

    for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.01) {
            data[i + 1] = data[i + 1] + shiftAmount * 10;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function gameLoop(timestamp) {
    ctx.fillStyle = '#001500';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.save();
    drawMaze();
    drawDots();
    checkDotCollection();
    moveShadows(timestamp);
    shadows.forEach(shadow => drawShadow(shadow));
    drawPlayer();
    ctx.restore();
    
    if (timestamp % GLITCH_INTERVAL < 16) {
        applyGlitchEffect(timestamp);
    }

    requestAnimationFrame(gameLoop);
}

// Input and Movement
function handleKeyDown(e) {
    keys[e.key] = true;
    movePlayer();
    e.preventDefault();
}

function handleKeyUp(e) {
    keys[e.key] = false;
    isMoving = false;
}

function movePlayer() {
    if (isMoving || !gameActive) return;

    let newX = playerX;
    let newY = playerY;

    if (keys['ArrowUp'] || keys['w']) newY = Math.max(0, playerY - 1);
    else if (keys['ArrowDown'] || keys['s']) newY = Math.min(GRID_SIZE - 1, playerY + 1);
    else if (keys['ArrowLeft'] || keys['a']) newX = Math.max(0, playerX - 1);
    else if (keys['ArrowRight'] || keys['d']) newX = Math.min(GRID_SIZE - 1, playerX + 1);
    else return;

    const currentMaze = wallConfigs[wallConfigIndex];

    if (currentMaze[newY][newX] === 0) {
        playerX = newX;
        playerY = newY;
        isMoving = true;

        // Keep the player indicator lines
        const indicator = document.getElementById('player-indicator');
        const containerSize = document.querySelector('.crt-screen-container').clientWidth;
        const normalizedX = playerX / (GRID_SIZE - 1);
        indicator.style.transform = `translateX(${normalizedX * (containerSize - indicator.clientWidth) * 0.8 - (containerSize * 0.4)}px)`;
        
        // ADD SHADOW COLLISION CHECK HERE:
        shadows.forEach(shadow => {
            if (shadow.x === playerX && shadow.y === playerY && gameActive) {
                gameOver();
            }
        });
        
    } else {
        const statusMessage = document.getElementById('status-message');
        statusMessage.innerText = "BLOCKED! WALL COLLISION.";
        setTimeout(() => {
            if (gameActive) statusMessage.innerText = "";
        }, 500);
    }

    playerDrawX = (playerX + 0.5) * TILE_SIZE;
    playerDrawY = (playerY + 0.5) * TILE_SIZE;
}

// Dynamic Wall Change Logic
function startWallTimer() {
    if (wallTimerInterval) clearInterval(wallTimerInterval);

    wallTimer = WALL_CHANGE_TIME;
    document.getElementById('timer').innerText = wallTimer;

    wallTimerInterval = setInterval(() => {
        wallTimer--;
        document.getElementById('timer').innerText = wallTimer;

        if (wallTimer <= 0) {
            changeWalls();
            wallTimer = WALL_CHANGE_TIME;
            document.getElementById('timer').innerText = wallTimer;
        }
    }, 1000);
}

function changeWalls() {
    const previousIndex = wallConfigIndex;
    wallConfigIndex = (wallConfigIndex + 1) % wallConfigs.length;

    const newMaze = wallConfigs[wallConfigIndex];
    const statusMessage = document.getElementById('status-message');
    
    if (newMaze[playerY][playerX] === 1) {
        playerX = 7;
        playerY = 7;
        playerDrawX = (playerX + 0.5) * TILE_SIZE;
        playerDrawY = (playerY + 0.5) * TILE_SIZE;
        statusMessage.innerText = "TELEPORTED! WALLS SHIFTED!";
        setTimeout(() => statusMessage.innerText = "", 1500);
    } else {
        statusMessage.innerText = `MAZE ${previousIndex + 1} LOADED (GLITCH).`;
        setTimeout(() => statusMessage.innerText = "", 1500);
    }
    initShadows();
    initDots(); // Reset dots when walls change
}

// Initialization

const SHADOW_COLORS = ['#FF0000', '#FF69B4', '#00FFFF', '#FFA500'];
const SHADOW_NAMES = ['meta', 'google', 'Apple', 'Amazon'];
let gameActive = true;
let shadows = [];
let enemyMoveTimer = 0;
const ENEMY_MOVE_INTERVAL = 500;

// NEW: Pixel Art Logo Drawing Logic
// NEW: Pixel Art Logo Drawing Logic - UPGRADED TO 7x7
// NEW: Pixel Art Logo Drawing Logic - UPGRADED TO 12x12 with Accurate Colors
// NEW: Pixel Art Logo Drawing Logic - UPGRADED TO 12x12 with WHITE Background
// NEW: Pixel Art Logo Drawing Logic - UPGRADED TO 12x12 with Specific Brand Colors/Style
// NEW: Pixel Art Logo Drawing Logic - UPGRADED TO 12x12 with Specific Brand Colors/Style
function drawLogo(ctx, shadow, TILE_SIZE) {
    const PIXEL_GRID_SIZE = 12; // La grille de logo est 12x12
    const LOGO_SIZE = TILE_SIZE * 0.9;
    const PIXEL_SIZE = LOGO_SIZE / PIXEL_GRID_SIZE;
    const offsetX = shadow.drawX - LOGO_SIZE / 2;
    const offsetY = shadow.drawY - LOGO_SIZE / 2;

    let logoData = []; 
    let colors = {};

    // DÉFINITION CLÉ : Le blanc est la couleur de fond (index 0)
    colors[0] = '#FFFFFF'; 

    // Le nom du fantôme détermine le logo et la palette de couleurs
    switch (shadow.name) {
        case 'meta': // META (Symbole de l'infini - Entièrement Bleu)
            logoData = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 2, 1, 1, 1, 1, 2, 2, 0, 0],
                [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
                [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
                [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
                [0, 0, 2, 2, 1, 1, 1, 1, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            // Les deux sections (1 et 2) sont le bleu Meta
            colors[1] = '#0078F3'; 
            colors[2] = '#0078F3'; 
            break;

        case 'google': // GOOGLE (Lettre G - 4 Couleurs)
            logoData = [
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0], // Bleu
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0], // Bleu/Rouge
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Bleu/Rouge
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // Rouge
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // Rouge
                [1, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3], // Jaune
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4], // Vert
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4], // Vert
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Vert
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0], // Vert
                [0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0], // Vert
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            colors[1] = '#4285F4'; // Bleu Google
            colors[2] = '#EA4335'; // Rouge Google
            colors[3] = '#FBBC05'; // Jaune Google
            colors[4] = '#34A853'; // Vert Google
            break;

        case 'Apple': // APPLE (Pomme croquée - Noir)
            logoData = [
                [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0], // Tige
                [0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0], // Feuille
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            colors[1] = '#000000'; // Noir Apple
            colors[2] = '#000000'; // Noir pour la tige/tête de feuille
            break;

        case 'amazon': // AMAZON (Lettre 'a' minuscule + Sourire/Flèche)
            logoData = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0], // Boucle 'a' top
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], 
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], // Boucle 'a' bottom
                [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], // Tige 'a'
                [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0], // Sourire Orange (Flèche)
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            colors[1] = '#131921'; // Noir Amazon
            colors[2] = '#FF9900'; // Orange Amazon
            break;

        default:
            return; 
    }

    // DESSINER LES PIXELS (y compris le fond blanc)
    for (let y = 0; y < PIXEL_GRID_SIZE; y++) {
        for (let x = 0; x < PIXEL_GRID_SIZE; x++) {
            const pixelType = logoData[y][x];
            
            const color = colors[pixelType];
            
            ctx.fillStyle = color;
            ctx.fillRect(
                offsetX + x * PIXEL_SIZE,
                offsetY + y * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE
            );
        }
    }
    
    // Ajouter l'effet CRT/Contour (pour encadrer le logo)
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, LOGO_SIZE, LOGO_SIZE);
    ctx.stroke();
}


function initShadows() {
    shadows = [];
    const startPositions = [
        {x: 1, y: 1}, {x: 13, y: 1}, 
        {x: 1, y: 13}, {x: 13, y: 13}
    ];
    
    for (let i = 0; i < SHADOW_COLORS.length; i++) {
        const name = SHADOW_NAMES[i];
        const shadow = {
            x: startPositions[i].x,
            y: startPositions[i].y,
            color: SHADOW_COLORS[i],
            name: name, // Name is used to select the logo
            drawX: (startPositions[i].x + 0.5) * TILE_SIZE,
            drawY: (startPositions[i].y + 0.5) * TILE_SIZE,
            direction: Math.floor(Math.random() * 4),
        };

        shadows.push(shadow);
    }
    updateEnemyCount();
}

function drawShadow(shadow) {
    // NEW: We call the drawLogo function which handles the pixel art rendering
    drawLogo(ctx, shadow, TILE_SIZE);
    
    // Add a central glow effect for the aura
    ctx.shadowBlur = 15;
    ctx.shadowColor = shadow.color;
    ctx.beginPath();
    ctx.arc(shadow.drawX, shadow.drawY, TILE_SIZE * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function moveShadows(timestamp) {
    if (!gameActive) return;
    
    if (timestamp - enemyMoveTimer > ENEMY_MOVE_INTERVAL) {
        enemyMoveTimer = timestamp;
        const currentMaze = wallConfigs[wallConfigIndex];
        
        shadows.forEach(shadow => {
            let newX = shadow.x, newY = shadow.y;
            switch(shadow.direction) {
                case 0: newY--; break;
                case 1: newX++; break;
                case 2: newY++; break;
                case 3: newX--; break;
            }
            
            newX = Math.max(0, Math.min(GRID_SIZE - 1, newX));
            newY = Math.max(0, Math.min(GRID_SIZE - 1, newY));
            
            if (currentMaze[newY][newX] === 0) {
                shadow.x = newX;
                shadow.y = newY;
            } else {
                shadow.direction = Math.floor(Math.random() * 4);
            }
            
            if (Math.random() < 0.3) shadow.direction = Math.floor(Math.random() * 4);
            
            shadow.drawX = (shadow.x + 0.5) * TILE_SIZE;
            shadow.drawY = (shadow.y + 0.5) * TILE_SIZE;
            
            if (shadow.x === playerX && shadow.y === playerY && gameActive) {
                gameOver();
            }
        });
    }
}

function gameOver() {
    gameActive = false;
    const statusMessage = document.getElementById('status-message');
    statusMessage.style.color = '#FF0000';
    statusMessage.innerText = "GAME OVER! SHADOW CAUGHT YOU!";
    
    // Show the game over screen after a short delay
    setTimeout(() => {
        showGameOverScreen();
    }, 800);
}

function restartGame() {
    playerX = playerY = 7;
    gameActive = true;
    initShadows();
    document.getElementById('status-message').style.color = '#cc0000';
    document.getElementById('status-message').innerText = "";
    score = 0; // Reset score
    initDots(); // Reinitialize dots
}

function updateEnemyCount() {
    const elem = document.getElementById('enemy-count');
    if (elem) elem.textContent = shadows.length;
}
// ============================
// DOTS AND SCORE SYSTEM
// ============================

let dots = [];
let score = 0;
const DOT_COLOR = '#FF69B4'; // Pink
const DOT_RADIUS_RATIO = 0.15; // 15% of tile size

function initDots() {
    dots = [];
    const currentMaze = wallConfigs[wallConfigIndex];
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // Only place dots in open spaces (not walls) and not on player/shadow starting positions
            if (currentMaze[y][x] === 0) {
                // Don't put dots where shadows start
                const isShadowStart = 
                    (x === 1 && y === 1) || 
                    (x === 13 && y === 1) || 
                    (x === 1 && y === 13) || 
                    (x === 13 && y === 13);
                
                // Don't put dot in center starting position
                const isCenterStart = (x === 7 && y === 7);
                
                if (!isShadowStart && !isCenterStart) {
                    dots.push({
                        x: x,
                        y: y,
                        collected: false,
                        drawX: (x + 0.5) * TILE_SIZE,
                        drawY: (y + 0.5) * TILE_SIZE
                    });
                }
            }
        }
    }
    updateScoreDisplay();
    updateHeaderScore();
}

function drawDots() {
    const dotRadius = TILE_SIZE * DOT_RADIUS_RATIO;
    ctx.fillStyle = DOT_COLOR;
    
    dots.forEach(dot => {
        if (!dot.collected) {
            // Draw the dot with a subtle glow
            ctx.beginPath();
            ctx.arc(dot.drawX, dot.drawY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Add a small highlight for a 3D effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(dot.drawX - dotRadius * 0.3, dot.drawY - dotRadius * 0.3, dotRadius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = DOT_COLOR; // Reset color
        }
    });
}

function checkDotCollection() {
    if (!gameActive) return;
    
    dots.forEach(dot => {
        if (!dot.collected && dot.x === playerX && dot.y === playerY) {
            dot.collected = true;
            score += 10;
            updateScoreDisplay();
            
        }
    });
    
    // Check for win condition (all dots collected)
    const remainingDots = dots.filter(dot => !dot.collected).length;
    if (remainingDots === 0 && gameActive) {
        winGame();
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    const dotsCountElement = document.getElementById('dots-count');
    const totalDotsElement = document.getElementById('total-dots');
    
    if (scoreElement && dotsCountElement && totalDotsElement) {
        const remainingDots = dots.filter(dot => !dot.collected).length;
        scoreElement.textContent = score;
        dotsCountElement.textContent = remainingDots;
        totalDotsElement.textContent = dots.length;
    }
    updateHeaderScore()
}
function updateHeaderScore() {
    const headerScore = document.getElementById('header-score');
    if (headerScore) {
        const remainingDots = dots.filter(dot => !dot.collected).length;
        headerScore.textContent = `INSERT COIN • SCORE: ${score} • DOTS: ${remainingDots}/${dots.length}`;
    }
}
// ============================
// GAME OVER SCREEN
// ============================

function showGameOverScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    
    // --- NEW LOGIC: Hide background elements ---
    const headerScore = document.getElementById('header-score');
    const crtContainer = document.querySelector('.crt-screen-container');
    const infoPanel = document.getElementById('info-panel');
    const cabinetFrame = document.querySelector('.cabinet-frame');
    
    // Set opacity to 0 to make them disappear
    if (headerScore) headerScore.style.opacity = '0';
    if (crtContainer) crtContainer.style.opacity = '0';
    if (infoPanel) infoPanel.style.opacity = '0';

    // CSS for the overlay to cover the whole cabinet frame
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 21, 0, 0.95);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Press Start 2P', monospace;
        color: #ff0000;
        text-shadow: 0 0 10px #ff0000;
        pointer-events: auto;
    `;
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
            from { transform: translateY(0px); }
            to { transform: translateY(-10px); }
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
    
    // Game Over Text
    const gameOverText = document.createElement('h1');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.style.cssText = `
        font-size: 2.5rem;
        margin-bottom: 2rem;
        animation: pulse 1s infinite;
    `;
    
    // Final Score
    const finalScore = document.createElement('h2');
    finalScore.textContent = `FINAL SCORE: ${score}`;
    finalScore.style.cssText = `
        color: #ffff00;
        font-size: 1.5rem;
        margin-bottom: 3rem;
        text-shadow: 0 0 10px #ffff00;
    `;
    
    // Laughing shadows container
    const shadowsContainer = document.createElement('div');
    shadowsContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 3rem;
        flex-wrap: wrap;
    `;
    
    // Create laughing shadow icons
    const shadowColors = ['#FF0000', '#FF69B4', '#00FFFF', '#FFA500'];
    const shadowNames = ['meta', 'google', 'Apple', 'amazon'];
    
    shadowColors.forEach((color, index) => {
        const shadowIcon = document.createElement('div');
        shadowIcon.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        `;
        
       // =========================================================================
    // MODIFICATION CLÉ: Création des logos sur des canvas individuels
    // =========================================================================
    const LOGO_DISPLAY_SIZE = 60; // Taille fixe pour l'affichage du logo (en pixels)

    // Les noms doivent correspondre aux 'case' de la fonction drawLogo.
    const SHADOW_NAMES_LOGIC = ['meta', 'google', 'Apple', 'amazon']; 
    // Les couleurs pour l'affichage du nom
    const SHADOW_COLORS = ['#FF0000', '#FF69B4', '#00FFFF', '#FFA500']; 

    SHADOW_NAMES_LOGIC.forEach((name, index) => {
        const color = SHADOW_COLORS[index];
        const shadowIcon = document.createElement('div');
        shadowIcon.style.cssText = ` 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 0.5rem; 
            width: ${LOGO_DISPLAY_SIZE + 10}px;
        `;

        // 1. Créer le canvas
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = LOGO_DISPLAY_SIZE;
        logoCanvas.height = LOGO_DISPLAY_SIZE;
        const logoCtx = logoCanvas.getContext('2d');

        // 2. Mock l'objet shadow pour l'appel à drawLogo
        const tempShadow = {
            name: name,
            // Les positions de dessin doivent être au centre de ce petit canvas
            drawX: LOGO_DISPLAY_SIZE / 2, 
            drawY: LOGO_DISPLAY_SIZE / 2,
            color: color // Utilisé par drawLogo en fallback/contour
        };

        // 3. Appeler drawLogo (la fonction que vous avez précédemment fournie)
        if (typeof drawLogo === 'function') {
            // On passe une TILE_SIZE légèrement supérieure pour que le LOGO_SIZE (TILE_SIZE * 0.9)
            // soit égal ou légèrement inférieur au LOGO_DISPLAY_SIZE (60px)
            drawLogo(logoCtx, tempShadow, LOGO_DISPLAY_SIZE * (10 / 9)); 
        }

        // 4. Créer le nom
        const nameTag = document.createElement('p');
        nameTag.textContent = name.toUpperCase(); // Affichage en majuscules
        nameTag.className = 'font-arcade text-xs';
        nameTag.style.color = color;
        nameTag.style.textShadow = `0 0 5px ${color}`;

        // 5. Assembler l'icône
        shadowIcon.appendChild(logoCanvas);
        shadowIcon.appendChild(nameTag);
        shadowsContainer.appendChild(shadowIcon);
    });
    // =========================================================================

    // Restart instructions
    const restartPrompt = document.createElement('div');
    restartPrompt.style.cssText = `
        color: #00ff00;
        font-size: 1rem;
        text-align: center;
        text-shadow: 0 0 10px #00ff00;
        margin-top: 2rem;
    `;
    restartPrompt.innerHTML = 'PRESS <span style="color:#ffff00">ENTER</span> TO RESTART<br>' +
        '<span style="font-size:0.8rem; color:#cc0000">OR CLICK TO CONTINUE</span>';

    // Assemble overlay
    overlay.appendChild(gameOverText);
    overlay.appendChild(finalScore);
    overlay.appendChild(shadowsContainer); // Add the logos container
    overlay.appendChild(restartPrompt);

    // Add event listeners for restarting
    overlay.addEventListener('click', handleRestart);
    document.addEventListener('keydown', handleRestart);

    // Append overlay to the main container
    document.querySelector('.cabinet-frame').appendChild(overlay);

        
        // Laughing eyes (half circles angled up)
        const leftEye = document.createElement('div');
        leftEye.style.cssText = `
            position: absolute;
            top: 15px;
            left: 15px;
            width: 15px;
            height: 8px;
            background-color: white;
            border-radius: 50% 50% 0 0;
            transform: rotate(-20deg);
        `;
        
        const rightEye = document.createElement('div');
        rightEye.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            width: 15px;
            height: 8px;
            background-color: white;
            border-radius: 50% 50% 0 0;
            transform: rotate(20deg);
        `;
        
        // Pupils
        const leftPupil = document.createElement('div');
        leftPupil.style.cssText = `
            position: absolute;
            top: 17px;
            left: 18px;
            width: 7px;
            height: 7px;
            background-color: black;
            border-radius: 50%;
            transform: rotate(-20deg);
        `;
        
        const rightPupil = document.createElement('div');
        rightPupil.style.cssText = `
            position: absolute;
            top: 17px;
            right: 18px;
            width: 7px;
            height: 7px;
            background-color: black;
            border-radius: 50%;
            transform: rotate(20deg);
        `;
        
        // Wide laughing mouth
        const mouth = document.createElement('div');
        mouth.style.cssText = `
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            width: 35px;
            height: 18px;
            background-color: transparent;
            border-bottom: 5px solid black;
            border-radius: 0 0 50% 50%;
        `;
        
        // Shadow name
        const name = document.createElement('div');
        name.textContent = shadowNames[index];
        name.style.cssText = `
            color: ${color};
            font-size: 0.7rem;
            text-shadow: 0 0 5px ${color};
        `;
        
        // Assemble
        face.appendChild(leftEye);
        face.appendChild(rightEye);
        face.appendChild(leftPupil);
        face.appendChild(rightPupil);
        face.appendChild(mouth);
        shadowIcon.appendChild(face);
        shadowIcon.appendChild(name);
        shadowsContainer.appendChild(shadowIcon);
    });
    
    // Laugh text
    const laughText = document.createElement('div');
    laughText.textContent = 'HA HA HA HA!';
    laughText.style.cssText = `
        color: #ff69b4;
        font-size: 1.2rem;
        margin: 1rem 0;
        font-weight: bold;
        animation: blink 0.5s infinite;
    `;
    
    // Restart instructions
    const restartPrompt = document.createElement('div');
    restartPrompt.style.cssText = `
        color: #00ff00;
        font-size: 1rem;
        text-align: center;
        text-shadow: 0 0 10px #00ff00;
        margin-top: 2rem;
    `;
    restartPrompt.innerHTML = 'PRESS <span style="color:#ffff00">ENTER</span> TO RESTART<br>' +'<span style="font-size:0.8rem; color:#cc0000">OR CLICK TO CONTINUE</span>';
    
    // Assemble overlay
    overlay.appendChild(gameOverText);
    overlay.appendChild(finalScore);
    overlay.appendChild(shadowsContainer);
    overlay.appendChild(laughText);
    overlay.appendChild(restartPrompt);
    
    // Add to screen - append to the cabinet frame to cover the whole thing
    if (cabinetFrame) {
        cabinetFrame.style.position = 'relative'; // Ensure frame is relative
        cabinetFrame.appendChild(overlay);
    }
    
    // Restart handler
    function handleRestart(e) {
        if (e.type === 'click' || e.key === 'Enter') {
            removeGameOverScreen();
            restartGame();
        }
    }
    
    overlay.addEventListener('click', handleRestart);
    document.addEventListener('keydown', handleRestart);
}

function removeGameOverScreen() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.remove();
    
    // --- NEW LOGIC: Show background elements again ---
    const headerScore = document.getElementById('header-score');
    const crtContainer = document.querySelector('.crt-screen-container');
    const infoPanel = document.getElementById('info-panel');

    // Set opacity back to 1 to make them appear
    if (headerScore) headerScore.style.opacity = '1';
    if (crtContainer) crtContainer.style.opacity = '1';
    if (infoPanel) infoPanel.style.opacity = '1';
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("2D context not supported/available!");
        return;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    loadPacmanImage();
    startWallTimer();
    initDots(); 
    
    
    // MODIFIED: Synchronous call now that images are gone
    initShadows();
    requestAnimationFrame(gameLoop);
}