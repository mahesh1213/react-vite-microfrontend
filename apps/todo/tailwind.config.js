const sharedConfig = require("@shared/ui-theme/tailwind.config");

module.exports = {
  presets: [sharedConfig],

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",

    "../packages/ui-theme/**/*.{js,ts,jsx,tsx,css}",
  ],
};
