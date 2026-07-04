import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { C, inr, statusStyle } from "../theme";
import MetricCard from "../components/MetricCard";
import Avatar from "../components/Avatar";
import Tag from "../components/Tag";
import { useIsMobile } from "../hooks";

const MY_FLAT = "302"; // In a real app this comes from auth/login

export default function ResidentAccount() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [resident, setResident] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getArrearsDetail(MY_FLAT)
      .then((data) => {
        if (cancelled) return;
        setResident(data.resident);
        setHistory(data.history);
      })
      .catch(async () => {
        // Flat may have zero arrears, so /arrears/<id> works regardless (404 only if flat truly missing)
        try {
          const r = await api.getResident(MY_FLAT);
          const h = await api.getPayments({ flat_id: MY_FLAT });
          if (!cancelled) { setResident(r); setHistory(h); }
        } catch (err) {
          console.error("Failed to load resident account:", err);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>;
  if (!resident) return <div style={{ padding: 40, textAlign: "center", color: C.red }}>Could not load account.</div>;

  const arrearsTotal = history.filter((h) => h.status === "overdue").reduce((a, h) => a + (h.amount_due - h.amount_paid), 0);
  const lastPaid = [...history].reverse().find((h) => h.status === "paid");
  const pad = isMobile ? "14px" : "22px 28px";

  return (
    <div style={{ padding: pad }}>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "0.5px solid #eee8e2", flexWrap: "wrap" }}>
          <Avatar name={resident.name} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{resident.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Flat {resident.id} · {resident.sqft.toLocaleString()} sq ft · {resident.category}</div>
          </div>
          <Tag status={arrearsTotal > 0 ? "overdue" : "paid"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <MetricCard label="Monthly maintenance" value={inr(resident.monthly_due)} />
          <MetricCard label="Arrears" value={arrearsTotal > 0 ? inr(arrearsTotal) : "Nil"} accent={arrearsTotal > 0 ? C.red : C.accent} />
          <MetricCard label="Last paid" value={lastPaid ? lastPaid.month : "—"} accent={C.accent} />
        </div>

        {arrearsTotal === 0 ? (
          <div style={{ textAlign: "center", background: C.accentBg, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.accentText }}>You're all caught up!</div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/pay")}
            style={{ width: "100%", padding: 12, fontSize: 14, fontWeight: 700, background: C.brand, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}
          >
            Pay maintenance — {inr(resident.monthly_due)}
          </button>
        )}
      </div>

      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>Payment history — last 12 months</div>
        {history.map((h, i) => {
          const st = statusStyle(h.status);
          return (
            <div key={h.month} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < history.length - 1 ? "0.5px solid #f5f1ec" : "none" }}>
              <div>
                <div style={{ fontSize: 13, color: C.textPrimary }}>{h.month}</div>
                {h.status === "paid" && <div style={{ fontSize: 11, color: C.textMuted }}>{h.payment_mode || ""}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {h.amount_paid > 0 && <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{inr(h.amount_paid)}</div>}
                <Tag status={h.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
