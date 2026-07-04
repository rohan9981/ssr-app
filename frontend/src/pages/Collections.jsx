import { useEffect, useState } from "react";
import { api } from "../api";
import { C, inr, statusStyle } from "../theme";
import Tag from "../components/Tag";
import { useIsMobile } from "../hooks";

export default function Collections() {
  const isMobile = useIsMobile();
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState({}); // flat_id -> latest payment
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [res, settings] = await Promise.all([api.getResidents(), api.getSettings()]);
        if (cancelled) return;
        const currentMonth = settings.current_period;
        const pays = await api.getPayments({ month: currentMonth });
        if (cancelled) return;
        const map = {};
        pays.forEach((p) => { map[p.flat_id] = p; });
        setResidents(res);
        setPayments(map);
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>;

  const filtered = residents.filter((r) => {
    const status = payments[r.id]?.status || "pending";
    const matchFilter = filter === "all" || status === filter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    return matchFilter && matchSearch;
  });

  const pad = isMobile ? "14px" : "22px 28px";

  return (
    <div style={{ padding: pad }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 14 }}>Collections</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search flat or name…"
          style={{ flex: 1, minWidth: 140, padding: "7px 12px", border: `0.5px solid #ddd2c8`, borderRadius: 8, fontSize: 13 }}
        />
        {["all", "paid", "overdue", "partial"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              background: filter === f ? C.brand : "#f5f1ec",
              color: filter === f ? "#fff" : "#6b5d52",
              border: `0.5px solid ${filter === f ? C.brand : "#ddd2c8"}`,
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 70px 100px 90px", padding: "8px 14px", background: "#f9f6f3", borderBottom: "0.5px solid #eee8e2" }}>
            {["Flat", "Name", "Sq ft", "Due/mo", "Status"].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 500, color: C.textMuted }}>{h}</div>
            ))}
          </div>
        )}
        {filtered.map((r, i) => {
          const status = payments[r.id]?.status || "pending";
          const st = statusStyle(status);
          return (
            <div
              key={r.id}
              style={{
                display: isMobile ? "flex" : "grid",
                gridTemplateColumns: "80px 1fr 70px 100px 90px",
                alignItems: "center",
                justifyContent: isMobile ? "space-between" : undefined,
                padding: "10px 14px",
                borderBottom: i < filtered.length - 1 ? "0.5px solid #f3efeb" : "none",
                background: i % 2 ? "#fdfbf9" : "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: st.color, flexShrink: 0 }}>
                  {r.id}
                </div>
                {isMobile && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{r.sqft.toLocaleString()} sq ft · {inr(r.monthly_due)}/mo</div>
                  </div>
                )}
              </div>
              {!isMobile && (
                <>
                  <div style={{ fontSize: 13, color: C.textPrimary }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{r.sqft.toLocaleString()}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{inr(r.monthly_due)}</div>
                </>
              )}
              <div><Tag status={status} /></div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No results found</div>}
      </div>
    </div>
  );
}
