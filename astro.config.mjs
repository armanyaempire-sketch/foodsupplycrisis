import { defineConfig } from "astro/config";
import rehypeInjectAds from "./src/plugins/rehype-inject-ads.mjs";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://foodsupplycrisis.pages.dev",
  trailingSlash: "always",
  output: "static",
  compressHTML: true,
  markdown: { rehypePlugins: [rehypeInjectAds] }
});
