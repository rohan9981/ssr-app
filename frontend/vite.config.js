import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/ssr-app/',
  //server: {
  // port: 5173,
  //  proxy: {
      // Forwards /api requests to the Flask backend during development
  //    "/api": "http://localhost:5000",
   // },
 // },
});
