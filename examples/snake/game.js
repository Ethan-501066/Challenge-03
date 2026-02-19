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
        BACKGROUND: '#111111',
        GRID: '#1a1a1a',
        SNAKE: '#4ade80',
        APPLE: '#ef4444',
        TRAP: '#374151',
        TRAP_BORDER: '#4b5563'
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

// ============================================
// LÓGICA DE ACTUALIZACIÓN
// ============================================

/**
 * Actualiza el estado del juego un paso
 * Esta función se ejecuta una sola vez por turno (cuando el jugador presiona una tecla)
 */
function updateGame() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Aplicar la siguiente dirección (si no es un giro de 180°)
    const newDir = gameState.nextDirection;
    
    // Validar que no sea un giro de 180°
    if (newDir.x + gameState.direction.x !== 0 || 
        newDir.y + gameState.direction.y !== 0) {
        gameState.direction = newDir;
    }
    
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
    
    // Mover la serpiente (sin crecer, solo reposicionarse)
    gameState.snake.unshift(newHead);
    gameState.snake.pop(); // Eliminar el último segmento para no crecer
    
    // 4. Colisión con manzana
    if (positionEquals(newHead, gameState.apple)) {
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
    gameState.isGameOver = false;
    gameState.isPaused = false;
    
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
    // Fondo del tablero
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid sutil
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
 * Dibuja la serpiente
 */
function drawSnake() {
    ctx.fillStyle = CONFIG.COLORS.SNAKE;
    
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * CONFIG.CELL_SIZE;
        const y = segment.y * CONFIG.CELL_SIZE;
        
        // La cabeza es ligeramente más definida
        if (index === 0) {
            ctx.fillRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
            // Pequeño destello en la cabeza
            ctx.fillStyle = '#22ff88';
            ctx.fillRect(x + 5, y + 5, 4, 4);
            ctx.fillStyle = CONFIG.COLORS.SNAKE;
        } else {
            ctx.fillRect(x + 3, y + 3, CONFIG.CELL_SIZE - 6, CONFIG.CELL_SIZE - 6);
        }
    });
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
