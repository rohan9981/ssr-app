import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { C, inr } from "../theme";
import MetricCard from "../components/MetricCard";
import Tag from "../components/Tag";
import { useIsMobile } from "../hooks";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [rate, setRate] = useState([]);
  const [recentPaid, setRecentPaid] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, r, paid, over] = await Promise.all([
          api.getDashboardSummary(),
          api.getCollectionRate(6),
          api.getPayments({ status: "paid" }),
          api.getArrears(),
        ]);
        if (cancelled) return;
        setSummary(s);
        setRate(r);
        setRecentPaid(paid.slice(0, 4));
        setOverdue(over.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loading />;
  if (!summary) return <ErrorState />;

  const pad = isMobile ? "14px" : "22px 28px";

  return (
    <div style={{ padding: pad }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{summary.period} — overview</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Sai Shakti Residency Owners Association</div>
        </div>
        <button
          onClick={() => navigate("/arrears")}
          style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: C.brand, color: "#fff", border: "none", cursor: "pointer" }}
        >
          View arrears →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        <MetricCard label="Collected this month" value={inr(summary.collected_amount)} sub={`${summary.flats_paid} of ${summary.total_flats} flats paid`} accent={C.accent} />
        <MetricCard label="Outstanding arrears" value={inr(summary.arrears_total)} sub={`${summary.overdue_count} flats overdue`} accent={C.red} />
        <MetricCard label="Expenses this month" value={inr(summary.expenses_this_month)} sub="BESCOM, BWSSB, Security" accent={C.amber} />
        <MetricCard label="Bank balance" value={inr(summary.bank_balance)} sub="As of today" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Recent payments</div>
            <button onClick={() => navigate("/collections")} style={{ fontSize: 11, color: C.accentText, background: "none", border: "none", cursor: "pointer" }}>
              View all →
            </button>
          </div>
          {recentPaid.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f3efeb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.accentText }}>
                  {p.flat_id}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{p.month}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{p.payment_mode || "—"}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{inr(p.amount_paid)}</div>
                <Tag status="paid" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Overdue this month</div>
            <button onClick={() => navigate("/arrears")} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>
              Report →
            </button>
          </div>
          {overdue.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: C.accentText, fontSize: 14 }}>✓ All flats paid this month</div>
          )}
          {overdue.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f3efeb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.red }}>
                  {r.id}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>Owed: {inr(r.total_owed)}</div>
                </div>
              </div>
              <Tag status="overdue" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>Collection rate — last 6 months</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 6 : 14, height: 90 }}>
          {rate.map((m) => (
            <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: m.rate >= 90 ? C.accentText : m.rate >= 80 ? C.amber : C.red }}>{m.rate}%</div>
              <div
                style={{
                  width: "100%",
                  height: m.rate * 0.72,
                  background: m.rate >= 90 ? C.accent : m.rate >= 80 ? "#c89456" : C.red,
                  borderRadius: "4px 4px 0 0",
                  minHeight: 4,
                }}
              />
              <div style={{ fontSize: 10, color: C.textMuted }}>{m.month.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading dashboard…</div>;
}
function ErrorState() {
  return <div style={{ padding: 40, textAlign: "center", color: C.red }}>Couldn't load dashboard data. Is the backend running?</div>;
}
