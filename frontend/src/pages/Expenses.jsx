import { useEffect, useState } from "react";
import { api } from "../api";
import { C, inr } from "../theme";
import MetricCard from "../components/MetricCard";
import { useIsMobile } from "../hooks";

const MONTH_OPTIONS = ["Jun 2026", "May 2026", "Apr 2026"];

export default function Expenses() {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState("Jun 2026");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getExpenses(month)
      .then((data) => { if (!cancelled) setExpenses(data); })
      .catch((err) => console.error("Failed to load expenses:", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [month]);

  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pad = isMobile ? "14px" : "22px 28px";

  return (
    <div style={{ padding: pad }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Expenses</div>
        <div style={{ display: "flex", gap: 6 }}>
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
                background: month === m ? C.brand : "#f5f1ec",
                color: month === m ? "#fff" : "#6b5d52",
                border: `0.5px solid ${month === m ? C.brand : "#ddd2c8"}`,
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
            <MetricCard label={`Total — ${month}`} value={inr(total)} accent={C.amber} />
            {Object.entries(byCategory).slice(0, 3).map(([cat, amt]) => (
              <MetricCard key={cat} label={cat} value={inr(amt)} />
            ))}
          </div>

          <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            {expenses.map((e, i) => (
              <div
                key={e.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < expenses.length - 1 ? "0.5px solid #f3efeb" : "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f8f5f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {e.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{e.description}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{e.date} · {e.category}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{inr(e.amount)}</div>
              </div>
            ))}
            {expenses.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No expenses recorded for {month}</div>}
          </div>
        </>
      )}
    </div>
  );
}
