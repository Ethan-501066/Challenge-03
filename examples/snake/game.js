/**
 * ============================================
 * SNAKE: LOOP DE PRECISIÓN (Basado en Turnos)
 * ============================================
 * 
 * Juego minimalista enfocado en optimización.
 * La serpiente se mueve por turnos (un movimiento por tecla presionada).
 * El desafío es encontrar el camino más corto a la manzana.
 * 
 * Autor: Challenge 03
 * Tecnología: HTML5 Canvas + Vanilla JavaScript
 */

// ============================================
// CONFIGURACIÓN DEL JUEGO
// ============================================

const CONFIG = {
    // Dimensiones del tablero (en celdas)
    GRID_WIDTH: 15,
    GRID_HEIGHT: 15,
    
    // Tamaño de cada celda en píxeles
    CELL_SIZE: 30,
    
    // Colores del juego
    COLORS: {
        BACKGROUND: '#0d2610',      // Verde muy oscuro (fondo tipo jardín)
        GRID: '#1a4d2e',            // Verde oscuro para el grid
        SNAKE: '#4ade80',           // Verde brillante (serpiente)
        APPLE: '#ef4444',           // Rojo (manzana)
        TRAP: '#2d5a3d',            // Verde más oscuro (trampas)
        TRAP_BORDER: '#3d7a4d',     // Borde de trampas
        EYES: '#1a1a1a',            // Negro para ojos
        TONGUE: '#ff99cc'           // Rosa suave para lengua
    },
    
    // Trampas por nivel (número de trampas que aparecen)
    TRAPS_BY_LEVEL: {
        1: 0,  // Nivel 1: sin trampas
        2: 2,  // Nivel 2: 2 trampas
        3: 4,  // Nivel 3: 4 trampas
        4: 6,  // Nivel 4: 6 trampas
        5: 8   // Y así sucesivamente...
    }
};

// ============================================
// ESTADO DEL JUEGO
// ============================================

const gameState = {
    // Arreglo de segmentos de la serpiente: [{x, y}, ...]
    snake: [{ x: 7, y: 7 }],
    
    // Dirección actual {x, y}
    direction: { x: 1, y: 0 },
    
    // Siguiente dirección (para input buffering)
    nextDirection: { x: 1, y: 0 },
    
    // Posición de la manzana {x, y}
    apple: { x: 12, y: 7 },
    
    // Arreglo de trampas: [{x, y}, ...]
    traps: [],
    
    // Estadísticas
    level: 1,
    applesEaten: 0,
    steps: 0,
    targetLength: 1,  // El tamaño objetivo de la serpiente (siempre = nivel)
    
    // Control de juego
    isGameOver: false,
    isPaused: false
};

// ============================================
// REFERENCIAS AL DOM
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level');
const stepsDisplay = document.getElementById('steps');
const applesDisplay = document.getElementById('apples');
const messageDisplay = document.getElementById('message');

// Configurar tamaño del canvas
canvas.width = CONFIG.GRID_WIDTH * CONFIG.CELL_SIZE;
canvas.height = CONFIG.GRID_HEIGHT * CONFIG.CELL_SIZE;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Genera una posición aleatoria en el tablero
 * asegurándose de que no sea donde está la serpiente
 */
function getRandomPosition(excludePositions = []) {
    let pos;
    let isValid = false;
    
    while (!isValid) {
        pos = {
            x: Math.floor(Math.random() * CONFIG.GRID_WIDTH),
            y: Math.floor(Math.random() * CONFIG.GRID_HEIGHT)
        };
        
        // Verificar que no esté en una posición excluida
        isValid = !excludePositions.some(p => p.x === pos.x && p.y === pos.y);
    }
    
    return pos;
}

/**
 * Verifica si dos posiciones son iguales
 */
