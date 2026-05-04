-- KROSS Helpdesk — initial schema
-- Run: psql -U postgres -d kross_helpdesk -f scripts/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  first_name   VARCHAR(100),
  last_name    VARCHAR(100),
  role         VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('admin','agent','user')),
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tickets ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT        NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','in_progress','resolved','closed')),
  priority     VARCHAR(20)  NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high','critical')),
  category_id  UUID        REFERENCES categories(id) ON DELETE SET NULL,
  created_by   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to  UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_status       ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by   ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to  ON tickets(assigned_to);

-- ─── Comments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body       TEXT        NOT NULL,
  is_internal BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);

-- ─── Attachments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  uploaded_by UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  filename    VARCHAR(255) NOT NULL,
  mimetype    VARCHAR(100),
  size_bytes  BIGINT,
  storage_path VARCHAR(512) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Ticket history ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_history (
  id          BIGSERIAL    PRIMARY KEY,
  ticket_id   UUID         NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  changed_by  UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  changed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  field_name  VARCHAR(100) NOT NULL,
  old_value   TEXT,
  new_value   TEXT
);

CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id  ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_changed_by ON ticket_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_ticket_history_changed_at ON ticket_history(changed_at);

-- ─── Audit log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL   PRIMARY KEY,
  user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(100) NOT NULL,
  entity     VARCHAR(100),
  entity_id  UUID,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
