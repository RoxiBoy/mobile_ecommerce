# Admin Web Panel

This admin panel manages backend resources exposed by `/server`:
- Categories CRUD
- Products CRUD
- Coupons CRUD
- Orders list + status update
- Payments list + status update
- Notifications create + user lookup

## Setup
1. `cp .env.example .env`
2. Set `VITE_API_BASE_URL` if backend is not on `http://localhost:4000/api`
3. `npm install`
4. `npm run dev`

## Notes
- Login uses `/api/auth/login`.
- Admin-only endpoints require a token from an admin user account.
- If non-admin user logs in, admin endpoints return `403`.
