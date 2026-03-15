/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'vf-bg':'#080810','vf-bg2':'#0F0F1A','vf-card':'#141422','vf-card2':'#1C1C2E',
        'vf-green':'#39FF14','vf-cyan':'#00E5FF','vf-amber':'#FF6B35','vf-purple':'#8B5CF6',
        'vf-text':'#F0F0FF','vf-muted':'#6B6B8A','vf-border':'#252540',
      },
      fontFamily: { display: ['"Bebas Neue"','sans-serif'], body: ['"Outfit"','sans-serif'] },
    },
  },
  plugins: [],
}
