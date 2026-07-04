// api.js — thin wrapper around the Flask REST API
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getResidents: () => request("/residents"),
  getResident: (flatId) => request(`/residents/${flatId}`),

  getPayments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/payments${qs ? `?${qs}` : ""}`);
  },
  updatePayment: (id, data) =>
    request(`/payments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getDashboardSummary: () => request("/dashboard/summary"),
  getCollectionRate: (months = 6) => request(`/dashboard/collection-rate?months=${months}`),

  getArrears: () => request("/arrears"),
  getArrearsDetail: (flatId) => request(`/arrears/${flatId}`),

  getExpenses: (month) => request(`/expenses${month ? `?month=${encodeURIComponent(month)}` : ""}`),
  addExpense: (data) => request("/expenses", { method: "POST", body: JSON.stringify(data) }),

  getNotices: () => request("/notices"),
  addNotice: (data) => request("/notices", { method: "POST", body: JSON.stringify(data) }),

  getSettings: () => request("/settings"),
  updateSettings: (data) => request("/settings", { method: "PATCH", body: JSON.stringify(data) }),
};
