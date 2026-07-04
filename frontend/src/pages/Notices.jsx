import { useEffect, useState } from "react";
import { api } from "../api";
import { C } from "../theme";
import { useIsMobile } from "../hooks";

function tagColor(tag) {
  if (tag === "Finance") return { bg: C.amberBg, color: C.amber };
  if (tag === "Meeting") return { bg: "#eee6db", color: "#7a5c3a" };
  return { bg: C.accentBg, color: C.accentText };
}

export default function Notices() {
  const isMobile = useIsMobile();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotices()
      .then(setNotices)
      .catch((err) => console.error("Failed to load notices:", err))
      .finally(() => setLoading(false));
  }, []);

  const pad = isMobile ? "14px" : "22px 28px";

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>;

  return (
    <div style={{ padding: pad }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 16 }}>Notices & announcements</div>
      {notices.map((n) => {
        const tc = tagColor(n.tag);
        return (
          <div key={n.id} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10 }}>{n.tag}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>{n.date}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>{n.title}</div>
            <div style={{ fontSize: 13, color: "#5c4f44", lineHeight: 1.6 }}>{n.body}</div>
          </div>
        );
      })}
      {notices.length === 0 && <div style={{ textAlign: "center", color: C.textMuted, fontSize: 13, padding: 24 }}>No notices yet</div>}
    </div>
  );
}
