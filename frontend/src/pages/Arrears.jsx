import { useEffect, useState } from "react";
import { api } from "../api";
import { C, inr, statusStyle } from "../theme";
import MetricCard from "../components/MetricCard";
import Avatar from "../components/Avatar";
import { useIsMobile } from "../hooks";

export default function Arrears() {
  const isMobile = useIsMobile();
  const [defaulters, setDefaulters] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getArrears()
      .then((data) => { if (!cancelled) setDefaulters(data); })
      .catch((err) => console.error("Failed to load arrears:", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedFlat) { setDetail(null); return; }
    let cancelled = false;
    api.getArrearsDetail(selectedFlat)
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch((err) => console.error("Failed to load flat detail:", err));
    return () => { cancelled = true; };
  }, [selectedFlat]);

  const pad = isMobile ? "14px" : "22px 28px";

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>;

  if (selectedFlat && detail) {
    const { resident, history } = detail;
    return (
      <div style={{ padding: pad }}>
        <button onClick={() => setSelectedFlat(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accentText, fontSize: 13, marginBottom: 16, padding: 0 }}>
          ← Back to arrears
        </button>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "0.5px solid #eee8e2" }}>
            <Avatar name={resident.name} size={44} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{resident.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Flat {resident.id} · {resident.sqft.toLocaleString()} sq ft · {resident.category}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <MetricCard label="Monthly due" value={inr(resident.monthly_due)} />
            <MetricCard label="Total arrears" value={inr(history.filter(h => h.status === "overdue").reduce((a, h) => a + (h.amount_due - h.amount_paid), 0))} accent={C.red} />
            <MetricCard label="Months overdue" value={history.filter((h) => h.status === "overdue").length} accent={C.amber} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>Payment history — last 12 months</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
            {history.map((h) => {
              const st = statusStyle(h.status);
              return (
                <div key={h.month} style={{ background: st.bg, borderRadius: 7, padding: "7px 4px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: st.color, fontWeight: 500 }}>{h.month.split(" ")[0]}'{h.month.split(" ")[1].slice(2)}</div>
                  <div style={{ fontSize: 12, color: st.color }}>{h.status === "paid" ? "✓" : h.status === "overdue" ? "✗" : "~"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const totalOwed = defaulters.reduce((a, r) => a + r.total_owed, 0);
  const chronic = defaulters.filter((r) => r.months_overdue >= 3).length;

  return (
    <div style={{ padding: pad }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>Arrears report</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>{defaulters.length} flats with outstanding dues · Total: {inr(totalOwed)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <MetricCard label="Flats with arrears" value={defaulters.length} accent={C.red} />
        <MetricCard label="Total outstanding" value={inr(totalOwed)} accent={C.red} />
        <MetricCard label="Chronic (3+ months)" value={chronic} accent={C.amber} />
      </div>

      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px", padding: "8px 14px", background: "#f9f6f3", borderBottom: "0.5px solid #eee8e2" }}>
            {["Flat", "Name", "Total owed", ""].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 500, color: C.textMuted }}>{h}</div>
            ))}
          </div>
        )}
        {defaulters.length === 0 && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 14, color: C.accentText, fontWeight: 600 }}>No outstanding arrears</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>All residents are up to date</div>
          </div>
        )}
        {defaulters.map((r, i) => (
          <div
            key={r.id}
            style={{
              display: isMobile ? "flex" : "grid",
              gridTemplateColumns: "80px 1fr 120px 80px",
              alignItems: "center",
              justifyContent: isMobile ? "space-between" : undefined,
              padding: "11px 14px",
              borderBottom: i < defaulters.length - 1 ? "0.5px solid #f3efeb" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.red, flexShrink: 0 }}>
                {r.id}
              </div>
              {isMobile && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: C.red, fontWeight: 500 }}>{inr(r.total_owed)} owed</div>
                </div>
              )}
            </div>
            {!isMobile && (
              <>
                <div style={{ fontSize: 13, color: C.textPrimary }}>{r.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{inr(r.total_owed)}</div>
              </>
            )}
            <button
              onClick={() => setSelectedFlat(r.id)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, background: "none", border: "0.5px solid #ddd2c8", cursor: "pointer", color: "#6b5d52" }}
            >
              Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
