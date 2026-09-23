# Juegos TIC Solidario

Dos juegos interactivos para el stand del proyecto **TIC Solidario** (Responsabilidad Social Universitaria — Facultad de Ingeniería, USAL).

## Cómo levantarlo

**Doble clic en `iniciar.bat`.** Abre los dos juegos y los deja corriendo.

O a mano, en dos terminales:

```bash
node server.js         # trivia   -> http://localhost:3000
node server-memo.js    # memotest -> http://localhost:3001
```

Solo necesita Node. No usa librerías externas ni internet: **funciona sin conexión**, igual que el software del proyecto.

---

## Trivia — `localhost:3000`

10 preguntas de opción múltiple sobre el proyecto. Se toca una opción y avanza sola, sin botón.

- **No muestra si acertaste o no** durante el juego: el puntaje se lleva en silencio.
- Al final: **"Acertaste X/10 preguntas"**.
- **6 o más → GANASTE**, con confeti, lluvia de emotes y de libritos.
- **5 o menos → "Volvé a intentar en 15 minutos"**, con cuenta regresiva real.

Las preguntas están en el array `QUESTIONS` dentro de `trivia.html`. Cada una es
`{ q: "pregunta", o: ["A","B","C","D"], c: <índice de la correcta, 0 a 3> }`.

Para cambiar cuántas hacen falta para ganar, o la espera:

```js
const PASS        = 6;                  // aciertos para ganar
const COOLDOWN_MS = 15 * 60 * 1000;     // espera al perder
```

---

## Memotest — `localhost:3001`

8 cartas (4 parejas) y **3 intentos** (3 errores permitidos, son los puntitos de arriba).

- **Cada ronda es distinta**: no solo se barajan las posiciones, también se eligen
  4 fichas nuevas al azar de un set de 16. Nadie se puede acordar del tablero.
- **Todas las parejas → GANASTE**, con la misma fiesta.
- **3 errores → "Intentá de nuevo más tarde"**, con los mismos 15 minutos.

Dificultad medida con 20.000 partidas simuladas: jugando con atención se gana el **87%**.
Para ajustarla, arriba de `memotest.html`:

```js
const PARES    = 4;    // parejas en el tablero (8 cartas)
const INTENTOS = 3;    // errores permitidos
```

Referencia de cuánto se gana jugando bien:

| Parejas | 2 intentos | 3 intentos | 4 intentos |
|---------|-----------|-----------|-----------|
| 3 (6 cartas)  | 60% | 100% | 100% |
| **4 (8 cartas)** | 20% | **87%** | 100% |
| 5 (10 cartas) | 5% | 43% | 97% |

---

## Notas para el día del evento

**El bloqueo de 15 minutos se guarda en esa computadora**, así que si pierde una persona,
la siguiente se encontraría con la cuenta regresiva. Por eso abajo del cartel hay un link
chico: **"Soy otro participante — empezar de cero"**, que lo limpia al instante.
Si preferís que el bloqueo sea inviolable, se borra ese botón.

**El texto del premio** ("Acercate a la mesa a buscar tu premio") está en el bloque
`panel win` de cada HTML — cambialo por el que corresponda.

---

## Logos

Están en `logos/` y aparecen al pie de los dos juegos. Si falta alguno, simplemente
no se muestra: la página no se rompe.

| Archivo | Origen |
|---|---|
| `usal.png` | sitio de RSU, recortada la cinta de "70 años" |
| `ingenieria.svg` | SVG oficial del sitio de la Facultad |
| `voces-de-barro.png` | vocesdebarro.org.ar |
| `tic-solidario.png` | **recortado de una placa de Instagram del proyecto** — si el equipo tiene el archivo original, conviene reemplazarlo |
| `equidad.png` | Fundación Equidad |
| `uniservitate.png` | uniservitate.org |

---

## Tests

```bash
npm test          # o: node test.js && node test-memo.js
```

45 chequeos: contenido de las preguntas, las reglas de victoria en todos los puntajes
posibles, que la fiesta solo se dispare al ganar, que el memotest genere tableros
distintos en cada ronda, que los efectos estén optimizados y que los 6 logos existan.

---

## Rendimiento

Los emojis del confeti se dibujan **una sola vez** en un canvas chico y después se copian
(antes se rendereaba cada uno con `fillText` en cada cuadro, y eso trababa la animación).
Además el `devicePixelRatio` está capado a 1.5 y hay un auto-ajuste que baja la cantidad
de partículas si detecta cuadros lentos.
