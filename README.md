# Sai Shakti Residency — Owners Association Portal

A full-stack web app for managing maintenance collections, expenses, and
arrears for Sai Shakti Residency, built from your SSROA reconciliation data.

**Stack:** SQLite (data) · Python / Flask (API) · React + Vite (frontend)

---

## Project structure

```
ssr-app/
├── backend/
│   ├── app.py              ← Flask API server (all routes)
│   ├── database.py         ← SQLite schema + connection helper
│   ├── seed_data.py        ← Loads real resident/payment/expense data
│   ├── requirements.txt
│   └── ssr.db               ← generated after running seed_data.py
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx         ← React entry point
│       ├── App.jsx          ← Routes
│       ├── api.js           ← Fetch client for the Flask API
│       ├── theme.js         ← Brown color tokens + helpers
│       ├── hooks.js         ← useIsMobile()
│       ├── components/
│       │   ├── Topbar.jsx
│       │   ├── MetricCard.jsx
│       │   ├── Avatar.jsx
│       │   └── Tag.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Collections.jsx
│           ├── Expenses.jsx
│           ├── Arrears.jsx
│           ├── Settings.jsx
│           ├── ResidentAccount.jsx
│           ├── PayNow.jsx
│           └── Notices.jsx
└── README.md
```

---

## Setup — Backend (Flask + SQLite)

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1       # Windows: venv\Scripts\activate

pip install -r requirements.txt

python database.py              # creates ssr.db with schema
python seed_data.py             # loads residents, payments, expenses, notices

python app.py                   # starts API at http://localhost:5000
```

Verify it's running:
```bash
curl http://localhost:5000/api/dashboard/summary
```

## Setup — Frontend (React + Vite)

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev                     # starts dev server at http://localhost:5173
```

Open **http://localhost:5173** in your browser. The Vite dev server proxies
`/api/*` requests to the Flask backend on port 5000 (configured in
`vite.config.js`), so both must be running.

---

## How the data flows

1. `seed_data.py` contains the real resident list, monthly dues, and a
   12-month payment history (paid/overdue/partial) derived from your
   `SSROA_Recon_Mar21_onwards.xlsx` file, plus recent expenses and notices.
2. `app.py` exposes this as a REST API — residents, payments, expenses,
   arrears, notices, and settings — with endpoints to update payments
   (e.g. when a resident pays through "Pay Now"), add expenses, and add
   notices.
3. The React frontend calls these endpoints via `src/api.js` and renders
   two views: a **Committee dashboard** (collections, expenses, arrears,
   settings) and a **Resident portal** (account, pay now, notices). Switch
   between them using the role selector in the top bar.

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/residents` | All 33 flats |
| GET | `/api/residents/<flat_id>` | Single flat |
| GET | `/api/payments?flat_id=&month=&status=` | Filtered payment records |
| PATCH | `/api/payments/<id>` | Mark a payment as paid |
| GET | `/api/dashboard/summary` | Aggregated dashboard metrics |
| GET | `/api/dashboard/collection-rate?months=6` | Monthly collection % |
| GET | `/api/arrears` | Flats with outstanding dues |
| GET | `/api/arrears/<flat_id>` | 12-month history for one flat |
| GET | `/api/expenses?month=` | Expense records |
| POST | `/api/expenses` | Add an expense |
| GET | `/api/notices` | All notices |
| POST | `/api/notices` | Add a notice |
| GET | `/api/settings` | Building/association settings |
| PATCH | `/api/settings` | Update settings |

---

## Updating with your real bank statement data

Right now `seed_data.py` uses representative payment-status data (paid /
overdue / partial per month) since cross-referencing 1,000+ raw bank
transactions to per-flat-per-month status requires some manual mapping
decisions (e.g. how partial payments or "Banking" rows like interest credits
should be treated).

To plug in your actual reconciled numbers: open `seed_data.py`, edit the
`PAYMENT_STATUS` dictionary (one list of 12 values per flat) and the
`EXPENSES` / `NOTICES` lists, then re-run:

```bash
python seed_data.py
```

This re-seeds `ssr.db` from scratch — re-run any time you have new data.

---

## Next steps you may want

- **Authentication** — currently the resident view is hardcoded to Flat 302
  (see `MY_FLAT` constant in `ResidentAccount.jsx` and `PayNow.jsx`). Add a
  login system to let each resident see only their own flat.
- **Real payments** — the "Pay Now" flow currently just marks the payment as
  paid in the database. To accept real money, integrate a payment gateway
  (Razorpay, Stripe, etc.) and call `/api/payments/<id>` from its webhook.
- **Bank statement import** — write a script that parses your bank statement
  CSV/Excel rows and auto-updates the `payments` table.
