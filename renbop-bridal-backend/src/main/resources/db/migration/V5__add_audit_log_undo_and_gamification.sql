-- V5: Enhance audit_logs + add gamification tables

-- ─── Enhance audit_logs ───────────────────────────────────────────────────
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS previous_value TEXT,
    ADD COLUMN IF NOT EXISTS new_value      TEXT,
    ADD COLUMN IF NOT EXISTS is_reverted    BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reverted_by    BIGINT,
    ADD COLUMN IF NOT EXISTS reverted_at    TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ─── Gamification: staff_points ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_points (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    total_points    INT NOT NULL DEFAULT 0,
    weekly_points   INT NOT NULL DEFAULT 0,
    monthly_points  INT NOT NULL DEFAULT 0,
    level           VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    week_start      DATE,
    month_start     DATE,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_points_weekly ON staff_points(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_staff_points_total  ON staff_points(total_points DESC);

-- ─── Gamification: point_transactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS point_transactions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    action      VARCHAR(100) NOT NULL,
    points      INT NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_point_tx_user_id    ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_tx_created_at ON point_transactions(created_at DESC);
