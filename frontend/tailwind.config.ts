import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
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
				'bounce-slow': {
					'0%, 100%': {
						transform: 'translateY(-10%)',
						'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(0)',
						'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				glitch: {
					'0%': { 'clip-path': 'inset(20% 0 50% 0)' },
					'5%': { 'clip-path': 'inset(10% 0 60% 0)' },
					'10%': { 'clip-path': 'inset(15% 0 55% 0)' },
					'15%': { 'clip-path': 'inset(25% 0 35% 0)' },
					'20%': { 'clip-path': 'inset(30% 0 40% 0)' },
					'25%': { 'clip-path': 'inset(40% 0 20% 0)' },
					'30%': { 'clip-path': 'inset(10% 0 60% 0)' },
					'35%': { 'clip-path': 'inset(15% 0 55% 0)' },
					'40%': { 'clip-path': 'inset(25% 0 35% 0)' },
					'45%': { 'clip-path': 'inset(30% 0 40% 0)' },
					'50%': { 'clip-path': 'inset(20% 0 50% 0)' },
					'55%': { 'clip-path': 'inset(10% 0 60% 0)' },
					'60%': { 'clip-path': 'inset(15% 0 55% 0)' },
					'65%': { 'clip-path': 'inset(25% 0 35% 0)' },
					'70%': { 'clip-path': 'inset(30% 0 40% 0)' },
					'75%': { 'clip-path': 'inset(40% 0 20% 0)' },
					'80%': { 'clip-path': 'inset(20% 0 50% 0)' },
					'85%': { 'clip-path': 'inset(10% 0 60% 0)' },
					'90%': { 'clip-path': 'inset(15% 0 55% 0)' },
					'95%': { 'clip-path': 'inset(25% 0 35% 0)' },
					'100%': { 'clip-path': 'inset(30% 0 40% 0)' }
				},
				'flame-flicker': {
					'0%, 100%': { opacity: '1', transform: 'scaleY(1)' },
					'25%': { opacity: '0.8', transform: 'scaleY(0.9)' },
					'50%': { opacity: '1', transform: 'scaleY(1.1)' },
					'75%': { opacity: '0.9', transform: 'scaleY(0.95)' }
				},
				'flame-shoot': {
					'0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
					'100%': { transform: 'translateY(80px) scale(0.3)', opacity: '0' }
				},
				'rocket-float': {
					'0%, 100%': { transform: 'translateY(0) rotate(-45deg)' },
					'50%': { transform: 'translateY(-8px) rotate(-45deg)' }
				},
				'rocket-thrust': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-1px)' },
					'75%': { transform: 'translateX(1px)' }
				},
				'text-glow': {
					'0%, 100%': { textShadow: '0 0 10px rgba(129, 140, 248, 0.5), 0 0 20px rgba(129, 140, 248, 0.3)' },
					'50%': { textShadow: '0 0 20px rgba(129, 140, 248, 0.8), 0 0 40px rgba(129, 140, 248, 0.5)' }
				},
				'gradient-flow': {
					'0%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
					'100%': { 'background-position': '0% 50%' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-slow': 'bounce-slow 1.5s infinite',
				'glitch-after': 'glitch var(--after-duration) infinite linear alternate-reverse',
				'glitch-before': 'glitch var(--before-duration) infinite linear alternate-reverse',
				'flame-flicker': 'flame-flicker 0.15s ease-in-out infinite',
				'flame-shoot': 'flame-shoot 0.6s ease-out infinite',
				'rocket-float': 'rocket-float 2s ease-in-out infinite',
				'rocket-thrust': 'rocket-thrust 0.1s ease-in-out infinite',
				'text-glow': 'text-glow 2s ease-in-out infinite',
				'gradient-flow': 'gradient-flow 3s ease infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
