import { getCollection } from "astro:content";
import { SITE } from "../config/site";

export async function GET() {
  const articles = await getCollection("articles");

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
    "/food-shortages/",
    "/food-storage/",
    "/fertilizer/",
    "/water-food/",
    "/climate-agriculture/",
    "/supply-chain/",
    "/solutions/",
    "/countries/"
  ];

  const urls = [
    ...staticPaths,
    ...articles.map((article) => `/articles/${article.id}/`)
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((path) => `  <url><loc>${new URL(path, SITE.url).toString()}</loc></url>`),
    '</urlset>'
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8"
    }
  });
}
