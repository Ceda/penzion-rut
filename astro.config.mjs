// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare({
    imageService: "compile",
    routes: {
      extend: {
        include: [{ pattern: "/api/*" }], // Only API routes as functions
      },
    },
  }),
});
