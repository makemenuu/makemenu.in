"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Brand Tokens ────────────────────────────────────────────────
const R = "#e8192c";
const R10 = "#fef2f2";
const R20 = "#fecdd3";
const INK = "#0f172a";
const SUB = "#475569";
const MUTED = "#94a3b8";
const RULE = "#e2e8f0";
const SURFACE = "#f8fafc";

// ─── Section registry ────────────────────────────────────────────
const NAV = [
  { id: "s01", label: "01", title: "Acceptance of Terms" },
  { id: "s02", label: "02", title: "About MakeMenu.in" },
  { id: "s03", label: "03", title: "Eligibility" },
  { id: "s04", label: "04", title: "Account Registration" },
  { id: "s05", label: "05", title: "Free Trial & Subscription" },
  { id: "s06", label: "06", title: "Cancellation & Refunds" },
  { id: "s07", label: "07", title: "Acceptable Use" },
  { id: "s08", label: "08", title: "Your Content & Images" },
  { id: "s09", label: "09", title: "Customer Orders" },
  { id: "s10", label: "10", title: "Intellectual Property" },
  { id: "s11", label: "11", title: "Service Availability" },
  { id: "s12", label: "12", title: "Limitation of Liability" },
  { id: "s13", label: "13", title: "Termination" },
  { id: "s14", label: "14", title: "Governing Law" },
  { id: "s15", label: "15", title: "Amendments" },
  { id: "s16", label: "16", title: "Contact Us" },
];

// ─── Tiny helpers ────────────────────────────────────────────────
const P = ({ children, mt = 12 }: { children: React.ReactNode; mt?: number }) => (
  <p style={{ margin: `${mt}px 0 0`, color: SUB, fontSize: 15, lineHeight: 1.85, fontWeight: 400 }}>
    {children}
  </p>
);

const SectionHeading = ({ label, title }: { label: string; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: R, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}>
      {label}
    </span>
    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: INK, letterSpacing: "-0.02em", fontFamily: "'Sora', sans-serif" }}>
      {title}
    </h2>
  </div>
);

const Divider = () => <div style={{ height: 1, background: RULE, margin: "48px 0" }} />;

const Tag = ({ children, color = R }: { children: React.ReactNode; color?: string }) => (
  <span style={{ display: "inline-block", background: color === R ? R10 : "#f0fdf4", color, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 99, border: `1px solid ${color === R ? R20 : "#bbf7d0"}`, textTransform: "uppercase" as const }}>
    {children}
  </span>
);

// ─── Callout box ────────────────────────────────────────────────
type Mood = "red" | "amber" | "blue" | "green";
const Callout = ({ mood = "blue", icon, title, children }: { mood?: Mood; icon: string; title: string; children: React.ReactNode }) => {
  const map = {
    red:   { bg: R10,       border: R20,       text: R,         bodyColor: "#7f1d1d" },
    amber: { bg: "#fffbeb", border: "#fde68a", text: "#b45309", bodyColor: "#78350f" },
    blue:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", bodyColor: "#1e3a5f" },
    green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", bodyColor: "#14532d" },
  };
  const c = map[mood];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: "18px 22px", margin: "24px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: c.text, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: c.bodyColor, lineHeight: 1.75 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Table ───────────────────────────────────────────────────────
const Table = ({ cols, rows }: { cols: string[]; rows: (string | React.ReactNode)[][] }) => (
  <div style={{ borderRadius: 14, border: `1px solid ${RULE}`, overflow: "hidden", margin: "20px 0" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: SURFACE }}>
          {cols.map((c, i) => (
            <th key={i} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 800, color: R, letterSpacing: "0.12em", textTransform: "uppercase" as const, borderBottom: `1px solid ${RULE}` }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : SURFACE }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: "13px 18px", fontSize: 14, color: ci === 0 ? INK : SUB, fontWeight: ci === 0 ? 600 : 400, borderBottom: ri < rows.length - 1 ? `1px solid ${RULE}` : "none", lineHeight: 1.65, verticalAlign: "top" as const }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Check / Cross list ─────────────────────────────────────────
const CheckList = ({ items, type }: { items: string[]; type: "check" | "cross" }) => (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, margin: "8px 0" }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ width: 20, height: 20, borderRadius: 6, background: type === "check" ? "#dcfce7" : R10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 11, fontWeight: 800, color: type === "check" ? "#16a34a" : R }}>
          {type === "check" ? "✓" : "✕"}
        </span>
        <span style={{ fontSize: 14, color: SUB, lineHeight: 1.7 }}>{item}</span>
      </div>
    ))}
  </div>
);

// ─── Bullet list ────────────────────────────────────────────────
const BulletList = ({ items }: { items: React.ReactNode[] }) => (
  <ul style={{ margin: "12px 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 8 }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: R, flexShrink: 0, marginTop: 9 }} />
        <span style={{ fontSize: 14, color: SUB, lineHeight: 1.75 }}>{item}</span>
      </li>
    ))}
  </ul>
);

