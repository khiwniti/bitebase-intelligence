/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/components/**/*.{ts,tsx}',
    '../../packages/ui/index.tsx',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['JetBrains Mono', 'Inter', 'system-ui', 'sans-serif'],
        display: ['JetBrains Mono', 'Inter', 'system-ui', 'sans-serif'],
        body: ['JetBrains Mono', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // BiteBase Brand Colors - Following Brand Guidelines V1 2024
        // Primary Color: Mantis (90% usage)
        primary: {
          50: '#f0f9ee',
          100: '#e8f5e5',
          200: '#c8e6c0',
          300: '#a8d79b',
          400: '#8ed080',
          500: '#74C365',
          600: '#5fa854',
          700: '#4a8d43',
          800: '#357232',
          900: '#205721',
          DEFAULT: '#74C365',
          foreground: '#ffffff',
        },
        // Accent Colors (5% each)
        accent: {
          red: {
            50: '#fef2f2',
            100: '#f8e6e3',
            200: '#f1c7c1',
            300: '#e8a89f',
            400: '#df897d',
            500: '#E23D28',
            600: '#c73520',
            700: '#ac2d18',
            800: '#912510',
            900: '#761d08',
            DEFAULT: '#E23D28',
            foreground: '#ffffff',
          },
          saffron: {
            50: '#fffbeb',
            100: '#fef7e0',
            200: '#fdecc8',
            300: '#fce1b0',
            400: '#fbd698',
            500: '#F4C431',
            600: '#e0b02a',
            700: '#cc9c23',
            800: '#b8881c',
            900: '#a47415',
            DEFAULT: '#F4C431',
            foreground: '#1f2937',
          },
        },
        // BiteBase Secondary Colors
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: '#64748b',
          foreground: '#ffffff',
        },
        // Text Colors
        text: {
          dark: '#1f2937',
          light: '#6b7280',
          muted: '#9ca3af',
        },
        // Background Colors
        background: {
          DEFAULT: '#f9fafb',
          white: '#ffffff',
          gray: '#f3f4f6',
        },
        // Legacy BiteBase colors for compatibility
        'bitebase-green': '#74C365',
        'bitebase-mantis': '#74C365',
        'bitebase-red': '#E23D28',
        'bitebase-saffron': '#F4C431',
        'bitebase-blue': '#3B82F6',
        'bitebase-purple': '#8B5CF6',
        'bitebase-orange': '#F59E0B',
        'warning': '#F4C431',
        // Legacy shadcn/ui colors for compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'neutral': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      boxShadow: {
        'bitebase-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'bitebase-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'bitebase-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'bitebase-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(116, 195, 101, 0.5)',
        'glow-lg': '0 0 30px rgba(116, 195, 101, 0.3)',
        'glow-red': '0 0 20px rgba(226, 61, 40, 0.5)',
        'glow-saffron': '0 0 20px rgba(244, 196, 49, 0.5)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fadeInUp": {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        "float": {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        "bounce-slow": {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-20px)',
          },
          '60%': {
            transform: 'translateY(-10px)',
          },
        },
        "ripple": {
          '0%': {
            transform: 'scale(0)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(20)',
            opacity: '0',
          },
        },
        "spin-slow": {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeInUp": "fadeInUp 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "bounce-slow": "bounce-slow 2s infinite",
        "ripple": "ripple 1s ease-out",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
