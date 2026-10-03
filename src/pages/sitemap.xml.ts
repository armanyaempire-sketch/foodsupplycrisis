import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { slugify } from "../utils/slugify";

const staticPaths = [
  "/",
  "/about/",
  "/about/editorial-desk/",
  "/contact/",
  "/disclaimer/",
  "/editorial-policy/",
  "/privacy-policy/",
  "/sources/",
  "/global-food-crisis/",
  "/food-prices/",
  "/food-supply/",
  "/food-security/",
  "/food-storage/",
  "/fertilizer/",
  "/water-food/",
  "/climate-agriculture/",
  "/supply-chain/",
  "/solutions/",
  "/countries/"
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const GET: APIRoute = async () => {
  const articles = await getCollection("articles");

  const categoryPaths = [...new Set(articles.map((article) => article.data.category))]
    .map((category) => `/categories/${slugify(category)}/`);

  const articlePaths = articles.map((article) => `/articles/${article.id}/`);
  const paths = [...new Set([...staticPaths, ...categoryPaths, ...articlePaths])];

  const body = paths
    .map((path) => `  <url><loc>${escapeXml(new URL(path, SITE.url).toString())}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
