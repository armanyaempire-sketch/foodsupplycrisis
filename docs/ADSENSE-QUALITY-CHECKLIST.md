# Editorial quality checklist

This is an internal publishing standard for Food Supply Crisis Report. It is not a statement that Google has approved the site.

## Before publishing or materially updating an article

- Define the reader's actual question and keep the page focused on that question.
- Use the original report, dataset, official release or research paper for material factual claims. Link to the exact document or dataset, not only an organization homepage.
- Record the release date, period covered, geography, unit, comparison period and revision status for important numbers.
- Separate observed data, official estimates, forecasts and editorial interpretation. Label scenarios as scenarios.
- Explain what the source does not establish. Do not turn price inflation into a physical shortage, a crop forecast into a confirmed harvest, or a local emergency into a global claim.
- Add analysis that is specific to the subject: calculations, comparisons, definitions, limitations, geography, methodology or practical context that a reader cannot get by reading only the headline.
- Link to genuinely complementary pages. Do not add the same generic household-preparedness section to unrelated articles.
- Use an honest byline and disclose the publication's use of research or AI-assisted tools where appropriate. Do not invent professional credentials or firsthand reporting.
- Set an updated date only after a material change to evidence, analysis or interpretation.
- Check facts, dates, internal links, source URLs, title, description, mobile readability and the rendered page before publication.

## Sitewide standards

- Prefer fewer useful pages over many near-duplicates aimed at similar search terms.
- Consolidate, redirect, noindex or remove pages that do not add distinct value; do not retain a page only because it already has a URL.
- Keep topic hubs useful in their own right, with definitions, current evidence, source links and clear paths into the most relevant coverage.
- Make tools explain their assumptions and limitations. A scenario calculator must not be presented as an official forecast.
- Keep ads visually separate from content and never make an ad look like a navigation or download control.
- Review the source directory, correction process, navigation and legal disclosures when the site changes.

## Pre-release checks

Run `npm run audit:content` and `npm run build`. Review the generated pages on desktop and mobile. After deployment, confirm canonical URLs, sitemap entries, internal links and that no blocked or empty route is being advertised as a content page.

Google makes the final AdSense eligibility decision. Passing this checklist or the automated audit does not guarantee approval.
