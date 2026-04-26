export type PageId =
  | 'home'
  | 'qr-ordering'
  | 'digital-menu'
  | 'billing'
  | 'menu-setup'
  | 'realtime'
  | 'qr-gen';

export const theme = {
  red: '#e63329',
  redDark: '#c0271e',
  redLight: '#ff5249',
  redBg: '#fff5f5',
  redSubtle: '#fdecea',
  text: '#1a1a1a',
  muted: '#6b7280',
  muted2: '#9ca3af',
  border: '#e5e7eb',
  border2: '#f3f4f6',
  white: '#ffffff',
} as const;

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red: #e63329;
    --red-dark: #c0271e;
    --red-light: #ff5249;
    --red-bg: #fff5f5;
    --red-subtle: #fdecea;
    --text: #1a1a1a;
    --muted: #6b7280;
    --muted2: #9ca3af;
    --border: #e5e7eb;
    --border2: #f3f4f6;
    --white: #ffffff;
    --radius: 12px;
    --radius-lg: 18px;
    --shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
    --shadow-md: 0 4px 6px rgba(0,0,0,.05), 0 10px 40px rgba(0,0,0,.08);
    --shadow-red: 0 8px 32px rgba(230,51,41,.2);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: #fff;
    overflow-x: hidden;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .page-enter {
    animation: fadeUp 0.38s ease;
  }
`;
