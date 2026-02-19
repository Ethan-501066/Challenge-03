# 🐍 SNAKE: Loop de Precisión

Un juego minimalista de Snake enfocado en **optimización de secuencias**, no en crecimiento infinito.

## 🎯 El Concepto

- **Serpia NO crece** nunca
- Cada manzana comida **aumenta el nivel** y añade **trampas estáticas**
- Tu objetivo es **alcanzar la manzana con el menor número de pasos posible**
- La experiencia es **justa, silenciosa e inmediata**

## 🎮 Controles

| Acción | Tecla |
|--------|-------|
| Arriba | ↑ o `W` |
| Abajo | ↓ o `S` |
| Izquierda | ← o `A` |
| Derecha | → o `D` |
| Pausar | Espacio |

**Nota:** No se permiten giros de 180° instantáneos (protección de jugabilidad).

## 📋 Reglas

### Movimiento
- La serpiente siempre tiene la misma longitud (1 segmento)
- Se mueve 1 celda por paso en función de tu entrada
- El contador "Pasos" aumenta en cada movimiento

### Manzanas
- La manzana es roja y está claramente visible
- Comerla:
  - Aumenta el nivel
  - Cambia la manzana a nueva posición aleatoria
  - Reinicia el contador de pasos
  
### Trampas
- Aparecen en el nivel 2
- Son casillas grises con patrón de X
- **Son estáticas**: no se mueven
- Si las tocas → **muerte y reinicio del nivel actual**

### Progresión de Dificultad

| Nivel | Trampas |
|-------|---------|
| 1     | 0       |
| 2     | 2       |
| 3     | 4       |
| 4     | 6       |
| 5+    | (Level-1)*2, máx 10 |

### Colisiones

Tocas algo y **mueres**:
- Pared
- Trap (trampa)
- Tu propia serpiente (no es posible en este diseño, pero protegido)

## 🖼️ Diseño Visual

