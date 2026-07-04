import { C } from "../theme";

export default function MetricCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        borderLeft: `3px solid ${accent || C.border}`,
      }}
    >
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent || C.textPrimary }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
