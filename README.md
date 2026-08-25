# Full Scale Training — Task Board

A containerized task-tracking app: a NestJS + TypeScript API backed by Postgres, and a React + TypeScript frontend, wired together with Docker Compose. Supports full CRUD on tasks — create, list, update (status and fields), and delete — end to end through the API.

## Structure

- `apps/api` — NestJS + TypeScript API (TypeORM, Postgres)
- `apps/web` — Vite + React + TypeScript frontend

## How to run

1. Copy `.env.example` to `.env` and adjust values if needed (Postgres user/password/db, etc.).
2. From the repo root:

   ```bash
   docker-compose up
   ```

   This builds and starts three services: `db` (Postgres 16), `api` (NestJS, port `3000`), and `web` (React app, port `5173`). The `api` waits for `db`'s healthcheck before starting; `web` waits for `api`.
3. Open `http://localhost:5173` for the Task Board UI. The API is reachable directly at `http://localhost:3000`.

Alternate compose files for other workflows:

- `docker-compose.dev.yml` — bind-mounted source with hot reload (`start:dev` for the API, `vite --host` for the web app). Run with `docker-compose -f docker-compose.dev.yml up`.
- `docker-compose.prod.yml` — production-oriented build.

## API endpoints

### Tasks (`/tasks`)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | List tasks (paginated via `?limit=&offset=`) |
| `GET` | `/tasks/:id` | Get a single task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task (204 No Content) |

### Users (`/users`)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users` | Create a user |
| `GET` | `/users` | List users (paginated) |
| `GET` | `/users/:id` | Get a single user |
| `PATCH` | `/users/:id` | Update a user |
| `DELETE` | `/users/:id` | Delete a user |

### Health (`/health`)

Basic health check endpoint used by Docker healthchecks/monitoring.

## Architecture overview

- **`apps/api`** — NestJS, TypeORM against Postgres. Requests pass through a global `ValidationPipe` (DTOs for input validation), a logging interceptor, and a global exception filter for consistent error responses. Controllers are thin and delegate to services for persistence logic.
- **`apps/web`** — Vite + React + TypeScript. A small typed `fetch` client (`apps/web/src/api/tasks.ts`) wraps the `/api/tasks` endpoints; components (`TaskForm`, `TaskList`) call it directly and manage their own loading/error state — no external state library.
- **Docker Compose** — `db`, `api`, and `web` run on a shared `app-net` bridge network, each with a healthcheck; `depends_on: condition: service_healthy` sequences startup (`db` → `api` → `web`). Config (Postgres credentials, connection string) is passed via environment variables from `.env`.

## Known limitations

- No authentication or authorization — all endpoints are open.
- No automated tests on the frontend (the API has some Jest spec coverage under `apps/api/src/**/*.spec.ts`, but coverage isn't comprehensive).
- The frontend doesn't use the API's pagination (`limit`/`offset`) — it always fetches the full task list.
- No optimistic UI or undo on edit/delete — actions apply immediately once confirmed by the API.

## What's next

- Add authentication (e.g., JWT-based) and scope task/user access accordingly.
- Add frontend test coverage (component and integration tests for the create/update/delete flows).
- Add pagination controls to the Task Board UI.
- Task filtering/sorting (by status, due date).
