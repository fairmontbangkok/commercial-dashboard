import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      colors: {
        paper: 'hsl(var(--paper))',
        ink: 'hsl(var(--ink))',
        'ink-90': 'hsl(var(--ink) / 0.90)',
        'ink-70': 'hsl(var(--ink) / 0.70)',
        'ink-50': 'hsl(var(--ink) / 0.50)',
        'ink-30': 'hsl(var(--ink) / 0.30)',
        'ink-15': 'hsl(var(--ink) / 0.15)',
        'ink-08': 'hsl(var(--ink) / 0.08)',
        'ink-04': 'hsl(var(--ink) / 0.04)',
        surface: 'hsl(var(--surface))',
        'surface-2': 'hsl(var(--surface-2))',
        accent: 'hsl(var(--accent))',
        'signal-positive': 'hsl(var(--signal-positive))',
        'signal-caution': 'hsl(var(--signal-caution))',
        'signal-negative': 'hsl(var(--signal-negative))',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px hsl(var(--ink) / 0.04)',
        md: '0 4px 24px hsl(var(--ink) / 0.06)',
        lg: '0 8px 32px hsl(var(--ink) / 0.08)',
      },
      letterSpacing: {
        tighter: '-0.025em',
        tight: '-0.015em',
        normal: '0',
        wide: '0.04em',
        wider: '0.12em',
        widest: '0.18em',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 320ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};

export default config;
