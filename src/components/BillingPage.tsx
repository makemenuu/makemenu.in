"use client"

import React from 'react';
import type { PageId } from './types';
import { sharedCSS } from './styles';
import { useRouter } from "next/navigation"


const billItems = [
  { name: 'Caesar Salad × 1', amount: '₹180' },
  { name: 'Cappuccino × 2', amount: '₹240' },
  { name: 'Margherita × 1', amount: '₹299' },
  { name: 'Chocolate Cake × 1', amount: '₹149' },
];

const billSummary = [
  { name: 'Subtotal', amount: '₹868' },
  { name: 'GST (5%)', amount: '₹43' },
  { name: 'Service Charge', amount: '₹20' },
];

const billingFeatures = [
  { icon: '🔢', title: 'Auto-calculation', desc: 'Totals, GST, service charges and discounts are computed automatically. No manual maths, no errors.' },
  { icon: '🪑', title: 'Table-wise tracking', desc: 'Each table has its own running bill. Merge tables, split bills, and add items anytime before checkout.' },
  { icon: '🖨️', title: 'Print-ready receipts', desc: 'One-click thermal printer support or digital receipt via WhatsApp/SMS. Works with 80mm printers.' },
  { icon: '📊', title: 'Daily reports', desc: 'End-of-day summaries, revenue breakdowns by category, and weekly trend charts built in.' },
];

const BillingPage = ({ onNavigate }) => {
    const router = useRouter();
  return (
    <div className="page-enter" style={{ paddingTop: '64px' }}>
      <style>{sharedCSS}</style>

      {/* Hero */}
      <div className="hero" style={{ minHeight: 500 }}>
        <div className="pattern-bg">
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="700" cy="300" r="200" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="100" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-tag">🧾 Discover</div>
          <h1>
            Smart billing,<br />
            <em>zero hassle</em>
          </h1>
          <p>
            Automatic bill generation, GST calculations, table-wise tracking, and one-tap receipts.
            Your accounting, sorted.
          </p>
          <div className="hero-actions">

            <button className="btn-outline" onClick={() => router.push("/")}>← Back</button>
          </div>
        </div>

        {/* Bill receipt visual */}
        <div className="hero-visual">
          <div className="bill-wrap">
            <div className="bill-top">
              <h4>🏪 Café Sunrise</h4>
              <small>Table 12 &nbsp;·&nbsp; Order #047 &nbsp;·&nbsp; 12 Apr 2026</small>
            </div>
            <div className="bill-body">
              {billItems.map((item) => (
                <div key={item.name} className="bill-line-item">
                  <span>{item.name}</span>
                  <strong>{item.amount}</strong>
                </div>
              ))}
              <div style={{ height: 10 }} />
              {billSummary.map((item) => (
                <div key={item.name} className="bill-line-item">
                  <span>{item.name}</span>
                  <strong>{item.amount}</strong>
                </div>
              ))}
            </div>
            <div className="bill-total-row">
              <strong>Total Amount</strong>
              <span className="bill-amt">₹ 931</span>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', gap: 10 }}>
              <button style={{
                flex: 1, background: '#e63329', color: '#fff', border: 'none',
                borderRadius: 8, padding: 10, fontSize: '.82rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}>
                🖨 Print Bill
              </button>
              <button style={{
                flex: 1, background: '#f3f4f6', color: '#1a1a1a', border: 'none',
                borderRadius: 8, padding: 10, fontSize: '.82rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}>
                📲 Send SMS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="section-wrap gray-bg">
        <div className="section-eyebrow">Billing Features</div>
        <h2 className="section-title">Everything handled <em>automatically</em></h2>
        <div className="cards-grid">
          {billingFeatures.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="card-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Split — Payment flow */}
      <div className="split-section">
        <div>
          <div className="section-eyebrow">Payment Flow</div>
          <h2 className="section-title">From order to<br /><em>paid in seconds</em></h2>
          <p style={{ color: '#6b7280', fontSize: '.95rem', lineHeight: 1.75, marginBottom: 20 }}>
            The entire billing cycle — from item addition to payment confirmation — is handled within MakeMenu.
          </p>
          <ul className="checklist">
            <li><div className="check-icon">1</div><span>Customer places order via QR. Items added to their table bill automatically.</span></li>
            <li><div className="check-icon">2</div><span>Waiter requests bill. GST and service charges auto-applied.</span></li>
            <li><div className="check-icon">3</div><span>Print thermal receipt or send WhatsApp/SMS receipt instantly.</span></li>
            <li><div className="check-icon">4</div><span>Payment recorded. Table marked free for next customer.</span></li>
          </ul>
        </div>
        <div className="split-visual" style={{ padding: 28 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 600, color: '#6b7280', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Active Tables
          </div>
          {[
            { table: 'Table 3', items: 4, amount: '₹640', status: 'open', badge: 'badge-blue', badgeText: 'Active' },
            { table: 'Table 7', items: 3, amount: '₹719', status: 'bill', badge: 'badge-red', badgeText: 'Bill Requested' },
            { table: 'Table 12', items: 6, amount: '₹931', status: 'paid', badge: 'badge-green', badgeText: 'Paid ✓' },
          ].map((row) => (
            <div key={row.table} className="mock-table-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, background: '#fdecea',
                }}>🪑</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '.85rem' }}>{row.table}</div>
                  <div style={{ fontSize: '.75rem', color: '#6b7280' }}>{row.items} items</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#e63329', fontSize: '.85rem' }}>{row.amount}</span>
                <span className={`badge ${row.badge}`}>{row.badgeText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div>
          <h2>Automate your billing today</h2>
          <p>Works seamlessly with your QR ordering and digital menu.</p>
        </div>
        <div className="cta-band-actions">
          <button className="btn-outline" onClick={() => router.push("/signup")}>Get Started →</button>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
