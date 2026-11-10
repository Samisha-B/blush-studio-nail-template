import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { cream: '#FBF6EF', blush: '#F3DCD6', rose: '#B5736D', mauve: '#8C6B73', espresso: '#3A2A25', gold: '#B8985F' },
      fontFamily: { serif: ['var(--font-serif)', 'Georgia', 'serif'], sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 10px 30px -12px rgba(58,42,37,0.25)' },
    },
  },
  plugins: [],
};
export default config;
