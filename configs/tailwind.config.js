/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2db85e",
          foreground: "#0f1f15",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#fa5538",
          foreground: "#ffffff",
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
        // Custom colors for AutoTest theme with CSS variables
        surface: {
          light: "var(--color-surface-light)",
          dark: "var(--color-surface-dark)",
        },
        sidebar: {
          light: "var(--color-sidebar-light)",
          dark: "var(--color-sidebar-dark)",
        },
        "border-light": "var(--color-border-light)",
        "border-dark": "var(--color-border-dark)",
        "text-muted-light": "var(--color-text-muted-light)",
        "text-muted-dark": "var(--color-text-muted-dark)",
        success: "#39E079",
        warning: "#fbbf24",
        danger: "#fa5538",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        skeleton: {
          "0%": {
            backgroundColor: "hsl(var(--muted))",
          },
          "50%": {
            backgroundColor: "hsl(var(--muted) / 0.5)",
          },
          "100%": {
            backgroundColor: "hsl(var(--muted))",
          },
        },
        scaleIn: {
          "0%": {
            transform: "scale(0.95)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        themeSwitch: {
          "0%": {
            transform: "rotate(0deg) scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "rotate(180deg) scale(1.2)",
            opacity: "0.8",
          },
          "100%": {
            transform: "rotate(360deg) scale(1)",
            opacity: "1",
          },
        },
        pulseSubtle: {
          "0%, 100%": {
            opacity: "0.2",
          },
          "50%": {
            opacity: "0.3",
          },
        },
        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        scaleUp: {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      boxShadow: {
        'tinted-sm': '0 1px 2px 0 rgb(142 45% 50% / 0.05)',
        'tinted': '0 1px 3px 0 rgb(142 45% 50% / 0.1), 0 1px 2px -1px rgb(142 45% 50% / 0.1)',
        'tinted-md': '0 4px 6px -1px rgb(142 45% 50% / 0.1), 0 2px 4px -2px rgb(142 45% 50% / 0.1)',
        'tinted-lg': '0 10px 15px -3px rgb(142 45% 50% / 0.1), 0 4px 6px -4px rgb(142 45% 50% / 0.1)',
        'tinted-xl': '0 20px 25px -5px rgb(142 45% 50% / 0.1), 0 8px 10px -6px rgb(142 45% 50% / 0.1)',
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "skeleton-pulse": "skeleton 1.5s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "theme-switch": "themeSwitch 0.5s ease-in-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-up": "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
