"use client";

import React, { useState } from 'react';
import type { PageId } from './types';
import { sharedCSS } from './styles';
import { useRouter } from "next/navigation"


type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const contactChannels = [
  {
    icon: '📧',
    title: 'Email Us',
    value: 'Makemenuu@gmail.com',
    sub: 'We reply within 24 hours',
    bg: '#fdecea',
  },
  {
    icon: '💬',
    title: 'WhatsApp',
    value: '+91 86809-13379',
    sub: 'Mon–Sat, 9am–7pm IST',
    bg: '#f0fdf4',
  },
  {
    icon: '🏢',
    title: 'Office',
    value: 'Chennai, Tamil Nadu',
    sub: 'India — 600088',
    bg: '#eff6ff',
  },
];

const subjectOptions = [
  'General enquiry',
  'Sales & pricing',
  'Technical support',
  'Billing & payments',
  'Other',
];

const ContactPage = ({ onNavigate }: { onNavigate?: (page: PageId) => void }) => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', subject: subjectOptions[0], message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: 10,
    border: `1.5px solid ${focusedField === field ? '#e63329' : '#e5e7eb'}`,
    fontSize: '.9rem',
    color: '#1a1a1a',
    background: loading ? '#f9fafb' : '#fff',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color .18s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(230,51,41,.08)' : 'none',
    cursor: loading ? 'not-allowed' : 'auto',
    boxSizing: 'border-box' as const,
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '.82rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  return (
    <div className="page-enter" style={{ paddingTop: '64px' }}>
      <style>{sharedCSS}{`
        .contact-field { margin-bottom: 20px; }
        textarea { resize: vertical; }
        select { appearance: none; cursor: pointer; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          display: inline-block;
          animation: spin .65s linear infinite;
        }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {
          /* Hero */
          .contact-hero {
            padding: 48px 20px 36px !important;
          }
          .contact-hero h1 {
            font-size: clamp(1.8rem, 7vw, 2.4rem) !important;
            letter-spacing: -1px !important;
          }
          .contact-hero p {
            font-size: .95rem !important;
          }

          /* Channels strip */
          .contact-channels {
            padding: 0 20px 40px !important;
          }

          /* Form + side info layout: stack vertically */
          .contact-form-layout {
            display: block !important;
            padding: 40px 20px !important;
            gap: 0 !important;
          }

          /* Form grid: 2-col → 1-col */
          .contact-form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }

          /* Side info: add top margin when stacked */
          .contact-side-info {
            margin-top: 40px;
          }

          /* Submit button: full width */
          .contact-submit-btn {
            width: 100% !important;
            justify-content: center !important;
          }

          /* CTA band */
          .cta-band {
            flex-direction: column !important;
            gap: 20px !important;
            padding: 40px 20px !important;
            text-align: center !important;
            align-items: center !important;
          }
        }

        @media (max-width: 480px) {
          .contact-hero {
            padding: 36px 16px 28px !important;
          }
          .contact-channels {
            padding: 0 16px 32px !important;
          }
          .contact-form-layout {
            padding: 32px 16px !important;
          }
          .contact-hero h1 {
            font-size: clamp(1.6rem, 8vw, 2rem) !important;
          }
        }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: 0, top: 0, width: '50%', opacity: .05 }}
            viewBox="0 0 800 600" fill="none">
            <circle cx="600" cy="150" r="200" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="600" cy="150" r="130" stroke="#e63329" strokeWidth="1" />
            <circle cx="200" cy="500" r="140" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>
        <div className="contact-hero" style={{ padding: '80px 80px 60px', position: 'relative', zIndex: 1 }}>
          <div className="hero-tag" style={{ marginBottom: 20 }}>📬 Company</div>
          <h1 style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 'clamp(2.4rem,4vw,3.4rem)',
            fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.12,
            marginBottom: 16, maxWidth: 520,
          }}>
            We'd love to <span style={{ color: '#e63329' }}>hear from you</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.75, maxWidth: 440 }}>
            Have a question about MakeMenu? Need help getting started? Or just want to say hi?
            Our team is always happy to chat.
          </p>
        </div>
      </div>

      {/* Contact channels */}
      <div className="contact-channels" style={{ background: '#f3f4f6', padding: '0 80px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {contactChannels.map((ch) => (
            <div key={ch.title} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 16, padding: '24px 24px',
              display: 'flex', alignItems: 'flex-start', gap: 16,
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,.05),0 10px 40px rgba(0,0,0,.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: ch.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {ch.icon}
              </div>
              <div>
                <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
                  {ch.title}
                </div>
                <div style={{ fontWeight: 600, fontSize: '.95rem', color: '#1a1a1a', marginBottom: 3 }}>{ch.value}</div>
                <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{ch.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form + side info */}
      <div className="contact-form-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60, padding: '80px', alignItems: 'start' }}>

        {/* Form */}
        <div>
          <div className="section-eyebrow">Send a message</div>
          <h2 className="section-title" style={{ marginBottom: 32 }}>
            Get in touch <em>today</em>
          </h2>

          {submitted ? (
            <div style={{
              background: '#f0fdf4', border: '1.5px solid #86efac',
              borderRadius: 16, padding: '40px 36px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 10 }}>Message sent!</h3>
              <p style={{ color: '#6b7280', fontSize: '.9rem', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 8px' }}>
                Thanks for reaching out, <strong>{form.name}</strong>. We'll get back to you at {form.email} within 24 hours.
              </p>
              <p style={{ color: '#6b7280', fontSize: '.85rem', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 24px' }}>
                A confirmation email has been sent to your inbox.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', phone: '', subject: subjectOptions[0], message: '' });
                }}
                style={{
                  background: '#e63329', color: '#fff',
                  padding: '14px 30px', borderRadius: '10px',
                  border: 'none', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <div>

              {/* Error banner */}
              {error && (
                <div style={{
                  background: '#fff5f5',
                  border: '1.5px solid rgba(230,51,41,.3)',
                  borderRadius: 10, padding: '12px 16px',
                  fontSize: '.88rem', color: '#b91c1c',
                  marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="contact-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 0 }}>
                <div className="contact-field">
                  <label style={labelStyle}>Full name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('name')}
                    disabled={loading}
                  />
                </div>
                <div className="contact-field">
                  <label style={labelStyle}>Email address *</label>
                  <input
                    type="email"
                    placeholder="you@restaurant.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('email')}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="contact-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="contact-field">
                  <label style={labelStyle}>Phone number</label>
                  <input
                    type="tel"
                    placeholder="+91 12345-67890"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('phone')}
                    disabled={loading}
                  />
                </div>
                <div className="contact-field">
                  <label style={labelStyle}>Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('subject')}
                    disabled={loading}
                  >
                    {subjectOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="contact-field">
                <label style={labelStyle}>Message *</label>
                <textarea
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle('message')}
                  disabled={loading}
                />
              </div>

              <button
                className="contact-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: '#e63329',
                  color: '#fff',
                  padding: '14px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'opacity .2s',
                }}
              >
                {loading ? (
                  <><span className="spinner" /> Sending…</>
                ) : (
                  'Send message →'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Side info */}
        <div className="contact-side-info" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            background: '#fff5f5', border: '1.5px solid rgba(230,51,41,.2)',
            borderRadius: 16, padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.4rem' }}>🕐</span>
              <h4 style={{ fontWeight: 700, fontSize: '.95rem' }}>Support Hours</h4>
            </div>
            {[
              { day: 'Monday – Friday', hours: '9:00 AM – 7:00 PM IST' },
              { day: 'Saturday', hours: '10:00 AM – 4:00 PM IST' },
              { day: 'Sunday', hours: 'Email only' },
            ].map((row) => (
              <div key={row.day} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '.85rem', padding: '8px 0',
                borderBottom: '1px solid rgba(230,51,41,.1)',
              }}>
                <span style={{ color: '#6b7280' }}>{row.day}</span>
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{row.hours}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 16, padding: '28px',
          }}>
            <h4 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 16 }}>Quick Links</h4>
            {[
              { label: 'View pricing plans', page: 'pricing' as PageId, icon: '💳' },
              { label: 'See all features', page: 'qr-ordering' as PageId, icon: '📱' },
              { label: 'Privacy policy', page: 'privacy' as PageId, icon: '🔒' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => router.push(`/${link.page}`)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 10, padding: '10px 12px', borderRadius: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '.875rem', color: '#1a1a1a', fontWeight: 500,
                  transition: 'background .15s', textAlign: 'left',
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: '1rem' }}>{link.icon}</span>
                {link.label}
                <span style={{ marginLeft: 'auto', color: '#e63329' }}>→</span>
              </button>
            ))}
          </div>

          <div style={{
            background: '#1a1a1a', borderRadius: 16, padding: '28px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
          }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#fff', marginBottom: 6 }}>
                Fast response guaranteed
              </div>
              <div style={{ fontSize: '.85rem', color: '#9ca3af', lineHeight: 1.65 }}>
                Our team responds to every message within <strong style={{ color: '#fff' }}>24 hours</strong> on working days.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div>
          <h2>Ready to get started?</h2>
          <p>Set up your digital menu in under 10 minutes — free forever.</p>
        </div>
        <button className="btn-outline" onClick={() => router.push('/pricing')}>View pricing →</button>
      </div>
    </div>
  );
};

export default ContactPage;