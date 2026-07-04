import { useEffect, useState } from "react";
import { api } from "../api";
import { C } from "../theme";
import { useIsMobile } from "../hooks";

export default function Settings() {
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch((err) => console.error("Failed to load settings:", err));
  }, []);

  if (!settings) return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>;

  const fields = [
    { key: "building_name", label: "Building name" },
    { key: "association_name", label: "Association" },
    { key: "bank_account", label: "Bank account" },
    { key: "fee_revision_date", label: "Fee revision date" },
    { key: "current_period", label: "Current period" },
  ];

  const handleChange = (key, value) => setSettings({ ...settings, [key]: value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? "14px" : "22px 28px", maxWidth: 520 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 20 }}>Settings</div>
      {fields.map((f) => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{f.label}</div>
          <input
            value={settings[f.key] || ""}
            onChange={(e) => handleChange(f.key, e.target.value)}
            style={{ width: "100%", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 13, color: C.textPrimary }}
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: 6, background: C.brand, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, cursor: "pointer" }}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  );
}
