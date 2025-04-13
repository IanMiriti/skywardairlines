
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				flysafari: {
					primary: '#6200EA',    // Deep purple
					secondary: '#7C43BD',  // Light purple
					dark: '#1A1F2C',       // Dark blue
					light: '#F8FAFC',      // Light background 
					accent: '#FF6D00',     // Bright orange
				},
				safari: {
					orange: '#F97316',     // Vibrant orange (sunset)
					gold: '#FFC107',       // Golden yellow (savanna)
					earth: '#8B4513',      // Earth brown
					green: '#2E8B57',      // Safari green (vegetation)
					sky: '#0EA5E9',        // Vibrant blue (sky/water)
					clay: '#CD5C5C',       // Reddish clay
					acacia: '#FFD700',     // Acacia yellow
					wildlife: '#8B5CF6',   // Wildlife purple accent
					
					// New African-themed colors
					masai: '#E53935',      // Masai red
					serengeti: '#FFB74D',  // Serengeti sun/sand
					kente: '#43A047',      // Kente cloth green
					tribal: '#6D4C41',     // Tribal wood brown
					sahara: '#FFCC80',     // Sahara sand
					baobab: '#795548',     // Baobab tree brown
					zebra: '#212121',      // Zebra black
					sunset: '#FF7043',     // African sunset orange
					jungle: '#2E7D32',     // Jungle green
					savanna: '#F57F17',    // Savanna gold
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite'
			},
			backgroundImage: {
				'safari-gradient': 'linear-gradient(90deg, hsla(29, 92%, 70%, 1) 0%, hsla(0, 87%, 73%, 1) 100%)',
				'wildlife-gradient': 'linear-gradient(90deg, hsla(139, 70%, 75%, 1) 0%, hsla(63, 90%, 76%, 1) 100%)',
				'serengeti-sunset': 'linear-gradient(90deg, #F57F17 0%, #FF7043 100%)',
				'savanna-plains': 'linear-gradient(90deg, #FFCC80 0%, #FFB74D 100%)',
				'tribal-pattern': 'repeating-linear-gradient(45deg, #6D4C41 0px, #6D4C41 10px, #8D6E63 10px, #8D6E63 20px)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
