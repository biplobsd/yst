/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  themes: false,
  plugins: [
    require("daisyui"),
    require("tailwind-modern-scroll"),
  ],
};
