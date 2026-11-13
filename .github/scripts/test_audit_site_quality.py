import unittest

from audit_site_quality import (
    blocks_for_duplicate,
    blocks_for_unique_word_count,
    has_global_render_change,
    page_is_changed,
    should_block_external_source,
    should_block_internal_link,
    should_block_redirect_issue,
    should_block_sitemap_issue,
    split_repeated_appendices,
    unique_word_band,
)



class IncrementalGateTests(unittest.TestCase):
    def test_untouched_baseline_internal_link_does_not_block_unrelated_pr(self):
        changed_paths = {
            "src/data/articles/black-sea-food-crisis-2026.md",
            "public/_redirects",
            "public/sitemap.xml",
        }
        changed_slugs = {"black-sea-food-crisis-2026"}
        self.assertFalse(should_block_internal_link(
            "/articles/food-collapse-fact-check-2026/",
            "/categories/food-shortages/",
            changed_paths,
            changed_slugs,
            set(),
        ))

    def test_internal_link_in_changed_article_blocks(self):
        self.assertTrue(should_block_internal_link(
            "/articles/black-sea-food-crisis-2026/",
            "/articles/global-food-crisis-2026/",
            {"src/data/articles/black-sea-food-crisis-2026.md"},
            {"black-sea-food-crisis-2026"},
            set(),
        ))

    def test_link_to_newly_redirected_path_blocks(self):
        self.assertTrue(should_block_internal_link(
            "/articles/unchanged-article/",
            "/articles/retired-article/",
            {"public/_redirects"},
            set(),
            {"/articles/retired-article"},
        ))

    def test_broken_source_in_untouched_article_is_baseline(self):
        self.assertFalse(should_block_external_source(
            {"/articles/germany-harvest-drought-food-prices-2026/"},
            {"src/data/articles/black-sea-food-crisis-2026.md"},
            {"black-sea-food-crisis-2026"},
        ))

    def test_broken_source_in_changed_article_blocks(self):
        self.assertTrue(should_block_external_source(
            {"/articles/black-sea-food-crisis-2026/"},
            {"src/data/articles/black-sea-food-crisis-2026.md"},
            {"black-sea-food-crisis-2026"},
        ))

    def test_shared_layout_change_rechecks_all_pages(self):
        changed_paths = {"src/layouts/BaseLayout.astro"}
        self.assertTrue(has_global_render_change(changed_paths))
        self.assertTrue(page_is_changed(
            "/articles/untouched-article/",
            changed_paths,
            set(),
            global_render_changed=has_global_render_change(changed_paths),
        ))

    def test_sitemap_and_redirect_findings_require_relevant_changed_inputs(self):
        self.assertFalse(should_block_sitemap_issue({"src/data/articles/example.md"}))
        self.assertTrue(should_block_sitemap_issue({"public/sitemap.xml"}))
        self.assertFalse(should_block_redirect_issue(
            "/old-untouched-path/", "/target/", set(), {"src/data/articles/example.md"}, set()
        ))
        self.assertTrue(should_block_redirect_issue(
            "/old-new-path/", "/target/", {"/old-new-path"}, {"public/_redirects"}, set()
        ))


class AppendixStrippingTests(unittest.TestCase):
    def test_strips_generic_appendices_but_keeps_article_core(self):
        body = """## Core analysis
This is the original country-specific argument.
## Practical response: what to do if conditions worsen
This generic appendix should be removed from the core count.
## What to store correctly
More repeated pantry boilerplate belongs in this appendix.
## A practical seven-day implementation plan
The generic seven-day plan should not inflate the core.
## Bottom line
The country-specific conclusion remains in the core.
"""
        core, appendix, headings = split_repeated_appendices(body, "sample-country")
        self.assertIn("original country-specific argument", core)
        self.assertIn("country-specific conclusion", core)
        self.assertNotIn("generic appendix should be removed", core)
        self.assertNotIn("generic seven-day plan", core)
        self.assertIn("generic appendix should be removed", appendix)
        self.assertEqual(len(headings), 3)

    def test_canonical_pantry_guide_keeps_practical_sections(self):
        body = """## What not to do
This is useful pantry-specific guidance.
"""
        core, appendix, headings = split_repeated_appendices(
            body, "best-non-perishable-foods-30-day-emergency-pantry"
        )
        self.assertEqual(core, body)
        self.assertEqual(appendix, "")
        self.assertEqual(headings, [])

    def test_unique_word_triage_bands(self):
        self.assertEqual(unique_word_band(699), "MERGE / REDIRECT CANDIDATE")
        self.assertEqual(unique_word_band(700), "EXPAND OR REVIEW MERGE")
        self.assertIn("KEEP CANDIDATE", unique_word_band(1201))

    def test_reintroduced_duplicate_appendix_blocks_changed_article(self):
        owners = ["country-a", "country-b"]
        self.assertTrue(blocks_for_duplicate(owners, {"country-b"}))
        self.assertFalse(blocks_for_duplicate(owners, set()))
        self.assertFalse(blocks_for_duplicate(owners, {"unrelated-article"}))

    def test_broken_core_word_count_blocks_changed_article(self):
        # Regression fixture: a deliberately under-length changed article.
        # The PR gate must reject it; unchanged baseline debt remains report-only.
        self.assertTrue(blocks_for_unique_word_count(699, article_changed=True))
        self.assertFalse(blocks_for_unique_word_count(699, article_changed=False))
        self.assertFalse(blocks_for_unique_word_count(700, article_changed=True))


if __name__ == "__main__":
    unittest.main()
