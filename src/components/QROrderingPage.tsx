"use client";

import React from 'react';
import type { PageId } from './types';
import { sharedCSS } from './styles';
import { useRouter } from "next/navigation"


const benefits = [
  { icon: '⚡', title: 'Zero wait time', desc: 'Customers don\'t wait for a waiter to bring menus. They scan and start ordering immediately on arrival.' },
  { icon: '💸', title: 'Bigger order value', desc: 'Digital menus with photos consistently drive 15–25% higher average order values versus printed menus.' },
  { icon: '🔄', title: 'Update in real-time', desc: 'Sold out of samosas? Mark it unavailable in 2 taps. Customers never see out-of-stock items.' },
  { icon: '📊', title: 'Order analytics', desc: 'See which items sell the most, busiest hours, and revenue trends from your dashboard.' },
];

function QRPattern({ seed, cols }: { seed: number; cols: number }) {
  const cells = Array.from({ length: cols * cols }, (_, i) => {
    const hash = (seed * 31 + i * 17 + i * i) % 97;
    return hash > 44;
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 3, width: 160 }}>
      {cells.map((filled, i) => (
        <span key={i} style={{
          width: '100%', aspectRatio: '1', borderRadius: 1, display: 'block',
          background: filled ? '#1a1a1a' : 'transparent',
        }} />
      ))}
    </div>
  );
}

const QROrderingPage = () => {
  const router = useRouter();

  return (
    <div className="page-enter" style={{ paddingTop: '64px' }}>
      <style>{sharedCSS}</style>

      {/* Hero */}
      <div className="hero" style={{ minHeight: 520 }}>
        <div className="pattern-bg">
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="600" cy="100" r="200" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="600" cy="100" r="140" stroke="#e63329" strokeWidth="1" />
            <circle cx="700" cy="450" r="120" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-tag">📱 Discover</div>
          <h1>
            Contactless ordering<br />
            with <em>QR codes</em>
          </h1>
          <p>
            Place your QR code on any table, counter, or packaging. Customers scan with their
            phone — no app required — and order in seconds.
          </p>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => router.push("/")}>← Back to home</button>
          </div>
        </div>

        <div className="hero-visual" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              background: '#fff', borderRadius: 18, padding: '28px 32px',
              boxShadow: '0 4px 6px rgba(0,0,0,.05),0 10px 40px rgba(0,0,0,.08)',
              border: '1px solid #e5e7eb', display: 'inline-block',
            }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                Scan to Order
              </div>
              <div style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 14 }}>Table 7 • MakeMenu</div>
              <QRPattern seed={73} cols={9} />
              <div style={{ marginTop: 14, fontFamily: "'Pacifico',cursive", color: '#e63329', fontSize: '1rem' }}>
                MakeMenu
              </div>
            </div>
            <div style={{
              position: 'absolute', top: -16, right: -20,
              background: '#e63329', color: '#fff', fontSize: '.72rem', fontWeight: 600,
              padding: '6px 12px', borderRadius: 999,
              boxShadow: '0 8px 32px rgba(230,51,41,.2)',
            }}>
              ✓ No app needed
            </div>
            <div style={{
              position: 'absolute', bottom: -16, left: -20,
              background: '#fff', border: '1px solid #e5e7eb', fontSize: '.72rem', fontWeight: 500,
              padding: '6px 12px', borderRadius: 999,
              boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
            }}>
              Works on any phone
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="split-section">
        <div>
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-title">Three steps to <em>instant orders</em></h2>
          <p style={{ color: '#6b7280', fontSize: '.95rem', lineHeight: 1.75, marginBottom: 20 }}>
            No apps. No accounts. Customers simply point their camera and they're ordering in under 10 seconds.
          </p>
          <ul className="checklist">
            <li>
              <div className="check-icon">1</div>
              <span><strong>Scan</strong> — Customer points their phone camera at your QR code. The menu opens instantly in their browser.</span>
            </li>
            <li>
              <div className="check-icon">2</div>
              <span><strong>Order</strong> — They browse categories, tap items, customise, and confirm their order.</span>
            </li>
            <li>
              <div className="check-icon">3</div>
              <span><strong>Serve</strong> — The order lands on your kitchen dashboard in real-time. You prepare. You serve. Done.</span>
            </li>
          </ul>
        </div>

        <div className="split-visual" style={{ padding: 32 }}>
          <div className="mock-panel">
            <div className="mock-header">
              <h4>📋 Incoming Orders</h4>
              <span>Live</span>
            </div>
            <div style={{ padding: 16 }}>
              <div className="order-live">
                <div className="order-live-head">
                  <strong>Table 7 — Order #042</strong>
                  <span>Just now</span>
                </div>
                <div className="order-items-list">1× Caesar Salad &nbsp;|&nbsp; 2× Cappuccino &nbsp;|&nbsp; 1× Margherita</div>
                <div className="order-footer">
                  <span className="order-total">₹ 719</span>
                  <button className="order-btn">Accept</button>
                </div>
              </div>
              <div className="order-live" style={{ borderLeftColor: '#16a34a', opacity: .7 }}>
                <div className="order-live-head">
                  <strong>Table 3 — Order #041</strong>
                  <span>2 min ago</span>
                </div>
                <div className="order-items-list">2× Masala Dosa &nbsp;|&nbsp; 1× Filter Coffee</div>
                <div className="order-footer">
                  <span className="order-total">₹ 310</span>
                  <span className="badge badge-green">Accepted ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="section-wrap gray-bg">
        <div className="section-eyebrow">Benefits</div>
        <h2 className="section-title">Why restaurants <em>love QR ordering</em></h2>
        <div className="cards-grid">
          {benefits.map((b) => (
            <div key={b.title} className="feature-card">
              <div className="card-icon-wrap">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div>
          <h2>Start with QR Ordering today</h2>
          <p>Free setup. Your QR codes ready in minutes.</p>
        </div>
        <div className="cta-band-actions">
          <button className="btn-outline" onClick={() => router.push("/signup")}>Get started →</button>
        </div>
      </div>
    </div>
  );
};

export default QROrderingPage;