### Colores
- **Fondo:** Negro (#0a0a0a) - Máximo contraste
- **Tablero:** Gris oscuro (#111111) - Fondo del juego
- **Serpiente:** Verde brillante (#4ade80) - Fácil de ver
- **Manzana:** Rojo vibrante (#ef4444) - Clara y contrastante
- **Trampas:** Gris oscuro (#374151) con patrón de X
- **Grid:** Líneas suaves para referencia espacial

### Interfaz
- Minimalista, sin distracciones
- Estadísticas en tiempo real: Nivel, Pasos, Manzanas comidas
- Mensajes de estado claros

## 🚀 Cómo Ejecutar

### Opción 1: Servidor Local Simple (Windows PowerShell)

```powershell
# Navega a la carpeta del juego
cd "c:\Users\Pirita de perro\Documents\GitHub\Challenge-03\examples\snake"

# Inicia un servidor simple (Python 3)
python -m http.server 8000

# O con Python 2
python -m SimpleHTTPServer 8000
```

Luego abre en tu navegador:
```
http://localhost:8000
```

### Opción 2: Abrir directamente en navegador

Simplemente abre `index.html` en tu navegador (funciona sin servidor).

### Opción 3: Con Node.js

Si tienes Node.js instalado:

```powershell
# Instala http-server globalmente (una sola vez)
npm install -g http-server

# Inicia el servidor en la carpeta
http-server
```

## 📁 Estructura de Archivos

```
examples/snake/
├── index.html       # Estructura HTML minimalista
├── styles.css       # Estilos CSS (verde, negro, minimalista)
├── game.js          # Lógica completa del juego
└── README.md        # Esta documentación
```

## 📝 Explicación de Archivos

### `index.html`
- Estructura básica del documento
- Canvas para renderizar el juego (700x450 px por defecto)
- Displays de estadísticas (Nivel, Pasos, Manzanas)
- Mensaje de estado
- Importa CSS y JavaScript

### `styles.css`
- Diseño minimalista en blanco y negro
- Verde brillante para elementos del juego
- Tipografía monoespaciada (Courier New)
- Centrado responsivo
- Efectos sutiles de brillo para profundidad

### `game.js`
Archivo completo con:

#### Configuración (`CONFIG`)
```javascript
CONFIG = {
    GRID_WIDTH: 15,           // Ancho en celdas
    GRID_HEIGHT: 15,          // Alto en celdas
    CELL_SIZE: 30,            // Píxeles por celda
    GAME_SPEED: 150,          // Milisegundos entre actualizaciones
    COLORS: {...},            // Paleta de colores
    TRAPS_BY_LEVEL: {...}     // Trampas por nivel
}
```

#### Estado del Juego (`gameState`)
- `snake`: Posición del segmento único
- `direction`: Dirección actual
- `apple`: Posición de la manzana
- `traps`: Array de trampas
- `level`, `applesEaten`, `steps`: Estadísticas

#### Funciones Principales

**Actualización:**
- `updateGame()`: Loop de actualización del juego
- `eatApple()`: Maneja comer manzana
- `endGame()`: Termina el juego
- `resetGame()`: Reinicia completamente

**Utilidad:**
- `getRandomPosition()`: Genera posición aleatoria válida
- `generateTraps()`: Crea trampas para el nivel
- `getTrapsForLevel()`: Calcula trampas basado en nivel

**Renderizado:**
- `render()`: Dibuja todo el tablero
- `drawSnake()`: Dibuja la serpiente
- `drawApple()`: Dibuja la manzana
- `drawTraps()`: Dibuja las trampas

**Entrada:**
- Manejo de eventos de teclado (flechas y WASD)
- Validación de giros 180°
- Pausa con espacio

## 🔧 Personalización Fácil

### Cambiar Dificultad

En `game.js`, modifica `CONFIG.GAME_SPEED`:
```javascript
GAME_SPEED: 150  // Más bajo = más rápido, más alto = más lento
```

### Ajustar Trampas por Nivel

```javascript
TRAPS_BY_LEVEL: {
    1: 0,  // Sin trampas
    2: 2,  // Bajo
    3: 4,
    4: 6,
    5: 8   // Más alto
}
```

### Cambiar Tamaño del Tablero

```javascript
GRID_WIDTH: 15,   // Cambiar a 20, 25, etc.
GRID_HEIGHT: 15,
CELL_SIZE: 30     // Cambiar a 25, 40, etc.
```

### Cambiar Colores

En `CONFIG.COLORS`:
```javascript
COLORS: {
    BACKGROUND: '#0a0a0a',    // Fondo
    GRID: '#1a1a1a',          // Grid
    SNAKE: '#4ade80',          // Serpiente (verde)
    APPLE: '#ef4444',          // Manzana (rojo)
    TRAP: '#374151',           // Trampas (gris)
    TRAP_BORDER: '#4b5563'
}
```

## 🎓 Arquitectura para Principiantes

### Separación de Conceptos

1. **Configuración** (`CONFIG`): Todos los números ajustables
2. **Estado** (`gameState`): Qué hay en el tablero
3. **Lógica** (`updateGame`, `eatApple`): Las reglas del juego
4. **Dibujo** (`render`, `drawSnake`): Cómo se ve
5. **Entrada** (`keydown`): Qué hace el jugador

**Ventaja:** Puedes cambiar un color sin tocar la lógica.
Puedes agregar trampas sin cambiar el renderizado.

### Cómo Agregar una Nueva Regla

Ejemplo: Hacer que la manzana se mueva cada 5 pasos.

1. Agrega un contador en `gameState`:
```javascript
appleStepsCounter: 0
```

2. En `updateGame()`, después de mover:
```javascript
gameState.appleStepsCounter++;
if (gameState.appleStepsCounter > 5) {
    gameState.apple = getRandomPosition(getOccupiedPositions());
    gameState.appleStepsCounter = 0;
}
```

3. ¡Listo! La manzana se mueve cada 5 pasos.

## 📊 Flujo del Juego

```
INICIO
  ↓
BUCLE DE JUEGO
  ├─ Procesar entrada (teclado)
  ├─ Actualizar posiciones
  ├─ Verificar colisiones
  │  ├─ ¿Pared? → Muerte
  │  ├─ ¿Trampa? → Muerte
  │  └─ ¿Manzana? → Comer + Nuevo nivel
  ├─ Renderizar tablero
  └─ Repetir cada 150ms
```

## 🐛 Debugging

Si algo falla:

1. Abre la consola del navegador (`F12` → Console)
2. Verás logs iniciales como "🐍 Iniciando Snake: Loop de Precisión"
3. Comprueba que no hay errores JavaScript

## 💡 Filosofía del Diseño

Este juego sigue los principios del brief:

✅ **Justo:** Reglas claras, trampas visibles
✅ **Silencioso:** Sin efectos de sonido innecesarios  
✅ **Invita a reintentar:** Reinicio inmediato al fallar
✅ **Menos contenido:** Un tablero, una manzana, una mecánica
✅ **Más intención:** Cada paso cuenta para optimizar

## 🚀 Posibles Mejoras

- Guardar puntuación más alta
- Animaciones suaves de transición
- Tableros con patrones predeterminados
- Modos de dificultad (fácil, medio, difícil)
- Sonido (opcional, siguiendo la filosofía silenciosa)
- Efectos visuales al comer la manzana
- Sistema de logros (completar nivel en X pasos)

## 📄 Licencia

Este código es libre de usar, modificar y compartir dentro del contexto de Challenge-03.

---

**Disfruta optimizando tu ruta 🐍**
