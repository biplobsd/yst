/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [
    require("daisyui"),
    require("tailwind-modern-scroll"),
  ],
  daisyui: {
    logs: false,
  },
};
