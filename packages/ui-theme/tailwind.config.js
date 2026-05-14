const forms = require("@tailwindcss/forms");
const typography = require("@tailwindcss/typography");
const lineClamp = require("@tailwindcss/line-clamp");
const containerQueries = require("@tailwindcss/container-queries");

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#9333ea",
        success: "#16a34a",
      },

      borderRadius: {
        xl2: "1rem",
      },

      spacing: {
        128: "32rem",
      },
    },
  },

  plugins: [forms, typography, lineClamp, containerQueries],
};
