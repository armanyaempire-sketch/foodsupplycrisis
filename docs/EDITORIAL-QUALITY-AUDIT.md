# Editorial quality audit and corrective actions

Updated: 10 November 2026

This document records a structural review of the 49 Markdown articles in `src/data/articles/` and the quality improvements applied on the `adsense-low-value-content` branch. It is an internal editorial record, not a claim that Google has approved the site.

## What was reviewed

The review checked article length, heading structure, source metadata, topic-specific sections, endings and repeated household-preparedness material. The 49 article bodies ranged from roughly 900 words to more than 4,400 words. Word count was used only to identify unusually short or sprawling pages; it was not used as a quality score or a target.

Google explicitly says there is no preferred word count. Its guidance emphasizes original information or analysis, completeness relative to the reader's question, useful insight beyond a summary, accuracy, clear sourcing and a satisfying user experience. The editorial objective is therefore to make each page useful for its actual purpose—not to make every page longer.

## Problems found and corrected

### Repeated generic conclusions

Six articles ended with the same generic emergency-preparedness paragraph even though their subjects were different:

- Pakistan wheat and flour supply
- Philippines water and rice production
- Russia–Ukraine grain exports
- Southeast Asian rice prices
- Strait of Hormuz fertilizer and shipping exposure
- Sudan acute food insecurity

Those conclusions have been replaced with topic-specific analytical tests. They now explain which data to compare, which geography and time period matter, and what evidence would support or weaken the article's central claim.

### A macro-analysis article had drifted into a second pantry guide

The JPMorgan 2027 scenario article contained a lengthy household stockpiling checklist, a seven-day pantry plan and repeated household-storage FAQs. Much of that material duplicated the site's dedicated pantry and safe-water guides. The broad checklist has been removed and replaced with a short explanation of why a global inflation scenario is not a direct household grocery forecast, plus links to the dedicated practical guides.

The article's market context was also refreshed with FAO's 6 November 2026 release: the Food Price Index averaged 133.9 points in October, 1.2% below September and 5.9% above October 2025. The September 2026 value is now labelled as an earlier baseline rather than the latest release.

### Markdown rendering and formatting errors

A repository-wide source check found 47 of the 49 article files contained two literal escaped newline sequences in an appended analytical paragraph. These were replaced with actual Markdown line breaks so the text renders as separate paragraphs rather than displaying escape characters. The editorial audit now fails if a future article body contains a literal escaped newline sequence.

### Time-sensitive data and primary-source corrections

- The evergreen global food-price explainer now uses FAO's October 2026 index (published 6 November 2026) as the latest reading, and retains the September report as historical context. The source names and URLs now match the release dates.
- The UK food-shortage article was rebuilt around the official Be Ready emergency campaign and Defra's 2025 food-origin, import and household-affordability statistics. It distinguishes emergency continuity advice from evidence of a national food shortage, and explains the definitions and limits of the reported measures.
- The long JPMorgan 2027 scenario article now focuses on the actual conditional inflation scenario rather than repeating the site's household pantry instructions. Household advice points to the dedicated storage guides.

### Country-specific primary data added

Several country pages were strengthened with dated official data rather than generic descriptions of exposure:

- **United Kingdom:** rebuilt around the official Be Ready campaign and Defra's 2025 food-origin, import-value and household-affordability figures. The page explains why the food-origin share and production-to-supply ratio are different measures.
- **India:** added RBI's 2025–26 foodgrain production estimates and March 2026 FCI buffer comparison; the 6 November 2026 OMSS rice-sale target and weekly rice/paddy stock disclosures; and the latest published September 2026 Consumer Food Price Index. Dates and definitions are stated so figures are not misrepresented as a single live stock total.
- **Brazil:** added Conab's first 2026/27 crop survey with total grain, soybean, maize, rice and wheat estimates, showing why a strong aggregate crop forecast can coexist with lower projections for specific crops.
- **China:** added National Bureau of Statistics measurements for 2026 summer grain area, yield, total output and wheat output, and distinguished the October interim autumn-harvest outlook from a final result.
- **Global food-price explainer:** refreshed the current baseline to FAO's October 2026 index (133.9 points, −1.2% month on month and +5.9% year on year) while preserving the separate September snapshot as historical coverage.

### Reader-facing source transparency

Every article's source box now links to the Editorial Policy, which explains the source hierarchy, how forecasts and uncertainty are described, the publication byline, the possible use of AI-assisted tools, material updates and corrections.

## Automated regression protection

The editorial content audit now rejects several known generic conclusion patterns that were identified during this review. The existing checks for repeated long paragraphs, unique titles, unique descriptions, unique primary keywords and source metadata remain in place.

The automated check now also detects literal escaped-newline artifacts and the known generic conclusions found during this audit. It is a guardrail, not a substitute for editorial judgment. It does not decide whether a statistic is correct, whether a source truly supports a claim, or whether a page is sufficiently useful to a reader. Those checks require review of the original source and the article's subject.

## Standard for future articles and updates

Before publishing or materially updating an article, editors should be able to answer these questions:

1. What exact reader question does this page answer, and why does it deserve a separate page?
2. Which primary sources directly support its important factual claims?
3. What is original here: a comparison, worked example, calculation, explanation of a mechanism, decision aid or a clearly stated evidence test?
4. Are observed data, estimates, forecasts and editorial interpretation clearly distinguished?
5. Does the article explain what the cited data does not show?
6. Does every section belong to this article, or should it link to a separate practical guide instead?
7. Does the conclusion add a subject-specific insight rather than repeat generic preparedness language?
8. Are publication and update dates accurate, with an update date changed only after a material edit?

Do not add paragraphs merely to reach a word count. Do not repeat a keyword unnaturally. Do not create a country or product shortage list unless an authoritative source supports the geography, period and meaning of the claim. Where the evidence is incomplete, say so.

## Remaining review requirement

The branch should receive a fresh editorial audit, Astro production build and Cloudflare Pages preview check after the latest commits. Important factual claims should also be checked against the current original source before the article is treated as ready for a new AdSense review.

Google makes the final AdSense eligibility decision. These changes address identified content-quality problems but cannot guarantee approval.
