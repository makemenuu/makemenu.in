"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { PageId } from "./types";
import { sharedCSS } from "./styles";



function QRPattern({ seed, size = 140 }: { seed: number; size?: number }) {
  const cols = 9;

  const cells = Array.from({ length: cols * cols }, (_, i) => {
    const hash = (seed * 31 + i * 17 + i * i) % 97;
    return hash > 44;
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 3,
        width: size,
      }}
    >
      {cells.map((filled, i) => (
        <span
          key={i}
          style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: 1,
            display: "block",
            background: filled ? "#1a1a1a" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

const qrTables = [
  { table: "Table 1", seed: 11 },
  { table: "Table 2", seed: 29 },
  { table: "Table 3", seed: 55 },
];

const genSteps = [
  {
    num: "1",
    icon: "🔑",
    title: "Sign up free",
    desc: "Create your MakeMenu account in under 2 minutes with your phone or email.",
  },
  {
    num: "2",
    icon: "🪑",
    title: "Enter table count",
    desc: "Tell us how many tables you have. We generate a unique QR for each one.",
  },
  {
    num: "3",
    icon: "📥",
    title: "Download & print",
    desc: "Download your QR codes as PDF or PNG. Print on card, paper, or acrylic stands.",
  },
  {
    num: "4",
    icon: "📍",
    title: "Place on tables",
    desc: "Stick, tape, or frame your QR on each table. Customers start ordering immediately.",
  },
];

const qrFeatures = [
  {
    icon: "🎨",
    title: "Branded QR codes",
    desc: "Add your restaurant logo to the centre of every QR code for a professional, branded look.",
  },
  {
    icon: "📄",
    title: "Tent card templates",
    desc: "Download ready-to-print tent card designs with your QR, restaurant name and branding included.",
  },
  {
    icon: "♾️",
    title: "Unlimited regeneration",
    desc: "Regenerate any QR code anytime if your URL changes. Old printed codes still work via redirects.",
  },
  {
    icon: "📊",
    title: "Scan analytics",
    desc: "See how many times each table's QR was scanned, peak hours, and conversion to orders.",
  },
];

const QRGenPage = () => {
  const router = useRouter();

  return (
    <div className="page-enter" style={{ paddingTop: "64px" }}>
      <style>{sharedCSS}</style>

      {/* Hero */}
      <div className="hero" style={{ minHeight: 480 }}>
        <div className="pattern-bg">
          <svg viewBox="0 0 800 600" fill="none">
            <circle cx="650" cy="200" r="180" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="100" cy="450" r="130" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-tag">🔳 Features</div>

          <h1>
            Generate print-ready
            <br />
            <em>QR codes</em> instantly
          </h1>

          <p>
            Create unique QR codes for every table in your restaurant. Download
            as high-res PNG or print-ready PDF in one click — completely free.
          </p>

          <div className="hero-actions">
            <button className="btn-outline" onClick={() => router.push("/")}>
              ← Back
            </button>
          </div>
        </div>

        {/* QR grid */}
        <div className="hero-visual">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {qrTables.map(({ table, seed }) => (
              <div key={table} className="qr-display" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: ".65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    marginBottom: 6,
                  }}
                >
                  {table}
                </div>

                <QRPattern seed={seed} size={100} />

                <div
                  style={{
                    fontFamily: "'Pacifico',cursive",
                    color: "#e63329",
                    fontSize: ".7rem",
                    marginTop: 6,
                  }}
                >
                  MakeMenu
                </div>

                <button
                  style={{
                    marginTop: 8,
                    fontSize: ".65rem",
                    fontWeight: 600,
                    background: "#e63329",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Download
                </button>
              </div>
            ))}

            {/* Add table */}
            <div
              style={{
                background: "#fff5f5",
                border: "2px dashed rgba(230,51,41,.3)",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                minHeight: 160,
              }}
            >
              <div style={{ color: "#e63329", fontSize: "1.8rem", fontWeight: 700 }}>
                +
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  color: "#e63329",
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                Add Table
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="section-wrap gray-bg">
        <div className="section-eyebrow">How to generate</div>
        <h2 className="section-title">
          QR codes for your <em>whole restaurant</em>
        </h2>

        <div className="steps-grid">
          {genSteps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="section-wrap">
        <div className="section-eyebrow">QR Features</div>
        <h2 className="section-title">
          More than just a <em>QR code</em>
        </h2>

        <div className="cards-grid">
          {qrFeatures.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="card-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div>
          <h2>Generate your QR codes for free</h2>
          <p>Ready in under 30 seconds. No design skills needed.</p>
        </div>

        <div className="cta-band-actions">
          <button className="btn-outline" onClick={() => router.push("/signup")}>
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGenPage;