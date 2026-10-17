# KickOff Football Training Session Management System

KickOff is a football training management system for youth clubs. Coaches and players use the React app to manage training sessions, drills, and registrations through a Laravel REST API.

## Stack

- React 19, Vite, React Router, and Axios
- Laravel 12 and PHP 8.2+
- MySQL or MariaDB
- Laravel Sanctum API tokens

## Setup

Requirements: Node.js 20.19+ (or 22.12+), npm, PHP 8.2+, Composer, and a running MySQL/MariaDB server.

```powershell
cd backend
composer install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

Create the `kickoff` database and set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `backend/.env`. Then start the API:

```powershell
php artisan migrate --seed
php artisan serve
```

In a second terminal, start the React app:

```powershell
cd frontend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://127.0.0.1:8000`; CORS is configured for the Vite origin in `backend/.env` (`FRONTEND_URL`). The frontend API URL can be changed in `frontend/.env` (`VITE_API_BASE_URL`).

Protected API requests use the Sanctum bearer token managed by the frontend. To verify the API separately, import the Postman collection in `docs/postman_collection.json` and run Login.

## Demo Accounts

All seeded accounts use the password `password`.

- Admin: `admin@gmail.com`
- Player: `player@gmail.com`
- Coaches: `miguel.coach@gmail.com`, `liza.coach@gmail.com`

The seed database includes four age-group teams, three venues, 24 players, 15 drills, 25 training sessions, and 100 registrations.

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/register`, `/api/login`, `/api/logout` | Player registration and token authentication |
| GET | `/api/user` | Current authenticated user |
| GET/POST/PUT/PATCH/DELETE | `/api/sessions` | Session CRUD, search, filtering, and pagination |
| POST/DELETE | `/api/sessions/{session}/register` | Player signup and pending-signup cancellation |
| PATCH | `/api/sessions/{session}/status` | Session status workflow |
| GET/POST/PUT/PATCH/DELETE | `/api/drills`, `/api/venues`, `/api/teams` | Resource management |
| GET/PATCH | `/api/users` | Admin-only user directory and role/team/active-state management |
| GET/PATCH | `/api/registrations` | Scoped registration list, approval, rejection, and attendance |
| GET | `/api/dashboard` | Role-scoped summary metrics |

The importable Postman collection is [docs/postman_collection.json](docs/postman_collection.json). It uses collection variables for the API base URL and bearer token; run Login to store the token.

## Tests

```powershell
cd backend
php artisan test
```

## References

- GitHub Copilot was used to assist with the initial Laravel API implementation. The code and generated data should be reviewed and understood by the student before submission.
