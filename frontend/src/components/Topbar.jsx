import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../theme";

const COMMITTEE_NAV = [
  { label: "Dashboard", path: "/" },
  { label: "Collections", path: "/collections" },
  { label: "Expenses", path: "/expenses" },
  { label: "Arrears", path: "/arrears" },
  { label: "Settings", path: "/settings" },
];

const RESIDENT_NAV = [
  { label: "My Account", path: "/account" },
  { label: "Pay Now", path: "/pay" },
  { label: "Notices", path: "/notices" },
];

export default function Topbar({ role, setRole, isMobile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = role === "committee" ? COMMITTEE_NAV : RESIDENT_NAV;

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    navigate(newRole === "committee" ? "/" : "/account");
    setMenuOpen(false);
  };

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div style={{ background: C.brand, position: "sticky", top: 0, zIndex: 100 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "10px 14px" : "0 28px",
          height: isMobile ? "auto" : 54,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            SSR
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
              Sai Shakti Residency
            </div>
            {!isMobile && <div style={{ color: "#c9b8aa", fontSize: 10 }}>Owners Association</div>}
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", gap: 2 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: active ? "#fff" : "#c9b8aa",
                    fontSize: 13,
                    padding: "4px 12px",
                    borderRadius: 6,
                    borderBottom: `2px solid ${active ? C.accent : "transparent"}`,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "0.5px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: 12,
              borderRadius: 6,
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            <option value="committee">Committee</option>
            <option value="resident">Flat 302</option>
          </select>
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, padding: 0 }}
            >
              ☰
            </button>
          )}
        </div>
      </div>

      {isMobile && menuOpen && (
        <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "8px 14px 12px" }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: active ? "#fff" : "#c9b8aa",
                  fontSize: 14,
                  padding: "9px 6px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
