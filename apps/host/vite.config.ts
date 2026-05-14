import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "app",
      filename: "remoteEntry.js",
      exposes: {
        "./store": "./src/store/store.ts",
        "./todoActions": "./src/store/todo/todoActions.ts",
      },
      remotes: {
        todoApp: "http://localhost:3001/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