// ─── Step card for dispute resolution ───────────────────────────
const StepCard = ({ step, title, desc, time }: { step: string; title: string; desc: string; time: string }) => (
  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 0", borderBottom: `1px solid ${RULE}` }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: R, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{step}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: SUB, lineHeight: 1.7 }}>{desc}</div>
      <div style={{ display: "inline-block", background: R10, border: `1px solid ${R20}`, borderRadius: 8, padding: "4px 12px", fontSize: 12, color: R, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap" as const }}>{time}</div>
    </div>
  </div>
);

// ─── Phase card ─────────────────────────────────────────────────
const PhaseCard = ({ phase, title, desc, accent, bg, border }: { phase: string; title: string; desc: string; accent: string; bg: string; border: string }) => (
  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 24, flex: 1, minWidth: 0 }}>
    <Tag color={accent}>{phase}</Tag>
    <div style={{ fontSize: 18, fontWeight: 800, color: INK, marginTop: 12, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{title}</div>
    <p style={{ margin: 0, fontSize: 13.5, color: SUB, lineHeight: 1.75 }}>{desc}</p>
  </div>
);

// ─── Contact card ───────────────────────────────────────────────
const ContactCard = ({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) => (
  <div style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column" as const, gap: 6, flex: 1 }}>
    <span style={{ fontSize: 28 }}>{icon}</span>
    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{label}</div>
    <a href={`mailto:${value}`} style={{ fontSize: 15, fontWeight: 700, color: R, textDecoration: "none" }}>{value}</a>
    <div style={{ fontSize: 12.5, color: MUTED }}>{sub}</div>
  </div>
);

// ─── Mobile Nav Drawer ───────────────────────────────────────────
const MobileNavDrawer = ({ isOpen, activeId, onClose, onJump }: { isOpen: boolean; activeId: string; onClose: () => void; onJump: (id: string) => void }) => (
  <>
    {/* Backdrop */}
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 998,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.25s ease",
        backdropFilter: "blur(4px)",
      }}
    />
    {/* Drawer */}
    <div style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 280, background: "#fff",
      zIndex: 999, overflowY: "auto", padding: "24px 0 48px",
      transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.3s cubic-bezier(.22,1,.36,1)",
      boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
    }}>
      {/* Drawer header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 20px", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.15em", textTransform: "uppercase" as const }}>On This Page</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: MUTED, fontSize: 20, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ paddingTop: 12 }}>
        {NAV.map(({ id, label, title }) => (
          <button
            key={id}
            onClick={() => { onJump(id); onClose(); }}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              background: activeId === id ? R10 : "none",
              border: "none",
              borderLeft: `2px solid ${activeId === id ? R : "transparent"}`,
              padding: "10px 20px", cursor: "pointer", textAlign: "left",
              color: activeId === id ? R : SUB, fontSize: 13,
              fontFamily: "'Inter', sans-serif", fontWeight: activeId === id ? 700 : 400,
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, color: activeId === id ? R : MUTED, minWidth: 22, fontVariantNumeric: "tabular-nums" }}>{label}</span>
            <span style={{ lineHeight: 1.4 }}>{title}</span>
          </button>
        ))}
      </div>
    </div>
  </>
);

// ─── Main component ──────────────────────────────────────────────
export default function TermsPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState("s01");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Intersection observer for active nav
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    NAV.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Find current section title for mobile FAB label
  const currentSection = NAV.find(n => n.id === activeId);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', 'DM Sans', sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${R20}; }
        .nav-item { transition: all 0.15s ease; border-left: 2px solid transparent; }
        .nav-item:hover { background: ${R10}; color: ${R} !important; border-left-color: ${R20}; }
        .nav-item.active { background: ${R10}; color: ${R} !important; border-left-color: ${R}; font-weight: 700 !important; }
        .section-block { scroll-margin-top: 80px; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hero-in { animation: fadeSlideUp 0.55s cubic-bezier(.22,1,.36,1) both; }
        .hero-in-2 { animation: fadeSlideUp 0.55s 0.1s cubic-bezier(.22,1,.36,1) both; }
        .hero-in-3 { animation: fadeSlideUp 0.55s 0.2s cubic-bezier(.22,1,.36,1) both; }

        /* ── Desktop layout ─────────────────────────────────────── */
        .layout-wrap { display: flex; max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .sidebar-nav { display: block; }
        .two-up { display: flex; }
        .hero-h { font-size: 44px; }
        .main-content { padding-left: 48px; }
        .hero-wrap { padding: 72px 32px 60px; }
        .hero-meta { flex-direction: row; }
        .summary-banner { padding: 0 32px; }
        .mobile-nav-fab { display: none; }
        .table-scroll { overflow-x: auto; }

        /* ── Mobile breakpoint ──────────────────────────────────── */
        @media (max-width: 768px) {
          .layout-wrap { flex-direction: column; padding: 0 16px; }
          .sidebar-nav { display: none !important; }
          .two-up { flex-direction: column; gap: 12px !important; }
          .hero-h { font-size: 28px !important; line-height: 1.2 !important; }
          .main-content { padding-left: 0 !important; padding-top: 32px !important; padding-bottom: 80px !important; }
          .hero-wrap { padding: 48px 16px 40px !important; }
          .hero-meta { flex-direction: column !important; align-items: center !important; gap: 6px !important; }
          .summary-banner { padding: 0 16px !important; }
          .mobile-nav-fab { display: flex !important; }
          .section-block { scroll-margin-top: 80px; }
          .stat-cards { flex-direction: column !important; }
          .grid-info { grid-template-columns: repeat(2, 1fr) !important; }
          .step-card-time { display: inline-block !important; margin-top: 8px; }
          .contact-cards { flex-direction: column !important; }
          /* Make tables horizontally scrollable on mobile */
          .table-scroll { -webkit-overflow-scrolling: touch; }
          .table-scroll table { min-width: 480px; }
          /* Tighten dividers on mobile */
          .section-divider { margin: 32px 0 !important; }
          /* Hero pill smaller on mobile */
          .hero-pill { padding: 5px 12px !important; }
          .hero-pill span { font-size: 11px !important; }
          /* Uptime cards stack */
          .uptime-cards { flex-wrap: wrap !important; }
          .uptime-card { min-width: calc(50% - 6px) !important; }
          /* IP ownership cards */
          .ip-cards { flex-direction: column !important; gap: 12px !important; }
          /* Acceptable use */
          .acceptable-use { flex-direction: column !important; gap: 12px !important; }
          /* Termination cards */
          .termination-card { flex-direction: column !important; }
          .termination-icon { width: 32px !important; height: 32px !important; font-size: 16px !important; }
          /* Phase cards */
          .phase-cards { flex-direction: column !important; gap: 12px !important; }
          /* Callout tighter */
          .callout-inner { padding: 14px 16px !important; }
          /* SectionHeading title smaller */
          .section-heading-title { font-size: 18px !important; }
          /* Plain summary narrower */
          .summary-inner { gap: 10px !important; }
          .summary-inner p { font-size: 12.5px !important; }
          /* Back link */
          .back-link-wrap { padding-bottom: 40px; }
        }

        /* ── Small mobile (≤ 380px) ─────────────────────────────── */
        @media (max-width: 380px) {
          .hero-h { font-size: 24px !important; }
          .grid-info { grid-template-columns: 1fr !important; }
          .uptime-card { min-width: 100% !important; }
        }

        /* ── FAB pulse ──────────────────────────────────────────── */
        @keyframes fabPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .fab-btn { transition: box-shadow 0.15s ease, transform 0.15s ease; }
        .fab-btn:active { transform: scale(0.96) !important; box-shadow: 0 2px 8px rgba(232,25,44,0.25) !important; }
      `}</style>

      {/* ── MOBILE NAV DRAWER ─────────────────────────────────── */}
      <MobileNavDrawer
        isOpen={drawerOpen}
        activeId={activeId}
        onClose={() => setDrawerOpen(false)}
        onJump={jump}
      />

      {/* ── MOBILE STICKY FAB ─────────────────────────────────── */}
      <div className="mobile-nav-fab" style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 990, display: "none", // overridden by media query
      }}>
        <button
          className="fab-btn"
          onClick={() => setDrawerOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: INK, color: "#fff",
            border: "none", borderRadius: 99, cursor: "pointer",
            padding: "12px 20px 12px 16px",
            boxShadow: "0 4px 20px rgba(15,23,42,0.35)",
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
            whiteSpace: "nowrap" as const, maxWidth: "calc(100vw - 40px)",
          }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 6, background: R, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
            {currentSection?.label}
          </div>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentSection?.title}
          </span>
          <span style={{ color: MUTED, fontSize: 10, flexShrink: 0 }}>☰</span>
        </button>
      </div>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="hero-wrap" style={{ background: `linear-gradient(160deg, ${SURFACE} 0%, #fff 60%)`, borderBottom: `1px solid ${RULE}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          {/* Pill */}
          <div className="hero-in hero-pill" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: R10, border: `1px solid ${R20}`, borderRadius: 99, padding: "6px 16px", marginBottom: 28 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={R} strokeWidth="1.5"/><path d="M7 4.5v3l1.5 1.5" stroke={R} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: R, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Legal Document · Effective 18 April 2026</span>
          </div>

          {/* Headline */}
          <h1 className="hero-in-2 hero-h" style={{ fontWeight: 800, color: INK, lineHeight: 1.15, letterSpacing: "-0.03em", fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
            Terms &amp; Conditions
          </h1>
          <p className="hero-in-3" style={{ fontSize: 16, color: SUB, lineHeight: 1.8, maxWidth: 560, margin: "0 auto 36px" }}>
            These terms govern your use of MakeMenu.in — our QR code digital menu platform for Indian restaurants. Governed by the laws of India, jurisdiction in Chennai, Tamil Nadu.
          </p>

          {/* Meta row */}
          <div className="hero-in-3 hero-meta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" as const }}>
            {[
              ["📅", "Effective: 18 April 2026"],
              ["⚖️", "Governed by Laws of India"],
              ["📍", "Jurisdiction: Chennai, TN"],
              ["🏷️", "Version 1.0"],
            ].map(([icon, text]) => (
              <div key={text as string} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${RULE}`, borderRadius: 10, padding: "6px 14px", fontSize: 12.5, color: SUB, fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: 13 }}>{icon as string}</span>
                {text as string}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUMMARY BANNER ────────────────────────────────────── */}
      <div className="summary-banner" style={{ background: INK }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0" }}>
          <div className="summary-inner" style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: R, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>📋</span>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Plain Language Summary</span>
              <p style={{ margin: 0, fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.75 }}>
                By using MakeMenu.in you agree to these terms. You get a <strong style={{ color: "#fff" }}>free trial</strong>, then a <strong style={{ color: "#fff" }}>paid subscription</strong>. You <strong style={{ color: "#fff" }}>own your menu content</strong>. We own the platform. Don't misuse the service. If something goes wrong, our liability is limited to what you paid us. Disputes are resolved in <strong style={{ color: "#fff" }}>Chennai courts</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────── */}
      <div className="layout-wrap">

        {/* ── SIDEBAR NAV ─────────────────────────────────────── */}
        <aside className="sidebar-nav" style={{ width: 240, flexShrink: 0, paddingTop: 48, paddingRight: 24, position: "sticky", top: 0, height: "100vh", overflowY: "auto", paddingBottom: 48 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 12, paddingLeft: 16 }}>On This Page</div>
          {NAV.map(({ id, label, title }) => (
            <button
              key={id}
              onClick={() => jump(id)}
              className={`nav-item${activeId === id ? " active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", borderLeft: "2px solid transparent", padding: "8px 14px 8px 14px", cursor: "pointer", textAlign: "left", color: activeId === id ? R : SUB, fontSize: 13, fontFamily: "'Inter', sans-serif", borderRadius: "0 8px 8px 0", marginBottom: 2 }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, color: activeId === id ? R : MUTED, minWidth: 22, fontVariantNumeric: "tabular-nums" }}>{label}</span>
              <span style={{ lineHeight: 1.4 }}>{title}</span>
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────── */}
        <main className="main-content" style={{ flex: 1, minWidth: 0, paddingTop: 48, paddingBottom: 96 }}>

          {/* ─ 01 ─ */}
          <div id="s01" className="section-block">
            <SectionHeading label="01" title="Acceptance of Terms" />
            <P>By accessing, registering on, or using MakeMenu.in ("the Platform", "we", "us", "our"), you ("Restaurant Owner", "User", or "you") agree to be fully bound by these Terms and Conditions ("Terms").</P>
            <P mt={12}>These Terms form a legally binding agreement between you and MakeMenu.in under the laws of India, including the <strong>Information Technology Act, 2000</strong>, the <strong>Consumer Protection Act, 2019</strong>, and any other applicable Indian legislation.</P>
            <Callout mood="amber" icon="⚠️" title="If You Do Not Agree">
              Please do not register, access, or use MakeMenu.in. Continued use of the platform after any update to these Terms constitutes your acceptance of the revised Terms.
            </Callout>
          </div>

          <Divider />

          {/* ─ 02 ─ */}
          <div id="s02" className="section-block">
            <SectionHeading label="02" title="About MakeMenu.in" />
            <P>MakeMenu.in is a <strong>Software-as-a-Service (SaaS)</strong> platform that provides Indian restaurant owners with tools to build and share digital menus.</P>
            <div className="table-scroll">
              <Table
                cols={["Feature", "Description"]}
                rows={[
                  ["Digital Menu Builder", "Create and customise a digital menu with items, prices, descriptions, and dish photos"],
                  ["QR Code Generation", "Generate a unique QR code linked to your restaurant's live digital menu"],
                  ["Menu Sharing", "Allow customers to view your menu instantly by scanning the QR code"],
                  ["Customer Orders", "Enable customers to place orders directly through your QR menu (optional feature)"],
                ]}
              />
            </div>
            <Callout mood="blue" icon="ℹ️" title="Platform Availability">
              MakeMenu.in is currently available <strong>exclusively for restaurants operating within India</strong>. The platform is hosted on Vercel/Netlify infrastructure and accessible via makemenu.in.
            </Callout>
          </div>

          <Divider />

          {/* ─ 03 ─ */}
          <div id="s03" className="section-block">
            <SectionHeading label="03" title="Eligibility" />
            <P>To register and use MakeMenu.in as a Restaurant Owner, you must meet all of the following conditions:</P>
            <div className="table-scroll">
              <Table
                cols={["Requirement", "Details"]}
                rows={[
                  ["Age", "You must be at least 18 years of age"],
                  ["Legal Authority", "You must be an authorised representative of the restaurant or food business you are registering"],
                  ["Accurate Information", "You must provide truthful, accurate, and complete registration details"],
                  ["Content Rights", "You must have full legal rights to all menu content, text, and images you upload to the platform"],
                  ["Geography", "Your restaurant must be operating within India"],
                ]}
              />
            </div>
            <P>MakeMenu.in reserves the right to refuse registration or suspend accounts that do not meet these eligibility criteria.</P>
          </div>

          <Divider />

          {/* ─ 04 ─ */}
          <div id="s04" className="section-block">
            <SectionHeading label="04" title="Account Registration" />
            <P>Restaurant owners register on MakeMenu.in using their email address. By registering, you agree to:</P>
            <BulletList items={[
              "Provide accurate and current information during registration.",
              <>Keep your account credentials confidential and <strong>not share them</strong> with any third party.</>,
              <>Notify us immediately at <a href="mailto:makemenuu@gmail.com" style={{ color: R }}>makemenuu@gmail.com</a> if you suspect any unauthorised access to your account.</>,
              "Take full responsibility for all activity that occurs under your account.",
            ]} />
            <Callout mood="blue" icon="🔒" title="Account Security">
              MakeMenu.in will <strong>never ask for your password</strong> over email or phone. If you receive such a request, it is not from us — please report it immediately.
            </Callout>
            <P>Each account is for a single restaurant. If you manage multiple restaurants, a separate account is required for each unless otherwise agreed in writing with MakeMenu.in.</P>
          </div>

          <Divider />

          {/* ─ 05 ─ */}
          <div id="s05" className="section-block">
            <SectionHeading label="05" title="Free Trial & Subscription" />
            <P>MakeMenu.in operates on a free trial followed by a paid subscription model.</P>

            {/* Phase cards */}
            <div className="phase-cards two-up" style={{ display: "flex", gap: 16, margin: "24px 0" }}>
              <PhaseCard phase="Phase 1" title="Free Trial" desc="Full access to all platform features for the trial period specified at signup. No credit card required during trial." accent="#16a34a" bg="#f0fdf4" border="#bbf7d0" />
              <PhaseCard phase="Phase 2" title="Paid Subscription" desc="Continued access requires a paid plan. Pricing is published on makemenu.in at the time of subscription." accent={R} bg={R10} border={R20} />
            </div>

            <div className="table-scroll">
              <Table
                cols={["Term", "Details"]}
                rows={[
                  ["Trial Duration", "As specified on the platform at the time of your registration"],
                  ["Billing Cycle", "Monthly or annual — selected by you at time of subscription"],
                  ["Auto-Renewal", "Subscriptions auto-renew unless cancelled at least 7 days before the renewal date"],
                  ["Price Changes", "At least 30 days' prior written notice will be given before any pricing change"],
                  ["Suspension", "Access may be suspended if subscription payment fails and remains unpaid for 7 days"],
                ]}
              />
            </div>
            <Callout mood="amber" icon="💳" title="Payment Gateway">
              MakeMenu.in does not currently process payments directly. When a payment gateway is integrated, it will be governed by the gateway provider's own terms. We will update this section and notify all users before enabling payments.
            </Callout>
          </div>

          <Divider />

          {/* ─ 06 ─ */}
          <div id="s06" className="section-block">
            <SectionHeading label="06" title="Cancellation & Refunds" />
            <P>We believe in fair and transparent billing. Here is our complete cancellation and refund policy:</P>
            <div className="table-scroll">
              <Table
                cols={["Situation", "Policy"]}
                rows={[
                  ["Cancellation during free trial", "Cancel anytime — no charges incurred"],
                  ["Cancellation after billing", "Cancel anytime from your account dashboard. Access continues until the end of the current billing period."],
                  ["Pro-rated refunds", "Not offered for partial billing periods under standard circumstances"],
                  ["Refund eligibility", "Considered on a case-by-case basis where a technical failure caused by MakeMenu.in resulted in significant service unavailability"],
                  ["Refund request window", <>Must be submitted within <strong>7 days</strong> of the billing date to support@makemenu.in</>],
                  ["Processing time", "Approved refunds processed within 7–10 business days"],
                ]}
              />
            </div>
            <Callout mood="blue" icon="🗂️" title="How to Cancel">
              Log in to your MakeMenu.in account → <strong>Account Settings</strong> → Click <strong>"Cancel Subscription"</strong>. Alternatively, email <a href="mailto:makemenuu@gmail.com" style={{ color: R, fontWeight: 600 }}>makemenuu@gmail.com</a> with subject: <em>"Cancel Subscription — [Your Restaurant Name]"</em>.
            </Callout>
          </div>

          <Divider />

          {/* ─ 07 ─ */}
          <div id="s07" className="section-block">
            <SectionHeading label="07" title="Acceptable Use" />
            <P>MakeMenu.in is built for legitimate restaurant businesses. The following rules apply to all users:</P>

            <div className="acceptable-use two-up" style={{ display: "flex", gap: 16, margin: "24px 0" }}>
              {/* May */}
              <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#15803d", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>✓ You May</div>
                <CheckList type="check" items={[
                  "Create and publish your restaurant's genuine menu",
                  "Upload real photos of your dishes",
                  "Enable customer ordering through your menu",
                  "Share your QR code freely with customers",
                  "Update your menu content at any time",
                  "Use the platform for multiple outlets under one account (if permitted by your plan)",
                ]} />
              </div>
              {/* Must not */}
              <div style={{ flex: 1, background: R10, border: `1px solid ${R20}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: R, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>✕ You Must Not</div>
                <CheckList type="cross" items={[
                  "Upload false, misleading, or fraudulent menu information",
                  "Use images you do not have rights to",
                  "Collect customer data beyond what the platform supports",
                  "Attempt to hack, reverse-engineer, or copy the platform",
                  "Share your login credentials with others",
                  "Use the platform for any illegal business activity",
                  "Upload offensive, obscene, or harmful content",
                  "Resell or sublicense access to MakeMenu.in",
                ]} />
              </div>
            </div>

            <Callout mood="red" icon="🚫" title="Violation Consequences">
              Violation of this Acceptable Use Policy may result in <strong>immediate account suspension</strong> or <strong>permanent termination</strong> without notice and without refund. MakeMenu.in reserves the right to report illegal activity to the appropriate Indian authorities.
            </Callout>
          </div>

          <Divider />

          {/* ─ 08 ─ */}
          <div id="s08" className="section-block">
            <SectionHeading label="08" title="Your Content & Images" />
            <P>You retain <strong>full ownership</strong> of all menu content — including text, prices, descriptions, and dish photos — that you create and upload on MakeMenu.in.</P>
            <P mt={12}>By uploading content to MakeMenu.in, you grant us a limited, non-exclusive, royalty-free licence to store, display, and deliver that content solely for the purpose of operating your digital menu. We will <strong>never use your menu content or images for advertising, marketing, or any other purpose</strong> without your explicit written consent.</P>

            <div style={{ background: SURFACE, border: `1px solid ${RULE}`, borderRadius: 14, padding: "20px 24px", margin: "24px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: R, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 14 }}>Your Responsibilities for Uploaded Content</div>
              <BulletList items={[
                "All content you upload is accurate and not misleading to customers.",
                "You own or have the legal right to use all images uploaded to the platform.",
                "Your content does not infringe any third-party copyright, trademark, or other intellectual property right.",
                <>Your content does not violate any applicable Indian law including the <strong>IT Act 2000</strong> or <strong>Consumer Protection Act 2019</strong>.</>,
              ]} />
            </div>
            <P>MakeMenu.in is not responsible for the accuracy or legality of content uploaded by restaurant owners. Any claims arising from uploaded content are the sole responsibility of the respective restaurant owner.</P>
          </div>

          <Divider />

          {/* ─ 09 ─ */}
          <div id="s09" className="section-block">
            <SectionHeading label="09" title="Customer Orders" />
            <P>MakeMenu.in allows restaurant owners to optionally enable an ordering feature, through which customers who scan a QR code may place orders directly through the digital menu.</P>
            <div className="table-scroll">
              <Table
                cols={["Party", "Responsibility"]}
                rows={[
                  ["Restaurant Owner", "Solely responsible for fulfilling all orders placed through their menu. Responsible for menu accuracy, pricing, food quality, and delivery or table service."],
                  ["MakeMenu.in", "Acts only as the technology platform that facilitates order placement. We are not a party to the transaction between the restaurant and the customer."],
                  ["Customer (Diner)", "Responsible for providing accurate contact details when placing an order. Order disputes are between the customer and the restaurant owner."],
                ]}
              />
            </div>
            <Callout mood="amber" icon="🍽️" title="MakeMenu.in is Not a Food Delivery Service">
              We do not handle food, payments, or deliveries. We are a technology tool. All responsibility for food safety, <strong>FSSAI compliance</strong>, pricing accuracy, and order fulfilment rests entirely with the restaurant owner. Restaurant owners must comply with the <strong>Food Safety and Standards Act, 2006</strong>.
            </Callout>
          </div>

          <Divider />

          {/* ─ 10 ─ */}
          <div id="s10" className="section-block">
            <SectionHeading label="10" title="Intellectual Property" />

            <div className="ip-cards two-up" style={{ display: "flex", gap: 16, margin: "0 0 24px" }}>
              <div style={{ flex: 1, background: SURFACE, border: `1px solid ${RULE}`, borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>What MakeMenu.in Owns</div>
                <p style={{ margin: 0, fontSize: 14, color: SUB, lineHeight: 1.8 }}>All intellectual property in the MakeMenu.in platform — including the software, source code, algorithms, user interface design, branding, logo, QR generation technology, and database structure — is the <strong style={{ color: INK }}>exclusive property of MakeMenu.in</strong>. No rights, licences, or ownership of any platform IP are transferred to you by virtue of using or subscribing to MakeMenu.in.</p>
              </div>
              <div style={{ flex: 1, background: R10, border: `1px solid ${R20}`, borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: R, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>What You Own</div>
                <p style={{ margin: 0, fontSize: 14, color: SUB, lineHeight: 1.8 }}>You retain <strong style={{ color: INK }}>complete ownership</strong> of your menu content — the food items, descriptions, prices, and images you create and upload. MakeMenu.in makes no claim to ownership of your content.</p>
              </div>
            </div>

            <Callout mood="green" icon="📦" title="Data Portability">
              You may request an export of your menu data at any time by contacting <a href="mailto:makemenuu@gmail.com" style={{ color: R, fontWeight: 600 }}>Makemenuu@gmail.com</a>. We will provide your data in a standard format within <strong>7 business days</strong>.
            </Callout>
          </div>

          <Divider />

          {/* ─ 11 ─ */}
          <div id="s11" className="section-block">
            <SectionHeading label="11" title="Service Availability" />
            <P>MakeMenu.in aims to maintain high platform availability. However, as a hosted SaaS product, we cannot guarantee 100% uninterrupted service.</P>

            {/* Uptime stat cards */}
            <div className="uptime-cards" style={{ display: "flex", gap: 12, margin: "24px 0 20px", flexWrap: "wrap" as const }}>
              {[["99%", "Target Monthly Uptime"], ["24 hrs", "Advance Maintenance Notice"], ["7 days", "Refund Request Window"]].map(([stat, label]) => (
                <div key={label as string} className="uptime-card" style={{ flex: 1, minWidth: 140, background: SURFACE, border: `1px solid ${RULE}`, borderRadius: 14, padding: "18px 22px", textAlign: "center" as const }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: R, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.03em" }}>{stat as string}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 4, fontWeight: 500 }}>{label as string}</div>
                </div>
              ))}
            </div>

            <div className="table-scroll">
              <Table
                cols={["Type", "Our Commitment"]}
                rows={[
                  ["Target Uptime", "We aim for at least 99% monthly uptime, excluding scheduled maintenance"],
                  ["Scheduled Maintenance", "We will provide at least 24 hours' advance notice via email for planned downtime"],
                  ["Unplanned Outages", "We will communicate status and estimated resolution time via support@makemenu.in"],
                  ["Force Majeure", "We are not liable for downtime caused by events beyond our reasonable control including internet failures, natural disasters, or hosting provider outages"],
                ]}
              />
            </div>
          </div>

          <Divider />

          {/* ─ 12 ─ */}
          <div id="s12" className="section-block">
            <SectionHeading label="12" title="Limitation of Liability" />
            <P>To the maximum extent permitted under applicable Indian law, MakeMenu.in's liability is strictly limited as follows:</P>
            <div className="table-scroll">
              <Table
                cols={["Scenario", "Our Liability"]}
                rows={[
                  ["Maximum total liability per claim", "Limited to the total subscription fees paid by you in the 3 months preceding the claim"],
                  ["Loss of business or revenue", "Not liable"],
                  ["Loss of data due to user error", "Not liable"],
                  ["Indirect or consequential damages", "Not liable"],
                  ["Disputes between restaurant and customer", "Not liable — MakeMenu.in is a technology facilitator only"],
                  ["Content uploaded by restaurant owners", "Not liable — sole responsibility of the restaurant owner"],
                ]}
              />
            </div>
            <Callout mood="blue" icon="⚖️" title="Important Exception">
              Nothing in these Terms excludes liability for <strong>death, personal injury, or fraud</strong> resulting directly from our negligence or wilful misconduct, as required under Indian law.
            </Callout>
          </div>

          <Divider />

          {/* ─ 13 ─ */}
          <div id="s13" className="section-block">
            <SectionHeading label="13" title="Termination" />

            <div style={{ display: "grid", gap: 16, margin: "0 0 24px" }}>
              {[
                { who: "By You", desc: "You may terminate your MakeMenu.in account at any time by cancelling your subscription through your account dashboard or by emailing Makemenuu@gmail.com. Access continues until the end of your current billing period.", icon: "👤" },
                { who: "By MakeMenu.in", desc: "We may terminate with 30 days' written notice for any reason, or immediately and without notice for material breach, illegal use, fraud, or actions that harm other users or MakeMenu.in.", icon: "🏢" },
                { who: "Effect of Termination", desc: "Your QR codes will be deactivated. Account data is retained for 12 months before permanent deletion. You may request a data export within 30 days of termination. Outstanding subscription fees remain payable.", icon: "📄" },
              ].map(({ who, desc, icon }) => (
                <div key={who} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: SURFACE, borderRadius: 14, padding: "18px 22px", border: `1px solid ${RULE}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: `1px solid ${RULE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: "0.01em" }}>Termination {who}</div>
                    <p style={{ margin: 0, fontSize: 14, color: SUB, lineHeight: 1.75 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Callout mood="amber" icon="💾" title="Before You Leave">
              We recommend exporting your menu data before terminating your account. Contact <a href="mailto:Makemenuu@gmail.com" style={{ color: R, fontWeight: 600 }}>Makemenuu@gmail.com</a> to request your data export.
            </Callout>
          </div>

          <Divider />

          {/* ─ 14 ─ */}
          <div id="s14" className="section-block">
            <SectionHeading label="14" title="Governing Law & Dispute Resolution" />
            <P>These Terms are governed by and shall be construed in accordance with the <strong>laws of India</strong>, including the Information Technology Act, 2000 and the Arbitration and Conciliation Act, 1996.</P>

            <div style={{ margin: "24px 0", border: `1px solid ${RULE}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: SURFACE, padding: "12px 20px", borderBottom: `1px solid ${RULE}`, fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Dispute Resolution Process</div>
              <div style={{ padding: "0 20px" }}>
                <StepCard step="01" title="Amicable Resolution" desc="Either party raises the dispute in writing to the other party." time="30 days to resolve" />
                <StepCard step="02" title="Arbitration" desc="If unresolved, referred to a single arbitrator appointed by mutual consent under the Arbitration and Conciliation Act, 1996." time="Within 15 days of Step 1 failure" />
                {/* Step 03 — inline time badge for mobile */}
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 0" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: R, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>03</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>Courts</div>
                    <div style={{ fontSize: 13.5, color: SUB, lineHeight: 1.7 }}>For matters not resolved by arbitration.</div>
                    <div style={{ display: "inline-block", background: R10, border: `1px solid ${R20}`, borderRadius: 8, padding: "4px 12px", fontSize: 12, color: R, fontWeight: 700, marginTop: 8 }}>Chennai courts</div>
                  </div>
                </div>
              </div>
            </div>
            <P>The seat of arbitration shall be <strong>Chennai, Tamil Nadu, India</strong>. The language of proceedings shall be English. The decision of the arbitrator shall be final and binding on both parties.</P>
          </div>

          <Divider />

          {/* ─ 15 ─ */}
          <div id="s15" className="section-block">
            <SectionHeading label="15" title="Amendments" />
            <P>MakeMenu.in reserves the right to update or modify these Terms at any time. When we make material changes, we will:</P>
            <BulletList items={[
              <>Notify all registered restaurant owners via email at least <strong>14 days</strong> before changes take effect.</>,
              <>Update the <em>"Effective Date"</em> at the top of this page.</>,
              "Maintain the previous version available on request.",
            ]} />
            <P mt={12}>Continued use of MakeMenu.in after the effective date of revised Terms constitutes your acceptance. If you do not agree to the revised Terms, you may close your account before the effective date without penalty.</P>
          </div>

          <Divider />

          {/* ─ 16 ─ */}
          <div id="s16" className="section-block">
            <SectionHeading label="16" title="Contact Us" />
            <P>Questions about these Terms? We're here to help. Reach out and we'll respond within 3 business days.</P>

            <div className="contact-cards two-up" style={{ display: "flex", gap: 16, margin: "28px 0" }}>
              <ContactCard icon="💬" label="General Support" value="Makemenuu@gmail.com" sub="For platform, billing, and general queries" />
              <ContactCard icon="⚖️" label="Legal & Privacy" value="Makemenuu@gmail.com" sub="For legal notices and privacy concerns" />
            </div>

            {/* Info grid */}
            <div className="grid-info" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "0 0 0" }}>
              {[
                ["📅", "Response Time", "Within 3 business days"],
                ["🌐", "Platform", "makemenu.in"],
                ["📍", "Jurisdiction", "Chennai, Tamil Nadu, India"],
                ["⚖️", "Governing Law", "Laws of India — IT Act 2000"],
              ].map(([icon, label, value]) => (
                <div key={label as string} style={{ background: SURFACE, border: `1px solid ${RULE}`, borderRadius: 12, padding: "16px 18px" }}>
                  <span style={{ fontSize: 18 }}>{icon as string}</span>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 8, marginBottom: 4 }}>{label as string}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{value as string}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── BACK TO HOME ──────────────────────────────────── */}
          <div className="back-link-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "60px", paddingTop: 48 }}>
            <div className="grid-of-boxes"></div>
            <a href="/" style={{ color: R, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textDecoration: "none" }}>BACK TO HOME →</a>
          </div>
        </main>
      </div>
    </div>
  );
}