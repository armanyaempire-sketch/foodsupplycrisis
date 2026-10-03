import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://foodsupplycrisis.pages.dev",
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
  compressHTML: true
});