function positionEquals(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Obtiene todas las posiciones ocupadas (serpiente + trampas)
 */
function getOccupiedPositions() {
    return [...gameState.snake, ...gameState.traps];
}

/**
 * Calcula el número de trampas para el nivel actual
 */
function getTrapsForLevel(level) {
    // Si no está en la tabla, usar fórmula: min(level - 1) * 2, máximo 10
    if (CONFIG.TRAPS_BY_LEVEL[level] !== undefined) {
        return CONFIG.TRAPS_BY_LEVEL[level];
    }
    return Math.min((level - 1) * 2, 10);
}

/**
 * Genera las trampas del nivel actual
 */
function generateTraps() {
    const numTraps = getTrapsForLevel(gameState.level);
    gameState.traps = [];
    const occupied = getOccupiedPositions();
    
    for (let i = 0; i < numTraps; i++) {
        const trapPos = getRandomPosition(occupied);
        gameState.traps.push(trapPos);
        occupied.push(trapPos);
    }
}

/**
 * Ajusta el tamaño de la serpiente al targetLength actual
 */
function adjustSnakeSize() {
    const currentLength = gameState.snake.length;
    const targetLength = gameState.targetLength;
    
    if (currentLength < targetLength) {
        // Agregar segmentos al final (crecimiento)
        const tail = gameState.snake[gameState.snake.length - 1];
        for (let i = currentLength; i < targetLength; i++) {
            gameState.snake.push({ ...tail });
        }
    } else if (currentLength > targetLength) {
        // Remover segmentos del final (encogimiento)
        gameState.snake = gameState.snake.slice(0, targetLength);
    }
}

// ============================================
// LÓGICA DE ACTUALIZACIÓN
// ============================================

/**
 * Actualiza el estado del juego un paso
 * Esta función se ejecuta una sola vez por turno (cuando el jugador presiona una tecla)
 */
function updateGame() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Aplicar la dirección presionada (sin validaciones que bloqueen giros)
    gameState.direction = gameState.nextDirection;
    
    // Calcular nueva posición de la cabeza
    const head = gameState.snake[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y
    };
    
    // Incrementar contador de pasos
    gameState.steps++;
    updateDisplay();
    
    // ============ VERIFICACIONES DE COLISIÓN ============
    
    // 1. Colisión con paredes
    if (newHead.x < 0 || newHead.x >= CONFIG.GRID_WIDTH ||
        newHead.y < 0 || newHead.y >= CONFIG.GRID_HEIGHT) {
        endGame('¡Chocaste con la pared!');
        return;
    }
    
    // 2. Colisión con la serpiente misma
    if (gameState.snake.some(segment => positionEquals(segment, newHead))) {
        endGame('¡Te chocaste contigo misma!');
        return;
    }
    
    // 3. Colisión con trapas
    if (gameState.traps.some(trap => positionEquals(trap, newHead))) {
        endGame('¡Pisaste una trampa!');
        return;
    }
    
    // Mover la serpiente (siempre elimina la cola, no crece)
    gameState.snake.unshift(newHead);
    gameState.snake.pop();  // Eliminar la cola para no crecer durante movimiento
    
    // Verificar colisión con manzana
    const ateApple = positionEquals(newHead, gameState.apple);
    
    // 4. Colisión con manzana
    if (ateApple) {
        eatApple();
    }
    
    // Renderizar después del movimiento
    render();
}

/**
 * Maneja el evento de comer la manzana
 */
function eatApple() {
    gameState.applesEaten++;
    gameState.level = gameState.applesEaten + 1;
    gameState.targetLength = gameState.level;  // El tamaño objetivo ahora es el nivel actual
    
    // Ajustar el tamaño de la serpiente al nuevo nivel
    adjustSnakeSize();
    
    // Mover la manzana a una nueva posición
    const occupied = getOccupiedPositions();
    gameState.apple = getRandomPosition(occupied);
    
    // Generar trampas para el nuevo nivel
    generateTraps();
    
    // Actualizar UI
    updateDisplay();
    showMessage('🍎 ¡Manzana conseguida!', 'success');
}

/**
 * Termina el juego
 */
function endGame(reason) {
    gameState.isGameOver = true;
    showMessage(reason + ' Presiona cualquier tecla para reintentar.', 'error');
}

/**
 * Reinicia solo la serpiente (sin cambiar manzana ni trampas)
 */
function resetLevel() {
    gameState.snake = [{ x: 7, y: 7 }];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.steps = 0;
    gameState.targetLength = gameState.level;  // El tamaño objetivo es el nivel actual
    gameState.isGameOver = false;
    gameState.isPaused = false;
    
    // Ajustar el tamaño de la serpiente al nivel actual
    adjustSnakeSize();
    
    // La manzana y las trampas mantienen sus posiciones
    
    showMessage('Nivel reiniciado. Un movimiento por tecla.');
    updateDisplay();
    render();
}

/**
 * Reinicia el juego completamente
 */
