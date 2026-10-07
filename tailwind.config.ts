import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1440px' } },
    extend: {
      fontFamily: { sans: ['Inter', '"Noto Sans Hebrew"', 'ui-sans-serif', 'system-ui', 'Arial', 'sans-serif'], mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'] },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        sidebar: { DEFAULT: 'hsl(var(--sidebar))', foreground: 'hsl(var(--sidebar-foreground))', muted: 'hsl(var(--sidebar-muted))', active: 'hsl(var(--sidebar-active))' },
        // Charte Dekel Agri-Vision
        dekel: { 50: '#EEF5F0', 100: '#E8F0EA', 500: '#2C6B3E', 600: '#174E26', 700: '#0F3A1B' },
        agri: { 50: '#F4F9EC', 100: '#EAF3DB', 500: '#8DBE48', 700: '#4C7A1E' },
        harvest: { 50: '#FEF8EC', 100: '#FDF1DC', 500: '#F0A020', 700: '#9A6200' }
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      keyframes: {
        'pulse-ring': { '0%': { boxShadow: '0 0 0 0 rgba(141,190,72,.55)' }, '100%': { boxShadow: '0 0 0 10px rgba(141,190,72,0)' } }
      },
      animation: { 'pulse-ring': 'pulse-ring 1.2s ease-out', 'pulse-dot': 'pulse-ring 2s infinite' }
    }
  },
  plugins: [animate]
}

export default config
