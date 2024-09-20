import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
	'./src/**/*.{ts,tsx}',
  ],
  theme: {
  	extend: {
  		colors: {
			'primary-500': '#877EFF',
			'primary-600': '#5D5FEF',
			'secondary-500': '#FFB620',
			'off-white': '#D0DFFF',
			'red': '#FF5A5A',
			'dark-1': '#000000',
			'dark-2': '#09090A',
			'dark-3': '#101012',
			'dark-4': '#1F1F22',
			'light-1': '#FFFFFF',
			'light-2': '#EFEFEF',
			'light-3': '#7878A3',
			'light-4': '#5C5C7B',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		  screens: {
			'xs': '480px',
		  
		  },
		  width: {
			'420': '420px',
			'465': '465px',
		  },
		  fontFamily: {
			inter: ['Inter', 'sans-serif'],
	
		  },
		  keyframes: {
			'accordion-down': {
			  from: { height: '0px' },
			  to: { height: 'var(--radix-accordion-content-height)' },
			},
			'accordion-up': {
			  from: { height: 'var(--radix-accordion-content-height)' },
			  to: { height: '0px' },
			},
		  },
		  animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
		  },
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
