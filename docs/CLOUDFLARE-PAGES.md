# Cloudflare Pages deployment

## Git integration

Cloudflare dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository.

Repository:
armanyaempire-sketch/foodsupplycrisis

Production branch:
main

Framework preset:
Astro

Build command:
npm run build

Build output directory:
dist

No Cloudflare adapter is required because this project is a static Astro site.

## Environment variables

Optional:

PUBLIC_GA_ID
PUBLIC_GOOGLE_SITE_VERIFICATION
PUBLIC_BING_SITE_VERIFICATION

Add these in Cloudflare Pages project settings, not in committed source.

## First deployment checks

After deployment verify:

- homepage returns 200
- /robots.txt returns 200
- /sitemap-index.xml returns 200
- /rss.xml returns 200
- /global-food-crisis/ returns 200
- /food-prices/ returns 200
- /food-supply/ returns 200
- /countries/ returns 200
- /solutions/ returns 200
- /articles/global-food-crisis-2026/ returns 200
- canonical host is the production domain
- preview/staging URLs are not submitted to Search Console
- mobile navigation and article layout work correctly

## Domain

Set the production custom domain after the content foundation is ready. Update SITE.url and robots.txt to the final canonical domain before submitting the sitemap to Google Search Console.
