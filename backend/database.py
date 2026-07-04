"""
database.py
Creates the SQLite database and schema for the Sai Shakti Residency app.
Run directly to (re)initialize the database: python database.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "ssr.db")

SCHEMA = """
-- Residents / flats master table
CREATE TABLE IF NOT EXISTS residents (
    id              TEXT PRIMARY KEY,      -- flat number e.g. 'G01', '302'
    name            TEXT NOT NULL,
    sqft            INTEGER NOT NULL,
    category        TEXT NOT NULL,         -- Resident / Builder / Builder Tenant
    monthly_due     INTEGER NOT NULL,      -- current monthly maintenance amount
    effective_date  TEXT                   -- date this due amount took effect
);

-- Monthly payment records
CREATE TABLE IF NOT EXISTS payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    flat_id         TEXT NOT NULL REFERENCES residents(id),
    month           TEXT NOT NULL,         -- e.g. 'Jun 2026'
    amount_paid     INTEGER NOT NULL DEFAULT 0,
    amount_due      INTEGER NOT NULL,
    status          TEXT NOT NULL CHECK(status IN ('paid','overdue','partial','pending')),
    paid_date       TEXT,
    payment_mode    TEXT,                  -- IMPS / NEFT / UPI / Cash
    reference        TEXT,
    UNIQUE(flat_id, month)
);

-- Expenses / vendor payments
CREATE TABLE IF NOT EXISTS expenses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    date            TEXT NOT NULL,
    category        TEXT NOT NULL,         -- BESCOM / BWSSB / Security / Lift / Repair / Garbage
    description     TEXT NOT NULL,
    amount          INTEGER NOT NULL,
    icon            TEXT DEFAULT '💰'
);

-- Notices / announcements
CREATE TABLE IF NOT EXISTS notices (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    date            TEXT NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    tag             TEXT NOT NULL          -- Maintenance / Finance / Meeting
);

-- Bank account / association settings (single row)
CREATE TABLE IF NOT EXISTS settings (
    id                      INTEGER PRIMARY KEY CHECK (id = 1),
    building_name           TEXT NOT NULL,
    association_name        TEXT NOT NULL,
    bank_account            TEXT,
    fee_revision_date       TEXT,
    current_period          TEXT,
    bank_balance            INTEGER DEFAULT 0
);
"""


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")


if __name__ == "__main__":
    init_db()
