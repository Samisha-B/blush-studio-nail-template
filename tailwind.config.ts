import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { cream: '#F6F3EC', blush: '#EAD7CF', rose: '#B5736D', mauve: '#6F7F6A', espresso: '#2F3A2F', gold: '#B8985F' },
      fontFamily: { serif: ['var(--font-serif)', 'Georgia', 'serif'], script: ['var(--font-script)', 'cursive'], sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 10px 30px -12px rgba(47,58,47,0.25)' },
    },
  },
  plugins: [],
};
export default config;
