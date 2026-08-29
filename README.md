# Event & Ticket Management API

REST API for managing events, tickets, and bookings with JWT authentication and role-based access (ADMIN / USER).

**Repository:** [https://github.com/vishalm7973/event-ticket-api](https://github.com/vishalm7973/event-ticket-api)

## Tech stack

- Node.js, Express
- MongoDB, Mongoose
- JWT (access + refresh), bcryptjs
- Joi validation, Helmet, CORS, express-rate-limit
- Jest + Supertest + mongodb-memory-server (tests)

## Prerequisites

- Node.js 18+ recommended
- MongoDB running locally (or a remote URI)

**Important:** Booking create/cancel use MongoDB **transactions**. Your MongoDB must be a **replica set** (single-node is fine). Example init:

```bash
# mongod.conf (or CLI): --replSet rs0
# then in mongosh:
rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] })
```

Then set `MONGODB_URI` to something like:

```text
mongodb://127.0.0.1:27017/event-ticket-api?replicaSet=rs0
```

## Installation

```bash
git clone https://github.com/vishalm7973/event-ticket-api.git
cd event-ticket-api
npm install
cp .env.example .env
# edit .env as needed
```

`npm install` also runs a small `postinstall` script that removes a nested incompatible `mongodb` driver under `mongodb-memory-server` so tests work reliably.

## Environment variables

Copy `.env.example` → `.env`. The app **will not start** if `.env` is missing or required vars are empty.

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `3000` if unset by your process) |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `MONGODB_URI` | **Yes** | MongoDB connection string (use replica set for bookings) |
| `JWT_SECRET` | **Yes** | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | **Yes** | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | **Yes** | Refresh token lifetime (e.g. `7d`) |
| `CORS_ORIGIN` | Prod **Yes** | Comma-separated allowed origins (required when `NODE_ENV=production`) |
| `SEED_ADMIN_EMAIL` | **Yes** | Admin email used by `npm run seed` |
| `SEED_ADMIN_PASSWORD` | **Yes** | Admin password used by `npm run seed` |

## Run the app

```bash
npm run seed   # create/update admin (once)
npm run dev    # nodemon (development)
# or
npm start      # node src/server.js
```

Base URL: `http://localhost:3000/api`

## Seed admin

```bash
npm run seed
```

Default demo admin (override via env):

| Role  | Email               | Password      |
|-------|---------------------|---------------|
| ADMIN | `admin@example.com` | `Admin@12345` |

Demo credentials only — change before any real deployment. Normal users register via `POST /api/auth/register` (role `USER`).

## Tests

```bash
npm test
```

Uses an in-memory MongoDB replica set. Auth rate limiting is skipped when `NODE_ENV=test`.

## Auth & logout strategy

- **Access token** — short-lived JWT (`Authorization: Bearer <token>`). Payload includes user id, role, and `tokenVersion`.
- **Refresh token** — opaque token stored **hashed** in MongoDB; returned on login/refresh. Rotated on every `POST /api/auth/refresh` (old token invalidated).
- **Logout** (`POST /api/auth/logout`, authenticated):
  1. Increments the user’s `tokenVersion` → existing access tokens fail validation
  2. Deletes all refresh tokens for that user from the DB

## Roles & statuses

| Roles | `ADMIN`, `USER` |
|-------|-----------------|
| Event status | `DRAFT` → `PUBLISHED` (via PATCH); cancel via `DELETE` → `CANCELLED` |
| Booking status | `CONFIRMED`, `CANCELLED` |

- New events are always created as **DRAFT**.
- Public list/detail only return **PUBLISHED** events.
- **Publish** (`PATCH` with `status: "PUBLISHED"`) only from `DRAFT`; republishing an already `PUBLISHED` event → `400`.
- **Cancelled** events cannot be updated (no revert to `DRAFT` / `PUBLISHED`) → `400`.
- **Cancelled** events cannot receive new bookings or ticket create/update → `400`.
- Cancelling an already `CANCELLED` event → `400`.
- Bookings are **USER**-only; admins list all bookings at `/api/admin/bookings` (paginated).

## Response format

Success:

```json
{
  "success": true,
  "message": "…",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "…"
}
```

Protected routes need:

```http
Authorization: Bearer <accessToken>
```

Auth routes (`register` / `login` / `refresh`) are rate-limited (20 requests / 15 minutes per IP).

---

## API documentation

**Base URL:** `http://localhost:3000/api`  
**Auth header:** `Authorization: Bearer <accessToken>` (where required)  
**Success shape:** `{ "success": true, "message": "…", "data": … }`  
**Error shape:** `{ "success": false, "message": "…" }`  
**Paginated lists:** `data` = `{ "<items>": [...], "pagination": { "page", "limit", "total", "pages" } }` (`page` default 1, `limit` default 10, max 100)

---

### Health

| Method | Endpoint | Auth | Sample response |
|--------|----------|------|-----------------|
| GET | `/health` | — | `{ "success": true, "data": { "status": "ok" } }` |
| GET | `/` | — | `{ "success": true, "data": { "message": "Event Ticket API" } }` |

---

### Auth

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/auth/register` | — | Rate-limited |
| POST | `/auth/login` | — | Returns tokens |
| POST | `/auth/refresh` | — | Rotates refresh token |
| POST | `/auth/logout` | Bearer | Invalidates tokens |
| GET | `/auth/me` | Bearer | Current user |

**POST `/auth/register`** — `201`

```json
// Request
{ "firstName": "Vishal", "lastName": "Demo", "email": "vishal@example.com", "password": "Password1" }

