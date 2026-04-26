"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";
import { sharedCSS } from "./styles";

type MenuSetupPageProps = {
  onNavigate: (page: PageId) => void;
};

const setupSteps = [
  {
    num: "1",
    icon: "🏪",
    title: "Create your shop",
    desc: "Sign up and enter your restaurant name, address, and logo. Takes under 2 minutes",
  },
  {
    num: "2",
    icon: "📂",
    title: "Add categories",
    desc: "Create sections like Starters, Mains, Drinks, and Desserts. Drag to reorder anytime",
  },
  {
    num: "3",
    icon: "🍽️",
    title: "Add your items",
    desc: "Enter item name, description, price and photo. Mark it Veg/Non-Veg. Done",
  },
  {
    num: "4",
    icon: "🚀",
    title: "Publish and go live",
    desc: "Hit publish. Your QR code is generated instantly. Stick it on your tables and you're live",
  },
];

const managementCards = [
  {
    icon: "✏️",
    title: "Edit any time",
    desc: "Change prices, update photos, add new items, or remove dishes — changes go live instantly",
  },
  {
    icon: "🗂️",
    title: "Unlimited categories",
    desc: "Create as many sections and sub-categories as your menu needs. No limits",
  },
  {
    icon: "🔴",
    title: "Sold-out toggle",
    desc: "Mark items as unavailable with one tap. Customers won't see them until you re-enable",
  },
];

const menuRows = [
  {
    emoji: "🥗",
    bg: "linear-gradient(135deg,#fde8e8,#f9c9c9)",
    name: "Caesar Salad",
    sub: "Starters • Veg",
    price: "₹180",
    active: true,
  },
  {
    emoji: "☕",
    bg: "linear-gradient(135deg,#fff7ed,#fed7aa)",
    name: "Cappuccino",
    sub: "Beverages • Hot",
    price: "₹120",
    active: true,
  },
  {
    emoji: "🍕",
    bg: "linear-gradient(135deg,#fef9c3,#fef08a)",
    name: "Margherita",
    sub: "Mains • Pizza",
    price: "₹299",
    active: false,
  },
];

const MenuSetupPage: React.FC<MenuSetupPageProps> = ({ onNavigate }) => {
  const router = useRouter();

  return (
    <div className="page-enter" style={{ paddingTop: "64px" }}>
      <style>{sharedCSS}</style>

      {/* Hero */}
      <div className="hero" style={{ minHeight: 480 }}>
        <div className="pattern-bg" style={{ pointerEvents: "none" }}>
          <svg viewBox="0 0 800 600" fill="none">
            <circle cx="500" cy="300" r="220" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="200" cy="500" r="100" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero-content" style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-tag">⚙️ Features</div>

          <h1>
            Menu Setup in <br />
            <em>minutes, not hours</em>
          </h1>

          <p>
            Add your entire menu — categories, items, photos, prices and dietary tags —
            without any technical know-how. As simple as filling a form.
          </p>

          <div className="hero-actions">
            <button className="btn-primary">Set up my menu</button>

            <button
              className="btn-outline"
              onClick={() => router.push("/")}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Menu mock */}
        <div className="hero-visual">
          <div className="mock-panel">
            <div className="mock-header">
              <h4>⚙️ Menu Management</h4>
              <span>Edit mode</span>
            </div>

            {menuRows.map((row) => (
              <div key={row.name} className="mock-table-row">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: row.bg,
                    }}
                  >
                    {row.emoji}
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: "#1a1a1a" }}>
                      {row.name}
                    </div>
                    <div style={{ fontSize: ".75rem", color: "#6b7280" }}>
                      {row.sub}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#e63329",
                      fontSize: ".85rem",
                    }}
                  >
                    {row.price}
                  </span>

                  <span
                    className={`badge ${
                      row.active ? "badge-green" : "badge-gray"
                    }`}
                  >
                    {row.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}

            {/* Add item */}
            <div
              className="mock-table-row"
              style={{ background: "#fff5f5", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e63329",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  +
                </div>

                <div>
                  <div style={{ fontWeight: 500, color: "#e63329" }}>
                    Add new item
                  </div>
                  <div style={{ fontSize: ".75rem", color: "#6b7280" }}>
                    Click to add
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="section-wrap gray-bg">
        <div className="section-eyebrow">How to set up</div>

        <h2 className="section-title">
          Four steps to your <em>perfect menu</em>
        </h2>

        <div className="steps-grid">
          {setupSteps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Management */}
      <div className="section-wrap">
        <div className="section-eyebrow">Management Tools</div>

        <h2 className="section-title">
          Keep your menu <em>always up-to-date</em>
        </h2>

        <div className="cards-grid">
          {managementCards.map((card) => (
            <div key={card.title} className="feature-card">
              <div className="card-icon-wrap">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div>
          <h2>Set up your menu in minutes</h2>
          <p>Unlock premium features free for up to 40 days.</p>
        </div>

        <div className="cta-band-actions">
          <Link href="/signup" className="btn-outline">
            Proceed to Sign Up →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MenuSetupPage;