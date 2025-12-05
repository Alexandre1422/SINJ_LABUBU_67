// --- CONFIGURATION ---
const CANVAS_ID = 'snake-canvas';
const OBSTACLE_CLASS = '.deadly-flower'; 

const GRID_SIZE = 50; 
const GAME_SPEED = 150; 

// --- CONFIGURATION DES IMAGES ---
const IMG_SOURCES = {
    head: './image/head.png', 
    body: './image/body.png', 
    corner: './image/corner.png', 
    tail: './image/tail.png',
    food: 'https://img.icons8.com/color/96/apple-camera.png' 
};

// --- VARIABLES GLOBALES ---
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext('2d');
let canvasWidth, canvasHeight, numCols, numRows;

let snake = [];
let direction = { x: 0, y: -1 }; 
let nextDirection = { x: 0, y: -1 };
let food = {};
let blockedGridCells = new Set(); 
let isGameRunning = false;

// Variables pour la boucle fluide
let lastFrameTime = 0;
let timeAccumulator = 0;
let animationFrameId;

// Stockage images
const images = {};

// --- CHARGEMENT ---
function loadImages(callback) {
    let loadedCount = 0;
    const sources = Object.keys(IMG_SOURCES);
    const totalImages = sources.length;

    sources.forEach(key => {
        const img = new Image();
        img.src = IMG_SOURCES[key];
        img.onload = () => {
            images[key] = img;
            loadedCount++;
            if (loadedCount === totalImages) callback(); 
        };
        img.onerror = () => {
            console.error("Erreur chargement image: " + key);
            loadedCount++;
            if (loadedCount === totalImages) callback();
        };
    });
}

// --- INITIALISATION ---
function initGame() {
    resizeCanvas();
    scanObstacles(); 
    document.addEventListener('keydown', changeDirection);
    window.addEventListener('resize', handleResize);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// --- DÉMARRAGE ---
window.startSnakeFromBottom = function() {
    if (isGameRunning) return;
    
    resizeCanvas(); 
    scanObstacles();
    
    const startX = 1; 
    const startY = numRows - 2; 

    snake = [];
    for (let i = 0; i < 5; i++) { 
        snake.push({ 
            x: startX, 
            y: startY + i,
            prevX: startX,
            prevY: startY + i
        }); 
    }

    direction = { x: 0, y: -1 };
    nextDirection = { x: 0, y: -1 };

    placeFood();
    isGameRunning = true;
    
    lastFrameTime = performance.now();
    timeAccumulator = 0;
    requestAnimationFrame(gameLoop);
}

// --- GAME OVER & NETTOYAGE (CORRIGÉ) ---
function stopGame() {
    isGameRunning = false;
    
    // 1. Arrêter l'animation
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    // 2. Vider le serpent (supprimer les données)
    snake = [];
    
    // 3. Effacer visuellement le canvas immédiatement
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); 
    
    // 4. Prévenir background.js
    const event = new Event('snake-game-over');
    document.dispatchEvent(event);
}

// --- BOUCLE DE JEU ---
function gameLoop(timestamp) {
    if (!isGameRunning) return;

    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    timeAccumulator += deltaTime;

    while (timeAccumulator >= GAME_SPEED) {
        updateGameLogic();
        timeAccumulator -= GAME_SPEED;
    }

    const alpha = timeAccumulator / GAME_SPEED;
    draw(alpha);

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- LOGIQUE ---
function updateGameLogic() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    if (head.x < 0) head.x = numCols - 1;
    if (head.x >= numCols) head.x = 0;
    if (head.y < 0) head.y = numRows - 1;
    if (head.y >= numRows) head.y = 0;

    if (snake.some(s => s.x === head.x && s.y === head.y) || blockedGridCells.has(`${head.x},${head.y}`)) {
        stopGame();
        return;
    }

    for(let s of snake) {
        s.prevX = s.x;
        s.prevY = s.y;
    }

    const newHead = { 
        x: head.x, y: head.y, 
        prevX: snake[0].x, prevY: snake[0].y 
    };

    snake.unshift(newHead);

    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }
}

// --- DESSIN (CORRIGÉ : ORDRE INVERSÉ) ---

function drawRotated(img, renderX, renderY, angleInDegrees) {
    if (!img) return;
    ctx.save();
    const cx = renderX + GRID_SIZE / 2;
    const cy = renderY + GRID_SIZE / 2;
    ctx.translate(cx, cy);
    ctx.rotate(angleInDegrees * Math.PI / 180);
    ctx.drawImage(img, -GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE);
    ctx.restore();
}