// Response data
{ "_id": "…", "firstName": "Vishal", "lastName": "Demo", "email": "vishal@example.com", "role": "USER" }
```

**POST `/auth/login`** — `200`

```json
// Request
{ "email": "vishal@example.com", "password": "Password1" }

// Response data
{ "user": { "_id": "…", "email": "vishal@example.com", "role": "USER" }, "accessToken": "eyJ…", "refreshToken": "…" }
```

**POST `/auth/refresh`** — `200`

```json
// Request
{ "refreshToken": "<refreshToken>" }

// Response data
{ "accessToken": "eyJ…", "refreshToken": "<newRefreshToken>" }
```

**POST `/auth/logout`** — `200` → `data: null`  
**GET `/auth/me`** — `200` → `data: { "_id": "…", "email": "…", "role": "USER", … }`

---

### Events

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/events` | USER, ADMIN | Published only; paginated |
| GET | `/events/:id` | USER, ADMIN | Published only |
| POST | `/events` | ADMIN | Creates as `DRAFT` |
| PATCH | `/events/:id` | ADMIN | Publish / update |
| DELETE | `/events/:id` | ADMIN | Soft-cancel → `CANCELLED` |

**GET `/events?page=1&limit=10`** — `200`

```json
// Response data
{ "events": [{ "_id": "…", "title": "Tech Meetup", "status": "PUBLISHED", "venue": "Bangalore", … }], "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 } }
```

**GET `/events/:id`** — `200` → `data: { "_id": "…", "title": "Tech Meetup", "status": "PUBLISHED", … }`

**POST `/events`** — `201`

```json
// Request
{ "title": "Tech Meetup", "description": "Talks", "venue": "Bangalore", "startDate": "2026-09-15T10:00:00.000Z", "endDate": "2026-09-15T18:00:00.000Z" }

// Response data
{ "_id": "…", "title": "Tech Meetup", "status": "DRAFT", … }
```

**PATCH `/events/:id`** — `200`

```json
// Request (at least one field; status = DRAFT | PUBLISHED only)
{ "status": "PUBLISHED" }

// Response data
{ "_id": "…", "status": "PUBLISHED", … }
```

Rules: `DRAFT` → `PUBLISHED` once; already `PUBLISHED` again → `400`; `CANCELLED` cannot update → `400`.

**DELETE `/events/:id`** — `200` → `data: { "_id": "…", "status": "CANCELLED", … }` (already cancelled → `400`)

---

### Tickets

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/events/:id/tickets` | USER, ADMIN | All tickets for event |
| POST | `/events/:id/tickets` | ADMIN | Not on `CANCELLED` event |
| PATCH | `/events/:id/tickets/:ticketId` | ADMIN | `add` or `remove` seats |

**GET `/events/:id/tickets`** — `200`

```json
// Response data (array)
[{ "_id": "…", "name": "General Admission", "price": 499, "totalQuantity": 100, "availableQuantity": 98 }]
```

**POST `/events/:id/tickets`** — `201`

```json
// Request
{ "name": "General Admission", "price": 499, "totalQuantity": 100 }

// Response data
{ "_id": "…", "name": "General Admission", "price": 499, "totalQuantity": 100, "availableQuantity": 100 }
```

**PATCH `/events/:id/tickets/:ticketId`** — `200`

```json
// Request (exactly one)
{ "add": 10 }
// or
{ "remove": 5 }

// Response data
{ "_id": "…", "totalQuantity": 110, "availableQuantity": 108, … }
```

---

### Bookings

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/bookings` | USER | Event must be `PUBLISHED` |
| GET | `/bookings/me` | USER | Paginated; populated event/ticket |
| PATCH | `/bookings/:id/cancel` | USER | Own booking only |
| GET | `/admin/bookings` | ADMIN | Paginated; optional `status`, `eventId`, `userId` |

**POST `/bookings`** — `201`

```json
// Request
{ "eventId": "<eventId>", "ticketId": "<ticketId>", "quantity": 2 }

// Response data
{ "_id": "…", "eventId": "…", "ticketId": "…", "quantity": 2, "totalAmount": 998, "status": "CONFIRMED" }
```

**GET `/bookings/me?page=1&limit=10`** — `200`

```json
// Response data
{ "bookings": [{ "_id": "…", "eventId": { "title": "Tech Meetup" }, "ticketId": { "name": "GA" }, "quantity": 2, "totalAmount": 998, "status": "CONFIRMED" }], "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 } }
```

**PATCH `/bookings/:id/cancel`** — `200`

```json
// Response data
{ "_id": "…", "status": "CANCELLED", … }
```

**GET `/admin/bookings?status=CONFIRMED&page=1&limit=10`** — `200`

```json
// Response data
{ "bookings": [{ "_id": "…", "userId": { "firstName": "Vishal", "email": "vishal@example.com" }, "eventId": { … }, "ticketId": { … }, "status": "CONFIRMED" }], "pagination": { "page": 1, "limit": 10, "total": 5, "pages": 1 } }
```

---

## Typical flow

1. `npm run seed` → login as admin  
2. `POST /api/events` → `PATCH /api/events/:id` with `{ "status": "PUBLISHED" }`  
3. `POST /api/events/:id/tickets`  
4. Register/login as user → `POST /api/bookings`  
5. Optional: `PATCH /api/bookings/:id/cancel` or admin `GET /api/admin/bookings`

## Project structure

```text
src/
  config/         # env, db, cors
  constants/      # roles, statuses, messages, HTTP codes
  controllers/
  middlewares/    # auth, validate, errors, rate limit
  models/
  routes/
  services/
  utils/
  validators/
scripts/          # seed, postinstall
tests/            # integration tests
```

## License

ISC