function resetGame() {
    gameState.snake = [{ x: 7, y: 7 }];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.apple = { x: 12, y: 7 };
    gameState.traps = [];
    gameState.level = 1;
    gameState.applesEaten = 0;
    gameState.steps = 0;
    gameState.targetLength = 1;  // Tamaño inicial: 1 bloque
    gameState.isGameOver = false;
    gameState.isPaused = false;
    
    showMessage('Movimiento por turno. Usa flechas o WASD.');
    updateDisplay();
    render();
}

// ============================================
// INTERFAZ DE USUARIO
// ============================================

/**
 * Actualiza los displays de estadísticas
 */
function updateDisplay() {
    levelDisplay.textContent = gameState.level;
    stepsDisplay.textContent = gameState.steps;
    applesDisplay.textContent = gameState.applesEaten;
}

/**
 * Muestra un mensaje en la interfaz
 */
function showMessage(text, className = '') {
    messageDisplay.textContent = text;
    messageDisplay.className = className;
    
    // Limpiar clase después de un tiempo
    if (className === 'success') {
        setTimeout(() => {
            messageDisplay.className = '';
        }, 2000);
    }
}

// ============================================
// RENDERIZADO
// ============================================

/**
 * Dibuja el tablero completo
 */
function render() {
    // Fondo del tablero con patrón tipo jardín
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Agregar patrón sutil de puntos tipo jardín
    ctx.fillStyle = '#1a4d2e';
    for (let i = 0; i < canvas.width; i += CONFIG.CELL_SIZE * 2) {
        for (let j = 0; j < canvas.height; j += CONFIG.CELL_SIZE * 2) {
            ctx.fillRect(i + CONFIG.CELL_SIZE / 2, j + CONFIG.CELL_SIZE / 2, 2, 2);
        }
    }
    
    // Grid sutil con colores verde
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CONFIG.CELL_SIZE, 0);
        ctx.lineTo(x * CONFIG.CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CONFIG.CELL_SIZE);
        ctx.lineTo(canvas.width, y * CONFIG.CELL_SIZE);
        ctx.stroke();
    }
    
    // Dibujar trampas
    drawTraps();
    
    // Dibujar manzana
    drawApple();
    
    // Dibujar serpiente
    drawSnake();
}

/**
 * Dibuja la serpiente con ojos y lengua en la cabeza
 */
function drawSnake() {
    ctx.fillStyle = CONFIG.COLORS.SNAKE;
    
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * CONFIG.CELL_SIZE;
        const y = segment.y * CONFIG.CELL_SIZE;
        
        // La cabeza es ligeramente más definida
        if (index === 0) {
            // Cuerpo de la cabeza
            ctx.fillRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
            
            // Dibujar ojos y lengua según la dirección
            drawHeadFeatures(x, y, gameState.direction);
        } else {
            // Cuerpo de la serpiente
            ctx.fillRect(x + 3, y + 3, CONFIG.CELL_SIZE - 6, CONFIG.CELL_SIZE - 6);
        }
    });
}

/**
 * Dibuja los rasgos de la cabeza (ojos y lengua) según la dirección
 */
function drawHeadFeatures(x, y, direction) {
    const eyeSize = 2;
    const cellCenter = CONFIG.CELL_SIZE / 2;
    
    if (direction.y === -1) {
        // Moviéndose ARRIBA: ojos arriba, lengua abajo
        drawEyes(x, y, 5, 5, eyeSize); // Ojos arriba
        drawTongue(x + cellCenter, y + CONFIG.CELL_SIZE - 2, 0, -2); // Lengua hacia arriba
    } else if (direction.y === 1) {
        // Moviéndose ABAJO: ojos abajo, lengua arriba
        drawEyes(x, y, 5, CONFIG.CELL_SIZE - 7, eyeSize); // Ojos abajo
        drawTongue(x + cellCenter, y + 2, 0, 2); // Lengua hacia abajo
    } else if (direction.x === -1) {
        // Moviéndose IZQUIERDA: ojos izquierda, lengua derecha
        drawEyes(x, y, 5, 5, eyeSize, true); // Ojos izquierda (vertical)
        drawTongue(x + CONFIG.CELL_SIZE - 2, y + cellCenter, -2, 0); // Lengua hacia izquierda
    } else if (direction.x === 1) {
        // Moviéndose DERECHA: ojos derecha, lengua izquierda
        drawEyes(x, y, CONFIG.CELL_SIZE - 7, 5, eyeSize, true); // Ojos derecha (vertical)
        drawTongue(x + 2, y + cellCenter, 2, 0); // Lengua hacia derecha
    }
}

