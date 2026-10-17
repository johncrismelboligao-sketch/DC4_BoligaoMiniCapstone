# KickOff Project Context

- This repository contains the KickOff football training management Laravel API in `/backend`; the React SPA will consume it from `http://localhost:5173`.
- Use Laravel 12, PHP 8.2+, MySQL/MariaDB, and Laravel Sanctum bearer tokens. Keep API routes under `/api`.
- Preserve the role model `admin`, `coach`, and `player`. Use Form Requests for write validation, JsonResources for responses, policies for ownership, and `role` middleware for broad role gates.
- Coaches manage only their own training sessions. Players can view/register for sessions belonging to their team. Admins manage drills, teams, and venues and can delete sessions.
- Session statuses are `scheduled`, `ongoing`, `completed`, and `cancelled`; registration statuses are `pending`, `approved`, `rejected`, and `cancelled`.
- Keep session/drill lists paginated, eagerly load related data, and scope registration/dashboard results by user role.
- Run backend checks with `cd backend; php artisan test`. Local setup uses `composer install`, `.env.example`, `php artisan migrate --seed`, and `php artisan serve`.