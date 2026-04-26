"use client"

import React, { useState } from 'react';
import type { PageId } from './types';
import { sharedCSS } from './styles';
import { useRouter } from "next/navigation"

interface Plan {
  name: string;
  tag?: string;
  monthlyPrice: number | null;
  description: string;
  cta: string;
  ctaStyle: 'primary' | 'outline';
  highlighted: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    name: 'Free Trial',
    monthlyPrice: 0,
    description: 'Give Makemenu a try in your shop—no commitments, no credit card required.',
    ctaStyle: 'outline',
    highlighted: false,
    features: [
      'Unlimited menu items',
      'Generate Unlimited QR Codes',
      'Digital menu page',
      'Real-time order dashboard',
      'Billing & receipt system',
      'Real-Time Analytics',

    ],
  },
  {
    name: 'Growth',
    tag: 'Most Popular',
    monthlyPrice: 399,
    description: 'For growing restaurants that need full QR ordering and live kitchen tools.',
    highlighted: true,
    features: [
      'Unlimited menu items',
      'Generate Unlimited QR Codes',
      'Real-time order dashboard',
      'Billing & receipt system',
      'Priority email support',
      'Real-Time Analytics',
      'Digital menu page',
    ],
  },
];

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'can upgrade or downgrade your plan at any time. Once your free trial ends, access to Growth features will be paused until you upgrade to a paid plan.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Growth plans include a 40-day free trial — no credit card required to start.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, UPI, and net banking. All payments are processed securely.',
  },
  {
    q: 'Do you charge per order or per table?',
    a: 'No. MakeMenu is a flat monthly subscription. There are no per-order, per-table, or transaction fees.',
  },
  {
    q: 'Can I use my own printer?',
    a: 'Yes, Makemenu supports standard 50mm and 80mm thermal printers.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'If you choose to cancel, your plan will remain active until the end of your current billing period, and your menu will continue to be accessible during that time. Your data will be securely retained for 30 days after cancellation, should you wish to return. Please note that all payments are non-refundable.',
  },
];

const PricingPage = ({ onNavigate }) => {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="page-enter" style={{ paddingTop: '64px' }}>
      <style>{sharedCSS}{`
        .plan-card {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 20px;
          padding: 36px 32px;
          position: relative;
          transition: transform .22s, box-shadow .22s, border-color .22s;
          display: flex;
          flex-direction: column;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 6px rgba(0,0,0,.05), 0 10px 40px rgba(0,0,0,.08);
        }
        .plan-card.highlighted {
          border-color: #e63329;
          box-shadow: 0 8px 40px rgba(230,51,41,.12);
        }
        .plan-card.highlighted:hover {
          box-shadow: 0 12px 60px rgba(230,51,41,.18);
        }
        .plan-tag {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: #e63329;
          color: #fff;
          font-size: .72rem;
          font-weight: 700;
          padding: 4px 16px;
          border-radius: 999px;
          white-space: nowrap;
          letter-spacing: .3px;
        }
        .plan-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .plan-price-wrap {
          margin-bottom: 10px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
        }
        .plan-currency {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .plan-amount {
          font-family: 'DM Sans', sans-serif;
          font-size: 3.2rem;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1;
        }
        .plan-amount.red { color: #e63329; }
        .plan-period {
          font-size: .875rem;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        .plan-desc {
          font-size: .875rem;
          color: #6b7280;
          line-height: 1.65;
          margin-bottom: 28px;
          min-height: 52px;
        }
        .plan-divider {
          border: none;
          border-top: 1px solid #f3f4f6;
          margin: 0 0 24px;
        }
        .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 11px;
          flex: 1;
          margin-bottom: 28px;
        }
        .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: .875rem;
          color: #374151;
          line-height: 1.5;
        }
        .feat-check {
          width: 18px; height: 18px; border-radius: 50%;
          background: #fdecea;
          display: flex; align-items: center; justify-content: center;
          font-size: .6rem; color: #e63329; flex-shrink: 0; margin-top: 1px;
          font-weight: 700;
        }
        .feat-check.gray { background: #f3f4f6; color: #9ca3af; }
        .faq-item {
          border-bottom: 1px solid #f3f4f6;
        }
        .faq-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem;
          font-weight: 600;
          color: #1a1a1a;
          gap: 16px;
        }
        .faq-icon {
          width: 28px; height: 28px; border-radius: 50%;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 700; color: #e63329;
          flex-shrink: 0; transition: background .18s, transform .25s;
        }
        .faq-icon.open {
          background: #fdecea;
          transform: rotate(45deg);
        }
        .faq-answer {
          font-size: .9rem;
          color: #6b7280;
          line-height: 1.75;
          padding-bottom: 18px;
          max-width: 620px;
        }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 80px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <svg style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', opacity: .05, width: '100%' }}
            viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="600" cy="200" r="300" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="600" cy="200" r="200" stroke="#e63329" strokeWidth="1" />
            <circle cx="600" cy="200" r="100" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="80" stroke="#e63329" strokeWidth="1" />
            <circle cx="1100" cy="100" r="80" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-tag" style={{ margin: '0 auto 20px', width: 'fit-content' }}>
            💳 Company
          </div>
          <h1 style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(2.2rem,4vw,3.4rem)',
            fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1,
            color: '#1a1a1a', marginBottom: 16,
          }}>
            Simple, honest <span style={{ color: '#e63329' }}>pricing</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>
            No hidden fees. No per-order charges. Just a flat monthly plan that scales with your restaurant.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding: '60px 80px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, alignItems: 'start' }}>
        {plans.map((plan) => (
          <div key={plan.name} className={`plan-card${plan.highlighted ? ' highlighted' : ''}`}>
            {plan.tag && <div className="plan-tag">{plan.tag}</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price-wrap">
              {plan.monthlyPrice === 0 ? (
                <div className="plan-amount">Start Free For 40 Days</div>
              ) : (
                <>
                  <span className="plan-currency">₹</span>
                  <div className={`plan-amount${plan.highlighted ? ' red' : ''}`}>{plan.monthlyPrice}</div>
                </>
              )}
            </div>
            {plan.monthlyPrice !== 0 && (
              <div className="plan-period">per month</div>
            )}
            <p className="plan-desc">{plan.description}</p>
            <hr className="plan-divider" />
            <ul className="plan-features">
              {plan.features.map((feat) => (
                <li key={feat}>
                  <span className="feat-check">✓</span>
                  {feat}
                </li>
              ))}
            </ul>
            {plan.ctaStyle === 'primary' ? (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {plan.cta}
              </button>
            ) : (
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Trust strip */}
      <div style={{ background: '#f3f4f6', padding: '40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { icon: '🔒', label: 'Secure payments', sub: 'PCI-DSS compliant' },
            { icon: '🔄', label: 'Cancel anytime', sub: 'No lock-in contracts' },
            { icon: '📞', label: 'Free onboarding', sub: 'We set you up for free' },
            { icon: '💳', label: 'No transaction fees', sub: 'Flat monthly pricing only' },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: '.82rem', color: '#6b7280' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="section-wrap">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>FAQ</div>
            <h2 className="section-title">Frequently asked <em>questions</em></h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={`faq-icon${openFaq === i ? ' open' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div>
          <h2>Start free, upgrade when ready</h2>
          <p>No credit card needed. Your digital menu live in minutes.</p>
        </div>
        <div className="cta-band-actions">
          <button className="btn-outline" onClick={() => router.push("/signup")}>Get Started →</button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;