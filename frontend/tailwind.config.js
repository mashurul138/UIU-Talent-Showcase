/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        // Aurora animations
        'aurora-flow': 'aurora-flow 60s ease-in-out infinite',
        'aurora-wave': 'aurora-wave 55s ease-in-out infinite',
        'aurora-float': 'aurora-float 65s ease-in-out infinite',
        'aurora-pulse': 'aurora-pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // Transform animations
        'translate-diagonal': 'translate-diagonal 50s ease-in-out infinite',
        'translate-diagonal-reverse': 'translate-diagonal 55s ease-in-out infinite reverse',
        'translate-horizontal': 'translate-horizontal 45s ease-in-out infinite',
        'translate-horizontal-reverse': 'translate-horizontal 52s ease-in-out infinite reverse',
        'translate-vertical': 'translate-vertical 45s ease-in-out infinite',
        'translate-vertical-reverse': 'translate-vertical 54s ease-in-out infinite reverse',

        // Modern animations
        'shimmer': 'shimmer 2s infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce-slow 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        blob: "blob 7s infinite",
      },
      keyframes: {
        // Aurora keyframes
        'aurora-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'aurora-wave': {
          '0%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
          '100%': { backgroundPosition: '50% 0%' },
        },
        'aurora-float': {
          '0%': { backgroundPosition: '0% 0%' },
          '33%': { backgroundPosition: '100% 50%' },
          '66%': { backgroundPosition: '50% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        'aurora-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },

        // Transform keyframes
        'translate-diagonal': {
          '0%': { transform: 'translate3d(0%, 0%, 0) scale(1)' },
          '50%': { transform: 'translate3d(5%, 8%, 0) scale(1.05)' },
          '100%': { transform: 'translate3d(0%, 0%, 0) scale(1)' },
        },
        'translate-horizontal': {
          '0%': { transform: 'translate3d(-3%, 0%, 0) scale(1)' },
          '50%': { transform: 'translate3d(3%, 0%, 0) scale(1.03)' },
          '100%': { transform: 'translate3d(-3%, 0%, 0) scale(1)' },
        },
        'translate-vertical': {
          '0%': { transform: 'translate3d(0%, -2%, 0) scale(1)' },
          '50%': { transform: 'translate3d(0%, 3%, 0) scale(1.02)' },
          '100%': { transform: 'translate3d(0%, -2%, 0) scale(1)' },
        },

        // Modern keyframes
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slide-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      backgroundImage: {
        // Gradient presets
        'gradient-warm': 'linear-gradient(135deg, #ff9a56 0%, #fdbf24 50%, #f97316 100%)',
        'gradient-cool': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6366f1 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
        'gradient-aurora': 'linear-gradient(120deg, #ffa564 0%, #a78bfa 35%, #60a5fa 70%)',
        'gradient-sunset': 'linear-gradient(to right, #ff6b35 0%, #f7931e 50%, #fdbf24 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%)',
        'gradient-forest': 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.5)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin'),
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay"),
        }
      );
    },
  ],
}
