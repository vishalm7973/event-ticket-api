# Event-Ticket-Api

Event & Ticket Management REST API built with Node.js, Express, MongoDB, and JWT authentication.

## Setup

```bash
npm install
cp .env.example .env
# start MongoDB, then:
npm run seed
npm run dev
```

## Seed script

Creates a sample admin account for evaluation:

```bash
npm run seed
```


| Role  | Email               | Password      |
| ----- | ------------------- | ------------- |
| ADMIN | `admin@example.com` | `Admin@12345` |


Override via `.env` (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).

These are **demo credentials only** — change them before any real deployment.

Normal users can register via `POST /api/auth/register`.

## Auth / logout strategy

- **Access token** — short-lived JWT with `tokenVersion` (default 15m)
- **Refresh token** — stored hashed in MongoDB, rotated on `/api/auth/refresh`
- **Logout** — bumps `tokenVersion` (invalidates access tokens) and deletes refresh tokens from DB

