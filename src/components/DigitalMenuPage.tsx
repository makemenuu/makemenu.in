"use client"

import React from 'react';
import { sharedCSS } from './styles';
import { useRouter } from "next/navigation";

const menuItems = [
  { emoji: '🥗', name: 'Caesar Salad', desc: 'Fresh romaine, croutons', price: '₹180', bg: 'linear-gradient(135deg,#fde8e8,#f9c9c9)', active: true },
  { emoji: '☕', name: 'Cappuccino', desc: 'Double shot espresso', price: '₹120', bg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', active: true },
  { emoji: '🍕', name: 'Margherita Pizza', desc: 'Wood-fired, 8 inch', price: '₹299', bg: 'linear-gradient(135deg,#fef9c3,#fef08a)', active: false },
  { emoji: '🍰', name: 'Chocolate Cake', desc: 'Served warm with ice cream', price: '₹149', bg: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)', active: true },
];

const featureCards = [
  { icon: '📸', title: 'Food photography', desc: 'Upload HD photos for each item. Customers eat with their eyes first — beautiful images drive more orders.' },
  { icon: '🏷️', title: 'Smart categories', desc: 'Organise your menu into sections: Starters, Mains, Drinks, Desserts. Reorder with drag and drop.' },
  { icon: '🥦', title: 'Dietary tags', desc: 'Mark items as Veg, Non-Veg, Vegan, Gluten-Free, Spicy or Jain so customers find what they need instantly.' },
  { icon: '🔴', title: 'Live availability', desc: 'Toggle items on or off in one tap. Sold-out items disappear from customer view immediately.' },
];

const DigitalMenuPage = ({ onNavigate }) => {
  const router = useRouter(); // ✅ FIXED

  return (
    <div className="page-enter" style={{ paddingTop: '64px' }}>
      <style>{sharedCSS}</style>

      {/* Hero */}
      <div className="hero" style={{ minHeight: 520 }}>
        <div className="pattern-bg">
          <svg viewBox="0 0 800 600" fill="none">
            <circle cx="650" cy="200" r="180" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="150" cy="500" r="120" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-tag">🍽️ Discover</div>
          <h1>
            A menu your<br />
            customers will <em>love</em>
          </h1>
          <p>
            Beautiful digital menus with food photos, categories, dietary tags and real-time
            availability — viewed on any phone, any time.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Create your digital menu</button>
            <button className="btn-outline" onClick={() => router.push("/")}>← Back</button>
          </div>
        </div>

        {/* Phone mock */}
        <div className="hero-visual">
          <div className="phone">
            <div className="phone-screen">

              <div className="phone-header">
                <div className="brand">Café Sunrise — Table 5</div>
              </div>

              <div className="phone-content">
                <div className="section-title">🔥 Popular</div>

                {menuItems.map((item, i) => (
                  <div key={i} className="menu-row">
                    <div className="menu-thumb">{item.emoji}</div>

                    <div className="menu-details">
                      <strong>{item.name}</strong>
                      <span>{item.desc}</span>
                    </div>

                    <div className="price">{item.price}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div> {/* ✅ FIXED: properly closed hero */}

      {/* Features */}
      <div className="section-wrap">
        <div className="section-eyebrow">Features</div>
        <h2 className="section-title">Everything a great menu <em>needs</em></h2>
        <div className="cards-grid">
          {featureCards.map((card) => (
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
          <h2>Build your digital menu today</h2>
          <p>Start for free. No credit card required.</p>
        </div>
        <div className="cta-band-actions">
          <button className="btn-primary">Create menu free</button>
          <button className="btn-outline" onClick={() => router.push("/signup")}>Get started →</button>
        </div>
      </div>
    </div>
  );
};

export default DigitalMenuPage;