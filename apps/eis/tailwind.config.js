/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        /* ── Shadcn Core Semantic Tokens ───────────────── */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          bright: 'hsl(var(--primary-bright))',
          deep: 'hsl(var(--primary-deep))',
          soft: 'hsl(var(--primary-soft))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        /* ── HP Design System — Surface ────────────────── */
        canvas: 'hsl(var(--canvas))',
        surface: {
          soft: 'hsl(var(--surface-soft))',
          card: 'hsl(var(--surface-card))',
          strong: 'hsl(var(--surface-strong))',
          dark: 'hsl(var(--surface-dark))',
          elevated: 'hsl(var(--surface-dark-elevated))',
        },
        hairline: {
          DEFAULT: 'hsl(var(--hairline))',
          soft: 'hsl(var(--hairline-soft))',
        },

        /* ── HP Design System — Text ───────────────────── */
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          deep: 'hsl(var(--ink-deep))',
          soft: 'hsl(var(--ink-soft))',
        },
        charcoal: 'hsl(var(--charcoal))',
        graphite: 'hsl(var(--graphite))',

        /* ── HP Design System — Semantic Accents ───────── */
        bloom: {
          coral: 'hsl(var(--bloom-coral))',
          rose: 'hsl(var(--bloom-rose))',
          deep: 'hsl(var(--destructive))',
          wine: 'hsl(0 65% 21%)',
        },
        storm: {
          mist: 'hsl(var(--storm-mist))',
          sea: 'hsl(var(--storm-sea))',
          deep: 'hsl(var(--storm-deep))',
        },

        /* ── Indicator / Chart ─────────────────────────── */
        semantic: {
          up: 'hsl(var(--semantic-up))',
          down: 'hsl(var(--semantic-down))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },

        /* ── Sidebar ───────────────────────────────────── */
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },

      /* ── HP Design System — Border Radius ────────────── */
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '3px',
        md: '4px',
        lg: '8px',
        xl: '16px',
        pill: '9999px',
      },

      /* ── Font Family ──────────────────────────────────── */
      fontFamily: {
        sans: ['Inter'],
      },

      /* ── HP Design System — Font Sizes ───────────────── */
      fontSize: {
        'display-xxl': ['72px', { lineHeight: '1.0', fontWeight: '500' }],
        'display-xl': ['56px', { lineHeight: '1.0', fontWeight: '500' }],
        'display-lg': ['44px', { lineHeight: '1.0', fontWeight: '500' }],
        'display-md': ['32px', { lineHeight: '1.0', fontWeight: '500' }],
        'display-sm': ['24px', { lineHeight: '1.17', fontWeight: '500' }],
        'display-xs': ['20px', { lineHeight: '1.0', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.33', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.38', fontWeight: '400' }],
        'body-emphasis': ['16px', { lineHeight: '1.38', fontWeight: '500' }],
        'caption-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-bold': ['14px', { lineHeight: '1.3', fontWeight: '700' }],
        'caption-sm': ['12px', { lineHeight: '1.33', fontWeight: '400' }],
        'link-md': ['16px', { lineHeight: '1.38', fontWeight: '500' }],
        'button-md': ['14px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.7px' }],
        'button-sm': ['12.6px', { lineHeight: '1.0', fontWeight: '700', letterSpacing: '0.126px' }],
        'price-md': ['24px', { lineHeight: '1.17', fontWeight: '500' }],
      },

      /* ── HP Design System — Spacing ──────────────────── */
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
        section: '80px',
      },
    },
  },
  plugins: [],
};
