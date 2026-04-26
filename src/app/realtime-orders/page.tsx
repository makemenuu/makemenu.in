"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { PageId } from "./types";
import { sharedCSS } from "./styles";

const dashboardFeatures = [
  {
    icon: "🔔",
    title: "Instant alerts",
    desc: "Sound and visual alerts for every new order. You'll never miss one, even in a busy kitchen.",
  },
  {
    icon: "🏷️",
    title: "Order status flow",
    desc: "Move orders through New → Preparing → Ready → Served with one tap. Full kitchen visibility.",
  },
  {
    icon: "🖥️",
    title: "Multi-screen support",
    desc: "Run the dashboard on a tablet in the kitchen and a phone at the counter simultaneously.",
  },
  {
    icon: "📝",
    title: "Special instructions",
    desc: 'Customer notes ("no onion", "extra spicy") are shown clearly with each order item.',
  },
];

const liveOrders = [
  {
    table: "Table 4 — Order #051",
    badge: <span className="badge badge-red">New</span>,
    items: "1× Masala Dosa | 2× Filter Coffee | 1× Idli Sambar",
    total: "₹ 390",
    action: { label: "Accept", color: "#e63329" },
    borderColor: "#e63329",
    opacity: 1,
  },
  {
    table: "Table 9 — Order #050",
    badge: <span className="badge badge-blue">Preparing</span>,
    items: "2× Paneer Butter Masala | 4× Roti",
    total: "₹ 640",
    action: { label: "Ready ✓", color: "#2563eb" },
    borderColor: "#2563eb",
    opacity: 1,
  },
  {
    table: "Table 2 — Order #049",
    badge: <span className="badge badge-green">Served</span>,
    items: "1× Veg Biryani | 1× Raita | 2× Lassi",
    total: "₹ 520",
    action: null,
    borderColor: "#16a34a",
    opacity: 0.65,
  },
];

const RealtimePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="page-enter" style={{ paddingTop: "64px" }}>
      <style>
        {sharedCSS}
        {`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .live-dot { animation: pulse-dot 1.5s infinite; }
      `}
      </style>

      {/* Hero */}
      <div className="hero" style={{ minHeight: 480 }}>
        <div className="pattern-bg">
          <svg viewBox="0 0 800 600" fill="none">
            <circle cx="600" cy="400" r="200" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="150" cy="200" r="120" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-tag">⚡ Features</div>
          <h1>
            Orders appear
            <br />
            <em>the instant</em> they're placed
          </h1>
          <p>
            Your kitchen dashboard shows every order in real-time the moment a
            customer confirms — with table number, item list, and special notes.
          </p>

          <div className="hero-actions">
            <button className="btn-primary">See live dashboard</button>
            <button className="btn-outline" onClick={() => router.push("/")}>
              ← Back
            </button>
          </div>
        </div>

        {/* Live orders */}
        <div className="hero-visual">
          <div className="mock-panel">
            <div className="mock-header">
              <h4>⚡ Live Orders</h4>
              <span>
                <span className="live-dot">●</span> Live
              </span>
            </div>

            <div style={{ padding: 16 }}>
              {liveOrders.map((order, i) => (
                <div
                  key={i}
                  className="order-live"
                  style={{
                    borderLeftColor: order.borderColor,
                    opacity: order.opacity,
                  }}
                >
                  <div className="order-live-head">
                    <strong>{order.table}</strong>
                    {order.badge}
                  </div>

                  <div className="order-items-list">{order.items}</div>

                  <div className="order-footer">
                    <span className="order-total">{order.total}</span>

                    {order.action ? (
                      <button
                        className="order-btn"
                        style={{ background: order.action.color }}
                      >
                        {order.action.label}
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: ".75rem",
                          color: "#16a34a",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Complete
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="section-wrap gray-bg">
        <div className="section-eyebrow">Dashboard Features</div>
        <h2 className="section-title">
          Your kitchen's <em>command centre</em>
        </h2>

        <div className="cards-grid">
          {dashboardFeatures.map((f) => (
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
          <h2>Never miss an order again</h2>
          <p>Real-time orders work out of the box — zero configuration.</p>
        </div>

          <button
            className="btn-outline"
            onClick={() => router.push("/signup")}
          >
            Get Started →
          </button>
        </div>
      </div>
  );
};

export default RealtimePage;