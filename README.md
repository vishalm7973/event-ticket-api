# event-ticket-api

Event & Ticket Management REST API built with Node.js, Express, MongoDB, and JWT authentication.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Auth / logout strategy

- **Access token** — short-lived JWT with `tokenVersion` (default 15m)
- **Refresh token** — stored hashed in MongoDB, rotated on `/api/auth/refresh`
- **Logout** — bumps `tokenVersion` (invalidates access tokens) and deletes refresh tokens from DB
