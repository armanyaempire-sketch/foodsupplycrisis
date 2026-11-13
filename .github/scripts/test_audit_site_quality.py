import unittest

from audit_site_quality import (
    blocks_for_unique_word_count,
    split_repeated_appendices,
    unique_word_band,
)


class AppendixStrippingTests(unittest.TestCase):
    def test_strips_generic_appendices_but_keeps_article_core(self):
        body = """## Core analysis
This is the original country-specific argument.
## Practical response: what to do if conditions worsen
This generic appendix should be removed from the core count.
## What to store correctly
More repeated pantry boilerplate belongs in this appendix.
## Bottom line
The country-specific conclusion remains in the core.
"""
        core, appendix, headings = split_repeated_appendices(body, "sample-country")
        self.assertIn("original country-specific argument", core)
        self.assertIn("country-specific conclusion", core)
        self.assertNotIn("generic appendix should be removed", core)
        self.assertIn("generic appendix should be removed", appendix)
        self.assertEqual(len(headings), 2)

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

    def test_broken_core_word_count_blocks_changed_article(self):
        # Regression fixture: a deliberately under-length changed article.
        # The PR gate must reject it; unchanged baseline debt remains report-only.
        self.assertTrue(blocks_for_unique_word_count(699, article_changed=True))
        self.assertFalse(blocks_for_unique_word_count(699, article_changed=False))
        self.assertFalse(blocks_for_unique_word_count(700, article_changed=True))


if __name__ == "__main__":
    unittest.main()