function draw(alpha) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Pomme
    if (images.food) {
        ctx.drawImage(images.food, food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    // --- BOUCLE INVERSÉE ---
    // On part de la fin (Queue) vers le début (Tête)
    // Comme ça, la Tête est dessinée en DERNIER, donc AU-DESSUS du corps.
    for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];
        
        let renderX = segment.prevX + (segment.x - segment.prevX) * alpha;
        let renderY = segment.prevY + (segment.y - segment.prevY) * alpha;

        if (Math.abs(segment.x - segment.prevX) > 1 || Math.abs(segment.y - segment.prevY) > 1) {
            renderX = segment.x;
            renderY = segment.y;
        }

        const pixelX = renderX * GRID_SIZE;
        const pixelY = renderY * GRID_SIZE;

        const prev = snake[i - 1]; 
        const next = snake[i + 1]; 

        // TÊTE (i === 0)
        if (i === 0) { 
            let angle = 0;
            if (next) {
                if (segment.x < next.x) angle = 270; 
                else if (segment.x > next.x) angle = 90; 
                else if (segment.y < next.y) angle = 0; 
                else if (segment.y > next.y) angle = 180; 
            } else {
                if (direction.x === 1) angle = 90;
                if (direction.x === -1) angle = 270;
                if (direction.y === 1) angle = 180;
                if (direction.y === -1) angle = 0;
            }
            drawRotated(images.head, pixelX, pixelY, angle);
        } 
        
        // QUEUE (i === snake.length - 1)
        else if (i === snake.length - 1) { 
            let angle = 0;
            if (prev) {
                if (prev.x > segment.x) angle = 90;       
                else if (prev.x < segment.x) angle = 270; 
                else if (prev.y > segment.y) angle = 180; 
                else if (prev.y < segment.y) angle = 0;   
            }
            drawRotated(images.tail, pixelX, pixelY, angle);
        } 
        
        // CORPS
        else { 
            if (Math.abs(next.x - segment.x) > 1 || Math.abs(prev.x - segment.x) > 1 ||
                Math.abs(next.y - segment.y) > 1 || Math.abs(prev.y - segment.y) > 1) {
                drawRotated(images.body, pixelX, pixelY, 0);
            }
            else if (prev.x === next.x) {
                drawRotated(images.body, pixelX, pixelY, 0);
            } else if (prev.y === next.y) {
                drawRotated(images.body, pixelX, pixelY, 90);
            } 
            else {
                let angle = 0;
                const pX = prev.x - segment.x; const pY = prev.y - segment.y;
                const nX = next.x - segment.x; const nY = next.y - segment.y;

                if ((pX===1 && nY===1) || (nX===1 && pY===1)) angle = 0; 
                else if ((pX===-1 && nY===1) || (nX===-1 && pY===1)) angle = 90; 
                else if ((pX===-1 && nY===-1) || (nX===-1 && pY===-1)) angle = 180;
                else if ((pX===1 && nY===-1) || (nX===1 && pY===-1)) angle = 270;

                drawRotated(images.corner, pixelX, pixelY, angle);
            }
        }
    }
}

// --- OUTILS ---
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    numCols = Math.floor(canvasWidth / GRID_SIZE);
    numRows = Math.floor(canvasHeight / GRID_SIZE);
}

function scanObstacles() {
    blockedGridCells.clear(); 
    const obstaclesElements = document.querySelectorAll(OBSTACLE_CLASS);
    obstaclesElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        let startCol = Math.floor(rect.left / GRID_SIZE);
        let endCol = Math.ceil(rect.right / GRID_SIZE);
        let startRow = Math.floor(rect.top / GRID_SIZE);
        let endRow = Math.ceil(rect.bottom / GRID_SIZE);
        startCol = Math.max(0, startCol); endCol = Math.min(numCols, endCol);
        startRow = Math.max(0, startRow); endRow = Math.min(numRows, endRow);
        for (let c = startCol; c < endCol; c++) {
            for (let r = startRow; r < endRow; r++) { blockedGridCells.add(`${c},${r}`); }
        }
    });
}

function placeFood() {
    let potentialFood;
    let isValid = false;
    let attempts = 0;
    while (!isValid && attempts < 500) {
        attempts++;
        potentialFood = { x: Math.floor(Math.random() * numCols), y: Math.floor(Math.random() * numRows) };
        const onSnake = snake.some(s => s.x === potentialFood.x && s.y === potentialFood.y);
        const inObstacle = blockedGridCells.has(`${potentialFood.x},${potentialFood.y}`);
        if (!onSnake && !inObstacle) isValid = true;
    }
    food = isValid ? potentialFood : {x:0, y:0};
}

function changeDirection(e) {
    if (!isGameRunning) return;
    const key = e.key;
    if ((key === 'ArrowUp' || key === 'z') && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if ((key === 'ArrowDown' || key === 's') && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if ((key === 'ArrowLeft' || key === 'q') && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if ((key === 'ArrowRight' || key === 'd') && direction.x === 0) nextDirection = { x: 1, y: 0 };
}

function handleResize() {
    resizeCanvas(); scanObstacles(); 
    if (isGameRunning) {
        placeFood();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadImages(initGame);
});