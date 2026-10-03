# Monetization and Measurement Plan

## Launch phase

Use:

- Adsterra
- Google Analytics 4
- Google Search Console

The site remains static and ad scripts are inserted only through dedicated components.

## Ad placement strategy

Initial reserved placements:

- top horizontal article placement
- desktop right-rail native placement
- optional in-content placement after a meaningful content block

Do not fill every available area with ads.

The article template reserves space for ads so inserting the final Adsterra snippet does not cause large layout shifts.

## Adsterra implementation

When the final Adsterra snippets are supplied, place them in the ad component rather than copying code into 30 individual articles.

Required properties for every slot:

- stable slot name
- desktop/mobile behavior
- reserved minimum height
- accessible label
- no deceptive similarity to navigation
- no placement that blocks primary content

## AdSense migration

Before adding AdSense:

- finalize privacy/cookie disclosure
- finalize contact information
- finalize ownership/author information
- ensure source and editorial pages are complete
- remove placeholder ad components
- audit intrusive ad behavior
- verify no empty or thin pages are indexed
- check mobile usability and Core Web Vitals

The architecture is intentionally independent of any single ad provider.

## Analytics events

Initial GA4 focus:

- page_view
- article_view
- outbound_source_click
- internal_article_click
- ad-slot visibility events only where implementation is privacy/policy compliant

Keep analytics lightweight and avoid unnecessary client JavaScript.

## Search Console metrics

Monitor:

- indexed pages
- impressions
- clicks
- CTR
- average position
- query growth
- page indexing errors
- canonical issues
- sitemap status

Do not change article titles merely because of short-term fluctuations. Use query/page evidence and test only when there is a clear search-intent mismatch.

## Revenue-quality rule

Traffic is not the only KPI.

Track:

- organic landing sessions
- engaged sessions
- article depth
- returning users
- source/article clicks
- ad viewability
- page performance
- revenue per session

The primary content objective is long-term search visibility and reader trust.
