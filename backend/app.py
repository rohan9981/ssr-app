"""
app.py
Flask REST API for the Sai Shakti Residency app.

Run:  python app.py
Serves on http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_connection

app = Flask(__name__)
CORS(app)  # allow the React dev server (different port) to call this API


def row_to_dict(row):
    return dict(row) if row else None


# ── Residents ───────────────────────────────────────────────────────────────
@app.route("/api/residents", methods=["GET"])
def get_residents():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM residents ORDER BY id").fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/residents/<flat_id>", methods=["GET"])
def get_resident(flat_id):
    conn = get_connection()
    row = conn.execute("SELECT * FROM residents WHERE id = ?", (flat_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Flat not found"}), 404
    return jsonify(row_to_dict(row))


# ── Payments ────────────────────────────────────────────────────────────────
@app.route("/api/payments", methods=["GET"])
def get_payments():
    """Optional query params: flat_id, month, status"""
    flat_id = request.args.get("flat_id")
    month = request.args.get("month")
    status = request.args.get("status")

    query = "SELECT * FROM payments WHERE 1=1"
    params = []
    if flat_id:
        query += " AND flat_id = ?"
        params.append(flat_id)
    if month:
        query += " AND month = ?"
        params.append(month)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY flat_id"

    conn = get_connection()
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/payments/<int:payment_id>", methods=["PATCH"])
def update_payment(payment_id):
    """Mark a payment as paid (used by the resident Pay Now flow)."""
    data = request.get_json() or {}
    conn = get_connection()
    conn.execute(
        """UPDATE payments
           SET status = ?, amount_paid = ?, paid_date = ?, payment_mode = ?, reference = ?
           WHERE id = ?""",
        (
            data.get("status", "paid"),
            data.get("amount_paid"),
            data.get("paid_date"),
            data.get("payment_mode"),
            data.get("reference"),
            payment_id,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM payments WHERE id = ?", (payment_id,)).fetchone()
    conn.close()
    return jsonify(row_to_dict(row))


# ── Dashboard summary ───────────────────────────────────────────────────────
@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    """Aggregated metrics for the current period (defaults to settings.current_period)."""
    conn = get_connection()
    period = conn.execute("SELECT current_period FROM settings WHERE id = 1").fetchone()["current_period"]

    collected = conn.execute(
        "SELECT COALESCE(SUM(amount_paid),0) as total FROM payments WHERE month = ? AND status = 'paid'",
        (period,),
    ).fetchone()["total"]

    paid_count = conn.execute(
        "SELECT COUNT(*) as c FROM payments WHERE month = ? AND status = 'paid'", (period,)
    ).fetchone()["c"]

    total_flats = conn.execute("SELECT COUNT(*) as c FROM residents").fetchone()["c"]

    arrears_total = conn.execute(
        "SELECT COALESCE(SUM(amount_due - amount_paid),0) as total FROM payments WHERE status = 'overdue'"
    ).fetchone()["total"]

    overdue_count = conn.execute(
        "SELECT COUNT(*) as c FROM payments WHERE month = ? AND status = 'overdue'", (period,)
    ).fetchone()["c"]

    expenses_this_month = conn.execute(
        "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date LIKE ?",
        (f"%{period.split()[0]} {period.split()[1]}",),
    ).fetchone()["total"]

    bank_balance = conn.execute("SELECT bank_balance FROM settings WHERE id = 1").fetchone()["bank_balance"]

    conn.close()
    return jsonify({
        "period": period,
        "collected_amount": collected,
        "flats_paid": paid_count,
        "total_flats": total_flats,
        "arrears_total": arrears_total,
        "overdue_count": overdue_count,
        "expenses_this_month": expenses_this_month,
        "bank_balance": bank_balance,
    })


@app.route("/api/dashboard/collection-rate", methods=["GET"])
def collection_rate():
    """Collection % per month for the last N months (default 6)."""
    months_back = int(request.args.get("months", 6))
    conn = get_connection()
    rows = conn.execute(
        """SELECT month,
                  SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) as paid_count,
                  COUNT(*) as total_count
           FROM payments
           GROUP BY month"""
    ).fetchall()
    conn.close()

    # Preserve chronological order using the seeded MONTHS order
    from seed_data import MONTHS
    ordered = [r for m in MONTHS for r in rows if r["month"] == m]
    ordered = ordered[-months_back:]

    return jsonify([
        {"month": r["month"], "rate": round(100 * r["paid_count"] / r["total_count"]) if r["total_count"] else 0}
        for r in ordered
    ])


# ── Arrears ─────────────────────────────────────────────────────────────────
@app.route("/api/arrears", methods=["GET"])
def get_arrears():
    """List every flat with outstanding dues, total owed, and overdue month count."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT r.id, r.name, r.sqft, r.category, r.monthly_due,
                  COALESCE(SUM(CASE WHEN p.status='overdue' THEN p.amount_due - p.amount_paid ELSE 0 END), 0) as total_owed,
                  COALESCE(SUM(CASE WHEN p.status='overdue' THEN 1 ELSE 0 END), 0) as months_overdue
           FROM residents r
           LEFT JOIN payments p ON p.flat_id = r.id
           GROUP BY r.id
           HAVING total_owed > 0
           ORDER BY total_owed DESC"""
    ).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/arrears/<flat_id>", methods=["GET"])
def get_flat_arrears_detail(flat_id):
    """Full 12-month payment history for one flat (used by the arrears detail view)."""
    conn = get_connection()
    resident = conn.execute("SELECT * FROM residents WHERE id = ?", (flat_id,)).fetchone()
    if not resident:
        conn.close()
        return jsonify({"error": "Flat not found"}), 404
    history = conn.execute(
        "SELECT month, status, amount_due, amount_paid FROM payments WHERE flat_id = ? ORDER BY id", (flat_id,)
    ).fetchall()
    conn.close()
    return jsonify({
        "resident": row_to_dict(resident),
        "history": [row_to_dict(h) for h in history],
    })


# ── Expenses ────────────────────────────────────────────────────────────────
@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    """Optional query param: month (e.g. 'Jun 2026')"""
    month = request.args.get("month")
    conn = get_connection()
    if month:
        rows = conn.execute(
            "SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC", (f"%{month}",)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM expenses ORDER BY date DESC").fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.get_json() or {}
    required = ["date", "category", "description", "amount"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing fields, required: {required}"}), 400
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO expenses (date, category, description, amount, icon) VALUES (?,?,?,?,?)",
        (data["date"], data["category"], data["description"], data["amount"], data.get("icon", "💰")),
    )
    conn.commit()
    new_id = cur.lastrowid
    row = conn.execute("SELECT * FROM expenses WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return jsonify(row_to_dict(row)), 201


# ── Notices ─────────────────────────────────────────────────────────────────
@app.route("/api/notices", methods=["GET"])
def get_notices():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM notices ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/notices", methods=["POST"])
def add_notice():
    data = request.get_json() or {}
    required = ["date", "title", "body", "tag"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing fields, required: {required}"}), 400
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO notices (date, title, body, tag) VALUES (?,?,?,?)",
        (data["date"], data["title"], data["body"], data["tag"]),
    )
    conn.commit()
    new_id = cur.lastrowid
    row = conn.execute("SELECT * FROM notices WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return jsonify(row_to_dict(row)), 201


# ── Settings ────────────────────────────────────────────────────────────────
@app.route("/api/settings", methods=["GET"])
def get_settings():
    conn = get_connection()
    row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
    conn.close()
    return jsonify(row_to_dict(row))


@app.route("/api/settings", methods=["PATCH"])
def update_settings():
    data = request.get_json() or {}
    fields = ["building_name", "association_name", "bank_account", "fee_revision_date", "current_period", "bank_balance"]
    updates = {k: v for k, v in data.items() if k in fields}
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    conn = get_connection()
    conn.execute(f"UPDATE settings SET {set_clause} WHERE id = 1", list(updates.values()))
    conn.commit()
    row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
    conn.close()
    return jsonify(row_to_dict(row))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
