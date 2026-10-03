import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://foodsupplycrisis.com",
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
  compressHTML: true
});
