// theme.js — shared design tokens (brown palette)
export const C = {
  brand: "#3e2723",
  brandMid: "#4e342e",
  accent: "#8d6e52",
  accentBg: "#f1e9e1",
  accentText: "#6d4c3d",
  amber: "#b5791a",
  amberBg: "#fbeed8",
  red: "#a6453a",
  redBg: "#f6e2df",
  textPrimary: "#2b211c",
  textMuted: "#a89a8d",
  border: "#e8e2dc",
  surface: "#fff",
  bg: "#f7f5f3",
};

export function statusStyle(status) {
  if (status === "paid") return { bg: C.accentBg, color: C.accentText, label: "Paid" };
  if (status === "overdue") return { bg: C.redBg, color: C.red, label: "Overdue" };
  if (status === "partial") return { bg: C.amberBg, color: C.amber, label: "Partial" };
  return { bg: "#f0f0f0", color: "#666", label: "Pending" };
}

export function inr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export function initials(name) {
  return (name || "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
