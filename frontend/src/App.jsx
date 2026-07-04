import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import Expenses from "./pages/Expenses";
import Arrears from "./pages/Arrears";
import Settings from "./pages/Settings";
import ResidentAccount from "./pages/ResidentAccount";
import PayNow from "./pages/PayNow";
import Notices from "./pages/Notices";
import { C } from "./theme";
import { useIsMobile } from "./hooks";

export default function App() {
  const [role, setRole] = useState("committee");
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      <Topbar role={role} setRole={setRole} isMobile={isMobile} />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Routes>
          {/* Committee routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/arrears" element={<Arrears />} />
          <Route path="/settings" element={<Settings />} />

          {/* Resident routes */}
          <Route path="/account" element={<ResidentAccount />} />
          <Route path="/pay" element={<PayNow />} />
          <Route path="/notices" element={<Notices />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
