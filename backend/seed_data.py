"""
seed_data.py
Populates ssr.db with resident, payment, expense, notice, and settings data
derived from SSROA_Recon_Mar21_onwards.xlsx.

Run after database.py:  python seed_data.py
"""

from database import get_connection, init_db

# ── Residents (from Payables sheet — current period rates) ────────────────────
RESIDENTS = [
    ("G01", "B R Subbaraj",        1620, "Resident",        2910),
    ("G02", "S Krishnan",          1500, "Resident",        2850),
    ("G03", "Srinivas Prasad",     1230, "Resident",        2715),
    ("G04", "Narsan",              1015, "Resident",        2610),
    ("G05", "Pritesh Hadiya",      1300, "Resident",        2750),
    ("G06", "Vinay A Kulkarni",    1350, "Resident",        2775),
    ("G07", "Prasad B R",          1195, "Resident",        2700),
    ("101", "Raghu",               1640, "Resident",        2920),
    ("102", "P S Rajan",           1500, "Resident",        2850),
    ("103", "Gautham Davalur",     1230, "Resident",        2715),
    ("104", "Pavan K B",           1015, "Resident",        2610),
    ("105", "Sachin Prakash",      1300, "Resident",        2750),
    ("106", "Bharath Acharya",     1350, "Resident",        2775),
    ("107", "Paramanand",          1195, "Resident",        2700),
    ("201", "T G Ganesh",          1640, "Resident",        2920),
    ("202", "Assa Singh Chawla",   1500, "Resident",        2850),
    ("203", "Krishna KRH",         1230, "Resident",        2715),
    ("204", "Vinayak Shanbhag",    1015, "Resident",        2610),
    ("205", "Kumar Somasundar",    1300, "Resident",        2750),
    ("206", "N Shashidhar",        1350, "Resident",        2775),
    ("207", "Tridib Pal",          1195, "Resident",        2700),
    ("301", "Girish B Puranik",    1640, "Resident",        2920),
    ("302", "Avinash G Kulkarni",  1500, "Resident",        2850),
    ("303", "Madhu Hunasigi",      1230, "Resident",        2715),
    ("304", "Ramnath K N Shenoy",  1015, "Resident",        2610),
    ("305", "Rahul Bapat",         1300, "Resident",        2750),
    ("306", "Sudheer C",           1350, "Resident",        2775),
    ("307", "Jitendra Damani",     1195, "Resident",        2700),
    ("401", "B K Yeshwanth",       1640, "Builder Tenant",  2920),
    ("402", "S A Chethan",         1500, "Builder",         2850),
    ("403", "HD Pramod",           1230, "Builder Tenant",  2715),
    ("404", "Ganesh Janakiraman",  1500, "Builder",         2850),
    ("405", "Pushpalatha G",       1195, "Builder Tenant",  2700),
]

MONTHS = ["Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025",
          "Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026","Jun 2026"]

# Payment status per flat per month, aligned to MONTHS above
PAYMENT_STATUS = {
    "G01": ["paid"]*12, "G02": ["paid"]*12, "G03": ["paid"]*11 + ["pending"],
    "G04": ["paid"]*12, "G05": ["paid"]*12, "G06": ["paid"]*12, "G07": ["paid"]*12,
    "101": ["paid"]*12, "102": ["paid"]*12, "103": ["paid"]*12, "104": ["paid"]*12,
    "105": ["paid"]*12, "106": ["paid"]*12, "107": ["paid"]*12,
    "201": ["paid"]*12, "202": ["paid"]*12,
    "203": ["overdue","paid","overdue","paid","overdue","paid","overdue","paid","overdue","overdue","overdue","overdue"],
    "204": ["paid"]*12, "205": ["paid"]*12, "206": ["paid"]*12,
    "207": ["paid","overdue","paid","paid","overdue","paid","paid","paid","paid","overdue","paid","overdue"],
    "301": ["paid"]*12, "302": ["paid"]*12, "303": ["paid"]*12, "304": ["paid"]*12,
    "305": ["paid"]*12, "306": ["paid"]*12,
    "307": ["paid","overdue","paid","paid","paid","paid","paid","paid","paid","overdue","paid","overdue"],
    "401": ["paid"]*12,
    "402": ["paid"]*9 + ["partial","partial","overdue"],
    "403": ["paid"]*12, "404": ["paid"]*12, "405": ["paid"]*12,
}

