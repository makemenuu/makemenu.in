"use client"


import React, { useState, useEffect, useRef } from 'react';
import type { PageId } from './types';
import { sharedCSS } from './styles';
import { useRouter } from "next/navigation"



interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <p>
          MakeMenu ("we", "our", or "us") is committed to protecting the privacy of restaurant owners,
          staff, and end customers who interact with our platform. This Privacy Policy explains what
          information we collect, how we use it, and your rights with respect to that information.
        </p>
        <p>
          By using MakeMenu — whether through our website at <strong>makemenu.in</strong>, our web
          application, or any related services — you agree to the collection and use of information
          in accordance with this policy.
        </p>
        <p>
          This policy was last updated on <strong>1 April 2026</strong>. We will notify users of any
          material changes by email or by a prominent notice on our website.
        </p>
      </>
    ),
  },
  {
    id: 'information-collected',
    title: 'Information We Collect',
    content: (
      <>
        <p>We collect two broad categories of information:</p>
        <h4>Information you provide to us</h4>
        <ul>
          <li><strong>Account information:</strong> Name, email address, phone number, and restaurant details when you create a MakeMenu account.</li>
          <li><strong>Menu content:</strong> Item names, descriptions, prices, photos, and categories that you add to your digital menu.</li>
          <li><strong>Payment information:</strong> Billing details (processed securely through our payment provider — we do not store card numbers).</li>
          <li><strong>Communications:</strong> Any messages or information you send to our support team.</li>
        </ul>
        <h4>Information collected automatically</h4>
        <ul>
          <li><strong>Usage data:</strong> Pages visited, features used, time spent on the platform, and actions taken within the dashboard.</li>
          <li><strong>Device & browser data:</strong> IP address, browser type, operating system, and device identifiers.</li>
          <li><strong>Order data:</strong> For restaurant owners, we store order records (item, quantity, table number, timestamp) for analytics and billing.</li>
          <li><strong>Cookies:</strong> Session cookies to keep you logged in, and analytics cookies to understand usage patterns.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    content: (
      <>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li><strong>Providing the service:</strong> To operate, maintain, and improve the MakeMenu platform, including processing orders, generating bills, and delivering your digital menu.</li>
          <li><strong>Account management:</strong> To create and manage your account, process billing, and authenticate your sessions.</li>
          <li><strong>Customer support:</strong> To respond to your enquiries, troubleshoot issues, and improve our support quality.</li>
          <li><strong>Analytics:</strong> To understand how MakeMenu is used and to build better features based on real usage patterns.</li>
          <li><strong>Communications:</strong> To send you important product updates, billing notices, and (with your consent) marketing emails. You can opt out of marketing at any time.</li>
          <li><strong>Legal compliance:</strong> To comply with applicable laws, regulations, and legal processes in India.</li>
        </ul>
        <p>
          We do not sell your personal data to third parties. We do not allow third-party advertisers
          to target you based on data collected through our platform.
        </p>
      </>
    ),
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing & Third Parties',
    content: (
      <>
        <p>
          We share your information only with trusted third-party service providers who help us operate
          MakeMenu, and only to the extent necessary. These include:
        </p>
        <ul>
          <li><strong>Payment processors:</strong> Razorpay or equivalent, for secure payment processing. Subject to their own privacy policies.</li>
          <li><strong>Cloud infrastructure:</strong> Our platform runs on reputable cloud providers (such as AWS or equivalent) that maintain strict data security standards.</li>
          <li><strong>Email and SMS providers:</strong> For sending transactional messages like order confirmations and receipts.</li>
          <li><strong>Analytics tools:</strong> Aggregated, anonymised usage data only — never individual-identifiable records.</li>
        </ul>
        <p>
          We require all third parties to respect the security of your data and treat it in accordance
          with applicable law. We do not permit them to use your data for their own marketing purposes.
        </p>
        <p>
          We may disclose your information if required by law, court order, or government authority,
          or if we believe it is necessary to protect the rights, property, or safety of MakeMenu,
          our users, or the public.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    content: (
      <>
        <p>
          We retain your personal data for as long as your account is active or as needed to provide
          you with our services. Specifically:
        </p>
        <ul>
          <li><strong>Account data:</strong> Retained while your account is active and for 30 days after deletion, to allow for account recovery.</li>
          <li><strong>Order & billing records:</strong> Retained for 7 years to comply with Indian tax and accounting regulations.</li>
          <li><strong>Support communications:</strong> Retained for 2 years after resolution.</li>
          <li><strong>Analytics data:</strong> Stored in aggregated form indefinitely; individual-level data purged after 12 months.</li>
        </ul>
        <p>
          You may request deletion of your account and associated data at any time by contacting us at
          <strong> makemenuu@gmail.com</strong>. Some data may be retained for legal compliance even
          after account deletion.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking',
    content: (
      <>
        <p>
          MakeMenu uses cookies and similar tracking technologies to operate and improve our service:
        </p>
        <ul>
          <li><strong>Essential cookies:</strong> Required for the platform to function (authentication, session management). These cannot be disabled.</li>
          <li><strong>Analytics cookies:</strong> Help us understand how the platform is used. You can opt out via your browser settings or our cookie preference centre.</li>
          <li><strong>Preference cookies:</strong> Remember your settings and preferences (e.g. billing toggle, language).</li>
        </ul>
        <p>
          Most web browsers allow you to control cookies through their settings. Disabling certain cookies
          may affect the functionality of the MakeMenu platform.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    content: (
      <>
        <p>
          Depending on your location, you may have the following rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> Ask us to correct inaccurate or incomplete data.</li>
          <li><strong>Deletion:</strong> Request that we delete your personal data, subject to our legal retention obligations.</li>
          <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
          <li><strong>Objection:</strong> Object to our processing of your data for direct marketing.</li>
          <li><strong>Withdrawal of consent:</strong> Where processing is based on consent, withdraw it at any time without affecting prior processing.</li>
        </ul>
        <p>
          To exercise any of these rights, email us at <strong> makemenuu@gmail.com </strong> with the
          subject line "Privacy Request". We will respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Data Security',
    content: (
      <>
        <p>
          We take data security seriously and implement appropriate technical and organisational
          measures to protect your information:
        </p>
        <ul>
          <li>All data transmitted between your browser and our servers is encrypted using TLS/HTTPS.</li>
          <li>Passwords are hashed using industry-standard algorithms — we never store plain-text passwords.</li>
          <li>Payment data is handled exclusively by our PCI-DSS compliant payment processor.</li>
          <li>Access to production systems is restricted to authorised personnel only, with multi-factor authentication enforced.</li>
          <li>We conduct regular security reviews and keep dependencies updated.</li>
        </ul>
        <p>
          No method of transmission over the internet or electronic storage is 100% secure. While we
          strive to use commercially acceptable means to protect your data, we cannot guarantee
          absolute security. If you discover a security vulnerability, please report it responsibly
          to <strong>makemenuu@gmail.com</strong>.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: "Children's Privacy",
    content: (
      <>
        <p>
          MakeMenu is a business platform intended for use by restaurant owners and staff aged 18 or
          older. We do not knowingly collect personal information from children under the age of 13.
        </p>
        <p>
          If you believe that a child under 13 has provided us with personal information, please
          contact us at <strong>makemenuu@gmail.com</strong> and we will take steps to delete such
          information promptly.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact & Grievance',
    content: (
      <>
        <p>
          For any questions, concerns, or requests regarding this Privacy Policy or our data practices,
          please contact our Data Protection Officer:
        </p>
        <ul>
          <li><strong>Email:</strong> makemenuu@gmail.com</li>
          <li><strong>Address:</strong> MakeMenu, Chennai, Tamil Nadu, India — 600088</li>
          <li><strong>Response time:</strong> Within 30 days of receipt</li>
        </ul>
        <p>
          If you are not satisfied with our response, you have the right to lodge a complaint with
          the relevant data protection authority in your jurisdiction.
        </p>
      </>
    ),
  },
];

const PrivacyPage = ({ onNavigate }) => {
    const router = useRouter()
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(id);
      setTocOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const el = document.getElementById(`section-${section.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page-enter" style={{ paddingTop: '64px' }}>
      <style>{sharedCSS}{`
        .privacy-content h4 {
          font-size: .95rem; font-weight: 700;
          color: #1a1a1a; margin: 24px 0 10px;
        }
        .privacy-content p {
          font-size: .9rem; color: #4b5563;
          line-height: 1.8; margin-bottom: 14px;
        }
        .privacy-content ul {
          padding-left: 0; list-style: none;
          margin-bottom: 16px; display: flex;
          flex-direction: column; gap: 8px;
        }
        .privacy-content ul li {
          font-size: .9rem; color: #4b5563;
          line-height: 1.7; padding-left: 20px;
          position: relative;
        }
        .privacy-content ul li::before {
          content: '→';
          position: absolute; left: 0;
          color: #e63329; font-size: .8rem;
          top: 3px;
        }
        .toc-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          font-size: .85rem; font-weight: 500; color: #6b7280;
          cursor: pointer; border: none; background: none;
          text-align: left; width: 100%;
          transition: background .15s, color .15s;
          font-family: 'DM Sans', sans-serif;
        }
        .toc-link:hover { background: #f3f4f6; color: #1a1a1a; }
        .toc-link.active {
          background: #fdecea; color: #e63329; font-weight: 600;
        }
        .toc-link.active .toc-dot { background: #e63329; }
        .toc-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #d1d5db; flex-shrink: 0;
          transition: background .15s;
        }
        .section-block {
          padding-bottom: 48px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 48px;
        }
        .section-block:last-child { border-bottom: none; margin-bottom: 0; }
        .section-block h3 {
          font-size: 1.2rem; font-weight: 700;
          color: #1a1a1a; margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-num {
          width: 28px; height: 28px; border-radius: 8px;
          background: #fdecea; color: #e63329;
          font-size: .72rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Mobile TOC toggle button ── */
        .toc-mobile-toggle {
          display: none;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: .85rem;
          font-weight: 600;
          color: #1a1a1a;
          cursor: pointer;
          margin-bottom: 8px;
        }
        .toc-mobile-panel {
          display: none;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 8px;
          margin-bottom: 24px;
        }
        .toc-mobile-panel.open { display: block; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          /* Hero */
          .privacy-hero {
            padding: 40px 20px !important;
          }
          .privacy-hero h1 {
            font-size: clamp(1.6rem, 7vw, 2.2rem) !important;
          }
          .privacy-hero-meta {
            flex-direction: column !important;
            gap: 10px !important;
          }

          /* Layout: switch from 2-col grid to single column */
          .privacy-layout {
            display: block !important;
            padding: 32px 20px !important;
          }

          /* Desktop sticky TOC — hidden on mobile */
          .privacy-toc-desktop {
            display: none !important;
          }

          /* Mobile TOC toggle — shown on mobile */
          .toc-mobile-toggle {
            display: flex !important;
          }

          /* Section spacing */
          .section-block {
            padding-bottom: 32px;
            margin-bottom: 32px;
          }
          .section-block h3 {
            font-size: 1.05rem;
          }

          /* Bottom notice */
          .privacy-bottom {
            padding: 32px 20px !important;
          }
          .privacy-bottom-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .privacy-bottom-actions button {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .privacy-hero {
            padding: 32px 16px !important;
          }
          .privacy-layout {
            padding: 24px 16px !important;
          }
          .privacy-bottom {
            padding: 28px 16px !important;
          }
          .privacy-content p,
          .privacy-content ul li {
            font-size: .875rem;
          }
          .section-block h3 {
            font-size: 1rem;
          }
        }
      `}</style>

      {/* Hero */}
      <div className="privacy-hero" style={{ background: '#f3f4f6', padding: '60px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: 0, top: 0, width: '40%', opacity: .05 }}
            viewBox="0 0 600 500" fill="none">
            <circle cx="400" cy="100" r="160" stroke="#e63329" strokeWidth="1.5" />
            <circle cx="400" cy="100" r="100" stroke="#e63329" strokeWidth="1" />
          </svg>
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <div className="hero-tag" style={{ marginBottom: 20 }}>🔒 Company</div>
          <h1 style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 'clamp(2rem,3.5vw,3rem)',
            fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Privacy <span style={{ color: '#e63329' }}>Policy</span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.75, maxWidth: 480, marginBottom: 20 }}>
            We take your privacy seriously. This policy explains what data we collect, how we use it,
            and the controls you have over your information.
          </p>
          <div className="privacy-hero-meta" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: '#6b7280' }}>
              <span style={{ color: '#e63329', fontWeight: 600 }}>📅</span>
              Last updated: 1 April 2026
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: '#6b7280' }}>
              <span style={{ color: '#e63329', fontWeight: 600 }}>📍</span>
              Applicable: India
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: '#6b7280' }}>
              <span style={{ color: '#e63329', fontWeight: 600 }}>✉️</span>
              makemenuu@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Main content — TOC + sections */}
      <div className="privacy-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, alignItems: 'start', padding: '60px 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Sticky TOC — desktop only */}
        <div className="privacy-toc-desktop" style={{ position: 'sticky', top: 84, paddingRight: 40 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 12, paddingLeft: 12 }}>
            Contents
          </div>
          {sections.map((section, i) => (
            <button
              key={section.id}
              className={`toc-link${activeSection === section.id ? ' active' : ''}`}
              onClick={() => scrollToSection(section.id)}
            >
              <span className="toc-dot" />
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: activeSection === section.id ? '#e63329' : '#d1d5db', marginRight: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.title}
            </button>
          ))}

          {/* Contact card */}
          <div style={{
            marginTop: 24, background: '#fff5f5',
            border: '1px solid rgba(230,51,41,.2)',
            borderRadius: 12, padding: '16px',
          }}>
            <div style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: 6 }}>Questions?</div>
            <div style={{ fontSize: '.78rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 12 }}>
              Email us at makemenuu@gmail.com
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: '.78rem', padding: '8px 14px' }}
              onClick={() => onNavigate('contact')}
            >
              Contact us
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="privacy-content" ref={contentRef}>

          {/* Mobile TOC accordion — rendered above the sections, inside the content column */}
          <div style={{ marginBottom: 8 }}>
            <button
              className="toc-mobile-toggle"
              onClick={() => setTocOpen(prev => !prev)}
              aria-expanded={tocOpen}
            >
              <span>📋 Jump to section: {sections.find(s => s.id === activeSection)?.title}</span>
              <span style={{ fontSize: '.75rem', color: '#9ca3af' }}>{tocOpen ? '▲' : '▼'}</span>
            </button>
            <div className={`toc-mobile-panel${tocOpen ? ' open' : ''}`}>
              {sections.map((section, i) => (
                <button
                  key={section.id}
                  className={`toc-link${activeSection === section.id ? ' active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="toc-dot" />
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: activeSection === section.id ? '#e63329' : '#d1d5db', marginRight: 2 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </button>
              ))}
              {/* Contact card inside mobile TOC */}
              <div style={{
                marginTop: 12, background: '#fff5f5',
                border: '1px solid rgba(230,51,41,.2)',
                borderRadius: 10, padding: '14px',
              }}>
                <div style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: 6 }}>Questions?</div>
                <div style={{ fontSize: '.78rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 10 }}>
                  Email us at makemenuu@gmail.com
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '.78rem', padding: '8px 14px' }}
                  onClick={() => onNavigate('contact')}
                >
                  Contact us
                </button>
              </div>
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={section.id} id={`section-${section.id}`} className="section-block">
              <h3>
                <span className="section-num">{String(i + 1).padStart(2, '0')}</span>
                {section.title}
              </h3>
              {section.content}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom notice */}
      <div className="privacy-bottom" style={{ background: '#f3f4f6', padding: '40px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 10 }}>Your data is in safe hands</h3>
          <p style={{ fontSize: '.875rem', color: '#6b7280', lineHeight: 1.75, marginBottom: 20 }}>
            MakeMenu is built by a team that respects privacy. We collect only what we need,
            use it only for what we say, and give you full control to access, correct, or delete your data.
          </p>
          <div className="privacy-bottom-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-outline" onClick={() => router.push("/contact")}>Contact our privacy team</button>
            <button className="btn-outline" onClick={() => router.push("/")}>Back to home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;