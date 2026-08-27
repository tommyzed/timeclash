import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(async ({ mode }) => {
  // Load from .env files (for local development)
  const fileEnv = loadEnv(mode, process.cwd(), '');

  // Use process.env (Railway) with fallback to .env file (local)
  const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID || fileEnv.VITE_GOOGLE_CLIENT_ID;

  console.log("VITE_GOOGLE_CLIENT_ID:", googleClientId ? "***SET***" : "NOT SET");

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "TimeClash - Historical Timeline Game",
          short_name: "TimeClash",
          description: "Race through history in the ultimate chronological battle! Historical timeline game inspired by Chronology.",
          theme_color: "#ffffff",
          categories: ["games", "trivia", "education"],
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
      ...(process.env.NODE_ENV !== "production" &&
        process.env.REPL_ID !== undefined
        ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
        : []),
    ],
    define: {
      // Expose VITE_GOOGLE_CLIENT_ID to client-side code
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
