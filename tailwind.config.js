
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        skyward: {
          primary: "#E53935",  // Red
          secondary: "#FF6D00", // Orange-red secondary
          dark: "#B71C1C",     // Dark red
          light: "#FFEBEE",    // Light red background
          accent: "#FFD166",   // Kept accent yellow
        },
        safari: {
          earth: "#BD8B2F",
          grass: "#6B8E35",
          sunset: "#E85C3F",
          wildlife: "#4C6E8C",
          sahara: "#F2DCA2",
          orange: "#D96A29",
          night: "#2B3A4B",
          
          // Additional colors from the extended palette
          masai: "#E53935",      // Masai red
          serengeti: "#FFB74D",  // Serengeti sun/sand
          kente: "#43A047",      // Kente cloth green
          tribal: "#6D4C41",     // Tribal wood brown
          baobab: "#795548",     // Baobab tree brown
          zebra: "#212121",      // Zebra black
          sunset: "#FF7043",     // African sunset orange
          jungle: "#2E7D32",     // Jungle green
          savanna: "#F57F17",    // Savanna gold
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
