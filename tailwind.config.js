/** Same font setup as the original inline CDN config, now built locally. */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
