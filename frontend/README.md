# KickOff Frontend

The KickOff React SPA connects to the Laravel API in `../backend` for authentication, football sessions, registrations, and club administration.

## Run

```powershell
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Open `http://localhost:5173`. Start the Laravel API separately at `http://127.0.0.1:8000` and seed its database before signing in. Configure `VITE_API_BASE_URL` in `.env` if the API uses a different address.

Demo admin: `admin@gmail.com` / `password`

Demo player: `player@gmail.com` / `password`

## Checks

```powershell
npm run lint
npm run build
```