PAYMENT_MODES = ["IMPS", "NEFT", "UPI", "Cash"]

EXPENSES = [
    ("17 Jun 2026", "BESCOM",   "Electricity bill",      12754, "⚡"),
    ("17 Jun 2026", "BWSSB",    "Water charges",          8876,  "💧"),
    ("12 Jun 2026", "Security", "Security salaries",      11500, "🔒"),
    ("12 Jun 2026", "Security", "Kavitha salary",         5500,  "🔒"),
    ("20 Jun 2026", "Lift",     "Samrudhya Elevators",    1278,  "🛗"),
    ("12 Jun 2026", "Repair",   "Building electrical",    7461,  "🔧"),
    ("12 Jun 2026", "Garbage",  "Garbage cleaning",       3000,  "🗑️"),
    ("15 May 2026", "BESCOM",   "Electricity bill",       11900, "⚡"),
    ("15 May 2026", "BWSSB",    "Water charges",          8500,  "💧"),
    ("10 May 2026", "Security", "Security salaries",      17000, "🔒"),
    ("18 Apr 2026", "BESCOM",   "Electricity bill",       14960, "⚡"),
    ("18 Apr 2026", "BWSSB",    "Water charges",           8696, "💧"),
]

NOTICES = [
    ("28 Jun 2026", "Terrace tank cleaning — 2 Jul",
     "Water supply interrupted 9am–1pm on 2 July for overhead tank cleaning. Please store water in advance.",
     "Maintenance"),
    ("15 Jun 2026", "Maintenance fee revised Aug 2024",
     "Monthly charges revised from 1 August 2024. Please check the updated schedule in your account.",
     "Finance"),
    ("10 Jun 2026", "AGM — 20 July 2026 at 6pm",
     "Annual General Meeting in the community hall. All residents requested to attend.",
     "Meeting"),
    ("1 Jun 2026", "Generator fuel — ₹500 contribution",
     "One-time contribution per flat required for diesel expenses during extended power cuts.",
     "Finance"),
]


def seed():
    init_db()
    conn = get_connection()
    cur = conn.cursor()

    # Residents
    cur.execute("DELETE FROM residents")
    cur.executemany(
        "INSERT INTO residents (id, name, sqft, category, monthly_due, effective_date) VALUES (?,?,?,?,?, '2024-08-01')",
        RESIDENTS,
    )

    # Payments
    cur.execute("DELETE FROM payments")
    for flat_id, name, sqft, category, due in RESIDENTS:
        statuses = PAYMENT_STATUS.get(flat_id, ["pending"] * 12)
        for i, month in enumerate(MONTHS):
            status = statuses[i] if i < len(statuses) else "pending"
            if status == "paid":
                amount_paid = due
                paid_date = f"0{(i % 9) + 1} {month.split()[0]}"
                mode = PAYMENT_MODES[i % len(PAYMENT_MODES)]
                ref = f"{mode}/{month.replace(' ', '')}/{flat_id}"
            elif status == "partial":
                amount_paid = int(due * 0.6)
                paid_date = None
                mode = None
                ref = None
            else:
                amount_paid = 0
                paid_date = None
                mode = None
                ref = None
            cur.execute(
                """INSERT INTO payments (flat_id, month, amount_paid, amount_due, status, paid_date, payment_mode, reference)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (flat_id, month, amount_paid, due, status, paid_date, mode, ref),
            )

    # Expenses
    cur.execute("DELETE FROM expenses")
    cur.executemany(
        "INSERT INTO expenses (date, category, description, amount, icon) VALUES (?,?,?,?,?)",
        EXPENSES,
    )

    # Notices
    cur.execute("DELETE FROM notices")
    cur.executemany(
        "INSERT INTO notices (date, title, body, tag) VALUES (?,?,?,?)",
        NOTICES,
    )

    # Settings
    cur.execute("DELETE FROM settings")
    cur.execute(
        """INSERT INTO settings (id, building_name, association_name, bank_account, fee_revision_date, current_period, bank_balance)
           VALUES (1, 'Sai Shakti Residency', 'SSROA', 'XXXX XXXX 7442', '1 Aug 2024', 'Jun 2026', 328990)"""
    )

    conn.commit()
    conn.close()
    print(f"Seeded {len(RESIDENTS)} residents, {len(RESIDENTS)*12} payment records, "
          f"{len(EXPENSES)} expenses, {len(NOTICES)} notices.")


if __name__ == "__main__":
    seed()
