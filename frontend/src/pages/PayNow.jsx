import { useEffect, useState } from "react";
import { api } from "../api";
import { C, inr } from "../theme";
import { useIsMobile } from "../hooks";

const MY_FLAT = "302";

export default function PayNow() {
  const isMobile = useIsMobile();
  const [resident, setResident] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null); // the oldest unpaid/overdue payment row
  const [method, setMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await api.getResident(MY_FLAT);
        const payments = await api.getPayments({ flat_id: MY_FLAT });
        const unpaid = payments.find((p) => p.status === "overdue" || p.status === "partial");
        if (!cancelled) {
          setResident(r);
          setPendingPayment(unpaid || payments[payments.length - 1]);
        }
      } catch (err) {
        console.error("Failed to load payment info:", err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handlePay = async () => {
    if (!pendingPayment) return;
    setSubmitting(true);
    try {
      await api.updatePayment(pendingPayment.id, {
        status: "paid",
        amount_paid: pendingPayment.amount_due,
        paid_date: new Date().toISOString().slice(0, 10),
        payment_mode: method,
        reference: `${method}/${pendingPayment.month.replace(" ", "")}/${MY_FLAT}`,
      });
      setDone(true);
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pad = isMobile ? "14px" : "22px 28px";

  if (!resident || !pendingPayment) {
    return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Loading…</div>;
  }

  if (done) {
    return (
      <div style={{ padding: isMobile ? "14px" : "60px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.accentText, marginBottom: 6 }}>Payment submitted!</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>{inr(pendingPayment.amount_due)} for {pendingPayment.month} · Flat {MY_FLAT}</div>
        <button
          onClick={() => { setDone(false); window.location.reload(); }}
          style={{ marginTop: 20, padding: "8px 20px", border: "0.5px solid #ddd2c8", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 13 }}
        >
          Make another payment
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: pad, maxWidth: 460 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 16 }}>Pay maintenance</div>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>Flat</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{MY_FLAT} — {resident.name}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>For month</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{pendingPayment.month}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "0.5px solid #eee8e2", borderBottom: "0.5px solid #eee8e2", margin: "12px 0" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Amount due</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.brand }}>{inr(pendingPayment.amount_due)}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Payment method</div>
          {["UPI", "NEFT / IMPS", "Net banking"].map((m) => (
            <label key={m} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>
              <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} /> {m}
            </label>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>UPI ID / Account number</div>
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #ddd2c8", borderRadius: 8, fontSize: 13 }}
          />
        </div>
        <button
          onClick={handlePay}
          disabled={submitting}
          style={{ width: "100%", padding: 12, fontSize: 14, fontWeight: 700, background: C.brand, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}
        >
          {submitting ? "Processing…" : `Pay ${inr(pendingPayment.amount_due)}`}
        </button>
        <div style={{ fontSize: 11, color: "#bcaea1", textAlign: "center", marginTop: 10 }}>
          Payment will be credited to the SSROA bank account
        </div>
      </div>
    </div>
  );
}
