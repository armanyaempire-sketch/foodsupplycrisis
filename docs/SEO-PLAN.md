# Food Supply Crisis Report — SEO Operating Plan

## Primary goal

Build an evidence-led global food-supply publication that can attract organic traffic across:

- global food crisis
- food supply
- food prices
- food shortages
- food security
- stockpiling and food storage
- climate and agriculture
- water and food
- fertilizer
- shipping and trade
- country-specific food-supply risks
- practical solutions

Organic search is a distribution channel, not the editorial premise. Pages must provide original value beyond summaries of other websites.

## Search architecture

### Pillars

- /global-food-crisis/
- /food-supply/
- /food-prices/
- /food-security/
- /climate-agriculture/
- /water-food/
- /fertilizer/
- /supply-chain/
- /food-storage/
- /solutions/
- /countries/

### Article URL

Use one canonical format:

/articles/<descriptive-lowercase-slug>/

Avoid dates in URL slugs unless the date is genuinely part of the entity or event.

## On-page SEO rules

Every indexable article must have:

1. One descriptive H1.
2. A unique title tag written for searchers.
3. A unique meta description.
4. A canonical URL.
5. Open Graph and Twitter metadata.
6. Published and modified dates.
7. Clear authorship.
8. Visible source links.
9. Breadcrumbs and BreadcrumbList JSON-LD.
10. Article JSON-LD.
11. At least 3 useful internal links once enough related pages exist.
12. Descriptive image alt text when images are used.
13. Short paragraphs and descriptive H2/H3 headings.
14. A useful conclusion or practical implication.
15. Clear distinction between verified data, forecast, reported event and analysis.

## Title policy

Prefer:

"India Food Supply 2026: Weak Monsoon, Rice Production Risks and Large Stocks"

Avoid:

"India Is Running Out of Food — MASSIVE CRISIS Coming"

Titles should describe the evidence rather than manufacture urgency.

## Keyword policy

Use one primary search intent per page.

Store primary and secondary keyword ideas in frontmatter for editorial planning and structured-data context, but do not stuff keywords into visible copy.

Do not create multiple articles targeting the same query unless they satisfy clearly different search intents.

## Internal linking

Use contextual links, not repetitive keyword anchors.

Preferred pattern:

Pillar → driver article → country article → solution article

Example:

Global Food Crisis
→ Fertilizer Crisis
→ India Food Supply
→ Water & Agriculture
→ Food Crisis Solutions

## Freshness and updates

News and fast-moving data pages should display:

- Published date
- Updated date when material facts change
- "Latest data" or "Current status" section where useful
- source dates

Do not change the modified date for cosmetic edits.

## Source hierarchy

Prefer:

1. FAO
2. WFP
3. IPC
4. World Bank
5. USDA / national agriculture agencies
6. NOAA / national climate agencies
7. peer-reviewed research
8. Reuters / AP for current events and field reporting

Link to the original source whenever possible.

## Indexing hygiene

Do not index:

- empty category pages
- placeholder pages
- duplicate pages
- thin tag pages
- staging/preview hostnames
- broken or incomplete country pages

Keep the staging *.pages.dev host noindexed before the production domain is established.

## Performance

The initial architecture is static Astro. Avoid server-side rendering, database requests and per-request API work for normal article delivery.

Keep JavaScript minimal.

Reserve ad space to reduce cumulative layout shift.

Use appropriately sized modern images and avoid shipping large client bundles for simple content.

## Structured data

Use:

- WebSite
- Organization
- BreadcrumbList
- Article
- NewsArticle only when the page is genuinely a news article

Structured data must describe visible page content and should be validated before launch.

## Search Console

Before launch:

- verify production domain
- submit sitemap
- inspect homepage
- inspect one category page
- inspect at least three articles
- test robots.txt
- check canonical URLs
- monitor indexing coverage

## Analytics

Use GA4 through the optional PUBLIC_GA_ID environment variable.

Do not hard-code a personal analytics ID into content files.

## Monetization compatibility

Adsterra is planned first.

Ad units must:

- remain visually distinguishable from editorial content
- reserve layout space
- avoid deceptive placement
- avoid disrupting reading
- remain removable without changing article markup

AdSense can be added later without restructuring the article template.
