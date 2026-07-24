# Heartsweeper React API

API en Cloudflare Workers (con base de datos D1) para guardar y consultar las puntuaciones del juego [Heartsweeper](https://heartsweeper.irenemendoza.dev).

## Stack

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) para desarrollo y despliegue
- [Vitest](https://vitest.dev/) + `@cloudflare/vitest-pool-workers` para tests

## Requisitos

- Node.js
- Una cuenta de Cloudflare con acceso a Workers y D1
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) autenticado (`npx wrangler login`)

## Instalación

```bash
npm install
```

## Base de datos

El esquema se define en [`schema.sql`](./schema.sql):

```sql
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dimension INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    player_name TEXT NOT NULL,
    time_ms INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Para aplicarlo a la base de datos D1 (definida en `wrangler.jsonc` como `heartsweeper-react-db`):

```bash
# En local
npx wrangler d1 execute heartsweeper-react-db --local --file=./schema.sql

# En producción
npx wrangler d1 execute heartsweeper-react-db --remote --file=./schema.sql
```

## Desarrollo

```bash
npm run dev
```

Levanta un servidor local en `http://localhost:8787`.

## Tests

```bash
npm test
```

## Despliegue

```bash
npm run deploy
```

## Endpoints

Todas las respuestas son JSON. CORS está restringido al origen `https://heartsweeper.irenemendoza.dev`.

### `POST /api/scores`

Guarda una puntuación.

**Body:**

```json
{
  "dimension": 8,
  "difficulty": "easy",
  "player_name": "Irene",
  "time_ms": 34210
}
```

**Respuestas:**

- `201 Created` — `{ "success": true }`
- `400 Bad Request` — falta algún campo obligatorio
- `500 Internal Server Error` — error al guardar

### `GET /api/scores?dimension=8&difficulty=easy`

Devuelve el top 5 de puntuaciones (menor `time_ms` primero) para la dimensión y dificultad indicadas.

**Parámetros de consulta (obligatorios):**

- `dimension`
- `difficulty`

**Respuestas:**

- `200 OK` — array de `{ player_name, time_ms, created_at }`
- `400 Bad Request` — faltan `dimension` o `difficulty`
- `500 Internal Server Error` — error al consultar

## Estructura del proyecto

```
src/
  index.js       # Worker: enrutado y lógica de los endpoints
test/
  index.spec.js  # Tests con Vitest
schema.sql       # Esquema de la tabla scores
wrangler.jsonc   # Configuración de Wrangler y binding de D1
```
