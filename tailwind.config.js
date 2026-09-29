/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Semantic background colours (CSS-variable driven) ─────────── */
      backgroundColor: {
        base:  'var(--bg-base)',
        panel: 'var(--bg-panel)',
        card:  'var(--bg-card)',
        deep:  'var(--bg-deep)',
        input: 'var(--bg-input)',
      },
      /* ── Semantic border colours ────────────────────────────────────── */
      borderColor: {
        theme:    'var(--border)',
        'theme-sub': 'var(--border-sub)',
      },
      /* ── Semantic text colours ──────────────────────────────────────── */
      textColor: {
        t1: 'var(--t1)',
        t2: 'var(--t2)',
        t3: 'var(--t3)',
      },
      /* ── Brand / accent palette ─────────────────────────────────────── */
      colors: {
        tech: {
          cyan:    '#06b6d4',
          blue:    '#3b82f6',
          indigo:  '#6366f1',
          emerald: '#10b981',
          amber:   '#f59e0b',
          rose:    '#f43f5e',
          violet:  '#8b5cf6',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"','ui-monospace','SFMono-Regular','Menlo','monospace'],
        sans: ['Inter','system-ui','-apple-system','BlinkMacSystemFont','Segoe UI','sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