/**
 * Dibuja los ojos
 */
function drawEyes(x, y, x1, y1, size, vertical = false) {
    ctx.fillStyle = CONFIG.COLORS.EYES;
    if (vertical) {
        // Ojos verticales (para movimiento horizontal)
        ctx.fillRect(x + x1, y + 5, size, size);
        ctx.fillRect(x + x1, y + CONFIG.CELL_SIZE - 7, size, size);
    } else {
        // Ojos horizontales (para movimiento vertical)
        ctx.fillRect(x + 5, y + y1, size, size);
        ctx.fillRect(x + CONFIG.CELL_SIZE - 7, y + y1, size, size);
    }
}

/**
 * Dibuja la lengua
 */
function drawTongue(startX, startY, offsetX, offsetY) {
    ctx.strokeStyle = CONFIG.COLORS.TONGUE;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + offsetX * 1.5, startY + offsetY * 1.5);
    ctx.stroke();
}

/**
 * Dibuja la manzana
 */
function drawApple() {
    const x = gameState.apple.x * CONFIG.CELL_SIZE;
    const y = gameState.apple.y * CONFIG.CELL_SIZE;
    
    ctx.fillStyle = CONFIG.COLORS.APPLE;
    ctx.fillRect(x + 5, y + 5, CONFIG.CELL_SIZE - 10, CONFIG.CELL_SIZE - 10);
    
    // Pequeño brillo en la manzana
    ctx.fillStyle = '#ff6666';
    ctx.fillRect(x + 8, y + 8, 4, 4);
}

/**
 * Dibuja las trampas
 */
function drawTraps() {
    ctx.fillStyle = CONFIG.COLORS.TRAP;
    ctx.strokeStyle = CONFIG.COLORS.TRAP_BORDER;
    ctx.lineWidth = 1;
    
    gameState.traps.forEach(trap => {
        const x = trap.x * CONFIG.CELL_SIZE;
        const y = trap.y * CONFIG.CELL_SIZE;
        
        // Fondo de trampa
        ctx.fillRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
        
        // Borde para que se vea como trampa
        ctx.strokeRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
        
        // Patrón de X para indicar peligro
        ctx.strokeStyle = CONFIG.COLORS.TRAP_BORDER;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + CONFIG.CELL_SIZE - 5, y + CONFIG.CELL_SIZE - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + CONFIG.CELL_SIZE - 5, y + 5);
        ctx.lineTo(x + 5, y + CONFIG.CELL_SIZE - 5);
        ctx.stroke();
    });
}

// ============================================
// ENTRADA DEL USUARIO
// ============================================

document.addEventListener('keydown', (event) => {
    // Si el juego terminó, reiniciar el nivel actual al presionar cualquier tecla
    if (gameState.isGameOver) {
        resetLevel();
        return;
    }
    
    const key = event.key.toLowerCase();
    
    // Flechas del teclado - Ejecutar movimiento inmediatamente
    if (event.key === 'ArrowUp') {
        gameState.nextDirection = { x: 0, y: -1 };
        updateGame();
        event.preventDefault();
    } else if (event.key === 'ArrowDown') {
        gameState.nextDirection = { x: 0, y: 1 };
        updateGame();
        event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
        gameState.nextDirection = { x: -1, y: 0 };
        updateGame();
        event.preventDefault();
    } else if (event.key === 'ArrowRight') {
        gameState.nextDirection = { x: 1, y: 0 };
        updateGame();
        event.preventDefault();
    }
    
    // Teclas WASD - Ejecutar movimiento inmediatamente
    if (key === 'w') {
        gameState.nextDirection = { x: 0, y: -1 };
        updateGame();
    } else if (key === 's') {
        gameState.nextDirection = { x: 0, y: 1 };
        updateGame();
    } else if (key === 'a') {
        gameState.nextDirection = { x: -1, y: 0 };
        updateGame();
    } else if (key === 'd') {
        gameState.nextDirection = { x: 1, y: 0 };
        updateGame();
    }
    
    // Pausa con espacio
    if (key === ' ') {
        gameState.isPaused = !gameState.isPaused;
        showMessage(
            gameState.isPaused ? '⏸ Pausado' : 'Usa flechas o WASD para mover'
        );
    }
});

// ============================================
// INICIO DEL JUEGO
// ============================================

(function init() {
    console.log('🐍 Iniciando Snake: Loop de Precisión (Basado en Turnos)');
    resetGame();
})();
