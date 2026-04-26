export const sharedCSS = `
  /* ── BUTTONS ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--red); color: #fff;
    padding: 14px 30px; border-radius: 10px; font-weight: 600; font-size: 1rem;
    text-decoration: none; cursor: pointer; border: none;
    box-shadow: var(--shadow-red);
    transition: background .18s, transform .15s, box-shadow .18s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary:hover {
    background: var(--red-dark); transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(230,51,41,.3);
  }
  .btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  cursor: pointer;
  text-decoration: none;
}

  /* ── HERO ── */
  .hero {
    position: relative;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 40px;
    padding: 80px;
    min-height: calc(100vh - 64px);
    overflow: hidden;
  }
  .hero-content { position: relative; z-index: 1; }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--red-subtle); color: var(--red);
    font-size: .8rem; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
    padding: 6px 14px; border-radius: 999px; margin-bottom: 24px;
    border: 1px solid rgba(230,51,41,.2);
  }
  .hero h1 {
    font-size: clamp(2.4rem, 4vw, 3.6rem); font-weight: 700;
    line-height: 1.12; letter-spacing: -1.5px; color: var(--text); margin-bottom: 20px;
  }
  .hero h1 em { font-style: normal; color: var(--red); }
  .hero p {
    font-size: 1.05rem; color: var(--muted); line-height: 1.75;
    max-width: 420px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .hero-visual { position: relative; z-index: 1; }

  /* ── PATTERN BG ── */
  .pattern-bg {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
  }
  .pattern-bg svg {
    position: absolute; right: 0; top: 0; width: 55%; height: 100%; opacity: .06;
  }

  /* ── SECTION ── */
  .section-wrap { padding: 80px; }
  .section-wrap.gray-bg { background: var(--border2); }
  .section-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: .78rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: var(--red); margin-bottom: 12px;
  }
  .section-eyebrow::before {
    content: ''; display: block; width: 18px; height: 2px;
    background: var(--red); border-radius: 2px;
  }
  .section-title {
    font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 700;
    letter-spacing: -1px; line-height: 1.18; color: var(--text); margin-bottom: 14px;
  }
  .section-title em { color: var(--red); font-style: normal; }
  .section-sub {
    font-size: 1rem; color: var(--muted); line-height: 1.75;
    max-width: 540px; margin-bottom: 48px;
  }

  /* ── CARDS ── */
  .cards-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;
  }
  .feature-card {
    background: #fff; border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 32px;
    transition: transform .22s, box-shadow .22s, border-color .22s;
    position: relative; overflow: hidden; cursor: pointer;
  }
  .feature-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: var(--red); transform: scaleX(0); transform-origin: left;
    transition: transform .28s ease;
  }
  .feature-card:hover {
    transform: translateY(-4px); box-shadow: var(--shadow-md);
    border-color: rgba(230,51,41,.2);
  }
  .feature-card:hover::after { transform: scaleX(1); }
  .card-icon-wrap {
    width: 52px; height: 52px; border-radius: 12px;
    background: var(--red-subtle);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 20px;
    border: 1px solid rgba(230,51,41,.15);
  }
  .feature-card h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 10px; }
  .feature-card p { font-size: .9rem; color: var(--muted); line-height: 1.65; }
  .card-arrow {
    display: inline-flex; align-items: center; gap: 5px;
    color: var(--red); font-size: .85rem; font-weight: 600;
    margin-top: 18px; transition: gap .18s;
  }
  .feature-card:hover .card-arrow { gap: 9px; }

  /* ── SPLIT ── */
  .split-section {
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
    align-items: center; padding: 80px;
  }
  .split-section.flip { direction: rtl; }
  .split-section.flip > * { direction: ltr; }
  .split-visual {
    background: var(--border2); border-radius: var(--radius-lg);
    border: 1px solid var(--border); overflow: hidden;
    position: relative; box-shadow: var(--shadow);
  }

  .checklist { list-style: none; margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
  .checklist li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: .9rem; color: var(--muted); line-height: 1.55;
  }
  .check-icon {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--red); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: .65rem; flex-shrink: 0; margin-top: 1px;
  }

  /* ── STEPS ── */
  .steps-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px; margin-top: 48px;
  }
  .step-card {
    background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 28px; position: relative;
    transition: transform .2s, box-shadow .2s;
  }
  .step-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .step-num {
    font-family: 'Pacifico', cursive;
    font-size: 2.5rem; color: var(--red); opacity: .15;
    position: absolute; top: 16px; right: 20px; line-height: 1;
  }
  .step-icon { font-size: 26px; margin-bottom: 14px; }
  .step-card h3 { font-size: .95rem; font-weight: 600; margin-bottom: 8px; }
  .step-card p { font-size: .85rem; color: var(--muted); line-height: 1.6; }

  /* ── STATS BAND ── */
  .stats-band {
    background: var(--red); padding: 60px 80px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 40px; text-align: center;
  }
  .stat-num {
    font-size: 2.8rem; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 6px;
  }
  .stat-label { font-size: .875rem; color: rgba(255,255,255,.75); }

  /* ── CTA BAND ── */
  .cta-band {
    margin: 80px;
    background: linear-gradient(135deg, #fff5f5 0%, #fff 60%);
    border: 1.5px solid rgba(230,51,41,.2);
    border-radius: var(--radius-lg); padding: 70px 60px;
    display: grid; grid-template-columns: 1fr auto;
    align-items: center; gap: 40px;
    position: relative; overflow: hidden;
  }
  .cta-band::before {
  content: '';
  position: absolute;
  right: -60px;
  top: -60px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(230,51,41,.08) 0%, transparent 70%);
  
  pointer-events: none;   /* ✅ ADD THIS */
}
  .cta-band h2 {
    font-size: clamp(1.6rem, 2.5vw, 2.2rem); font-weight: 700;
    letter-spacing: -1px; margin-bottom: 10px;
  }
  .cta-band p { font-size: .95rem; color: var(--muted); max-width: 420px; }
  .cta-band-actions { display: flex; gap: 12px; flex-shrink: 0; flex-wrap: wrap; }

  /* ── MOCK UI ── */
  .mock-panel {
    background: #fff; border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow);
  }
  .mock-header {
    background: var(--red); padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .mock-header h4 { color: #fff; font-size: .85rem; font-weight: 600; }
  .mock-header span {
    background: rgba(255,255,255,.25); color: #fff;
    font-size: .72rem; padding: 3px 10px; border-radius: 999px;
  }
  .mock-table-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; border-bottom: 1px solid var(--border2);
    font-size: .85rem; transition: background .15s;
  }
  .mock-table-row:hover { background: var(--border2); }
  .mock-table-row:last-child { border-bottom: none; }

  /* ── ORDER LIVE ── */
  .order-live {
    border-left: 3px solid var(--red);
    background: #fff; padding: 14px 16px;
    border-radius: 0 var(--radius) var(--radius) 0;
    margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.05);
  }
  .order-live-head {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
  }
  .order-live-head strong { font-size: .9rem; }
  .order-live-head span { font-size: .75rem; color: var(--muted); }
  .order-items-list { font-size: .82rem; color: var(--muted); line-height: 1.8; }
  .order-footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border2);
  }
  .order-total { font-size: .85rem; font-weight: 700; color: var(--text); }
  .order-btn {
    font-size: .75rem; font-weight: 600; color: #fff;
    background: var(--red); padding: 4px 12px; border-radius: 6px; cursor: pointer; border: none;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── BADGES ── */
  .badge { font-size: .72rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
  .badge-red { background: var(--red-subtle); color: var(--red); }
  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-blue { background: #eff6ff; color: #2563eb; }
  .badge-gray { background: var(--border2); color: var(--muted); }

  /* ── MENU ROW ── */
  .menu-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 0; border-bottom: 1px solid var(--border2);
  }
  .menu-thumb {
    width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .menu-details { flex: 1; }
  .menu-details strong { font-size: .9rem; font-weight: 600; display: block; }
  .menu-details small { font-size: .78rem; color: var(--muted); }
  .menu-price-tag { font-weight: 700; color: var(--red); font-size: .9rem; }
  .menu-toggle {
    width: 36px; height: 20px; border-radius: 999px; background: var(--red);
    position: relative; cursor: pointer; flex-shrink: 0;
  }
  .menu-toggle::after {
    content: ''; position: absolute; top: 3px; right: 3px;
    width: 14px; height: 14px; border-radius: 50%; background: #fff;
  }
  .menu-toggle.off { background: var(--border); }
  .menu-toggle.off::after { right: auto; left: 3px; }

  /* ── BILL ── */
  .bill-wrap {
    background: #fff; border-radius: var(--radius-lg);
    border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow);
  }
  .bill-top { background: var(--red); padding: 20px 24px; text-align: center; }
  .bill-top h4 { color: #fff; font-size: 1rem; font-weight: 600; }
  .bill-top small { color: rgba(255,255,255,.7); font-size: .78rem; }
  .bill-body { padding: 20px 24px; }
  .bill-line-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; font-size: .875rem; border-bottom: 1px solid var(--border2);
  }
  .bill-line-item span { color: var(--muted); }
  .bill-total-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 24px; background: var(--red-subtle);
    border-top: 1.5px dashed rgba(230,51,41,.3);
  }
  .bill-total-row strong { font-size: 1rem; font-weight: 700; }
  .bill-amt { color: var(--red); font-size: 1.1rem; font-weight: 700; }

  /* ── QR ── */
  .qr-display {
    background: #fff; border-radius: var(--radius); padding: 20px;
    display: inline-block; box-shadow: var(--shadow); border: 1px solid var(--border);
  }

  /* ── FOOTER ── */
  .page-footer {
    border-top: 1px solid var(--border); padding: 40px 80px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;
  }
  .footer-logo {
    font-family: 'Pacifico', cursive; font-size: 1.2rem;
    color: var(--red); cursor: pointer; text-decoration: none;
  }
  .footer-links { display: flex; gap: 28px; }
  .footer-links a {
    font-size: .85rem; color: var(--muted); text-decoration: none;
    cursor: pointer; transition: color .18s;
  }
  .footer-links a:hover { color: var(--red); }
  .footer-copy { font-size: .82rem; color: var(--muted2); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 40px 24px 60px; min-height: auto; }
    .hero-visual { display: none; }
    .section-wrap { padding: 60px 24px; }
    .split-section { grid-template-columns: 1fr; padding: 60px 24px; direction: ltr; }
    .split-section.flip { direction: ltr; }
    .stats-band { grid-template-columns: repeat(2, 1fr); padding: 40px 24px; }
    .cta-band { grid-template-columns: 1fr; margin: 40px 24px; padding: 40px 32px; }
    .page-footer { padding: 32px 24px; }
  }
`;
