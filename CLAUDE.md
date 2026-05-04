# KROSS Helpdesk — CLAUDE.md

## Project overview

Full-stack helpdesk/ticketing system.

| Layer    | Stack |
|----------|-------|
| Backend  | Node.js 20+, Express 4, PostgreSQL 15+ |
| Frontend | React 18, Vite 5, React Router 6, TanStack Query 5, Zustand |
| Auth     | JWT (access + refresh tokens) |
| Email    | Nodemailer (SMTP) |

## Repository layout

```
kross/
├── backend/
│   ├── src/
│   │   ├── app.js            # Express app factory
│   │   ├── server.js         # Entry point
│   │   ├── config/
│   │   │   └── db.js         # pg Pool singleton
│   │   ├── controllers/      # Route handlers (thin — delegate to services)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/           # DB query functions (no ORM)
│   │   ├── routes/           # Express Router files
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Logger, mailer, etc.
│   │   └── validators/       # express-validator chains
│   └── tests/
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/       # Reusable UI (common/, tickets/, admin/)
│       ├── hooks/            # Custom React hooks
│       ├── pages/            # Route-level page components
│       ├── services/
│       │   └── api.js        # Axios instance with JWT interceptors
│       ├── store/            # Zustand stores
│       └── utils/
├── scripts/
│   └── schema.sql            # PostgreSQL schema (idempotent)
├── docs/
├── .env.example              # Copy to .env and fill in secrets
├── .gitignore
└── CLAUDE.md
```

## Dev setup

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE kross_helpdesk;"
psql -U postgres -d kross_helpdesk -f scripts/schema.sql

# 2. Environment
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET, SMTP_* etc.

# 3. Backend
cd backend && npm install && npm run dev    # http://localhost:5000

# 4. Frontend (new terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## Roles

| Role    | Can do |
|---------|--------|
| `admin` | All operations, user management, categories |
| `agent` | View/update all tickets, add internal comments |
| `user`  | Create tickets, view own tickets, add public comments |

## API conventions

- Base path: `GET /api/v1/...`
- Auth: `Authorization: Bearer <access_token>`
- Error shape: `{ "error": "message" }` with appropriate HTTP status
- Pagination: `?page=1&limit=20` → `{ data: [], total, page, limit }`
- All timestamps in ISO 8601 UTC

## Ticket lifecycle

```
open → in_progress → resolved → closed
         ↑__________↓  (re-open allowed)
```

## Key development rules

- No ORM — write raw SQL via `pg` Pool. Keep queries in `models/` files.
- Validate all incoming data with `express-validator` in `validators/`.
- Controllers must be thin — they call a service, return the result.
- Never commit `.env`. Secrets go only in `.env` (git-ignored).
- `schema.sql` uses `IF NOT EXISTS` — always idempotent.
- `LOG_LEVEL=debug` in development; `info` in production.

## Testing

```bash
cd backend && npm test          # Jest + supertest integration tests
```

Tests in `backend/tests/integration/` hit a real test DB (`kross_test`).
Do not mock the database — prior mocking caused migration divergence.

## Ticket statuses & priorities

Statuses: `open`, `in_progress`, `resolved`, `closed`
Priorities: `low`, `medium`, `high`, `critical`
