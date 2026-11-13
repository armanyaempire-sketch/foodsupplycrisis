#!/usr/bin/env python3
"""Read-only editorial/site-quality audit for the generated Astro site."""
from __future__ import annotations

import argparse
import concurrent.futures
import html
from html.parser import HTMLParser
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path.cwd()
DIST = ROOT / "dist"
ARTICLE_DIR = ROOT / "src" / "data" / "articles"
REDIRECTS_FILE = ROOT / "public" / "_redirects"
SITEMAP_FILE = DIST / "sitemap.xml"
REPORT_FILE = ROOT / "quality-audit-report.md"
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*")
UPDATE_RE = re.compile(r"(?im)^\s*>\s*(?:\*\*)?update\b|^\s*#{1,4}\s+update\b")
FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n(.*)\Z", re.S)
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
             "link", "meta", "param", "source", "track", "wbr"}


def norm_path(path: str) -> str:
    path = urllib.parse.unquote(path or "/")
    if not path.startswith("/"):
        path = "/" + path
    path = re.sub(r"/+", "/", path)
    if path != "/" and not path.endswith("/"):
        path += "/"
    return path


def path_key(path: str) -> str:
    path = norm_path(path)
    return path if path == "/" else path.rstrip("/")


def markdown_plain(text: str) -> str:
    fence = re.escape(chr(96) * 3)
    text = re.sub(r"(?s)" + fence + r".*?" + fence, " ", text)
    text = re.sub(r"(?s)~~~.*?~~~", " ", text)
    text = re.sub(r"<!--.*?-->", " ", text)
    text = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r" \1 ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r" \1 ", text)
    text = re.sub(r"<https?://[^>]+>", " ", text)
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"(?m)^\s{0,3}#{1,6}\s*", "", text)
    text = re.sub(r"(?m)^\s*>\s?", "", text)
    text = re.sub(r"(?m)^\s*[-*+]\s+", "", text)
    text = re.sub(r"(?m)^\s*\d+[.)]\s+", "", text)
    text = re.sub(r"(?m)^\s*\|?[\s:|-]+\|?\s*$", " ", text)
    text = text.replace(chr(96), "").replace("*", "").replace("_", "").replace("~", "")
    return html.unescape(text)


def read_article(path: Path) -> tuple[str, str, str | None]:
    raw = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(raw)
    if match:
        frontmatter, body = match.group(1), match.group(2)
    else:
        frontmatter, body = "", raw
    updated_match = re.search(r"(?m)^updatedDate\s*:\s*(.*?)\s*$", frontmatter)
    updated_date = updated_match.group(1).strip().strip("\"'") if updated_match else None
    return frontmatter, body, updated_date


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, set[str]]] = []
        self.canonicals: list[str] = []
        self.robots: list[str] = []
        self.adsense_meta = False
        self.links: list[tuple[str, bool]] = []

    def _source_context(self) -> bool:
        return any("source-box-primary" in classes for _, classes in self.stack)

    def handle_starttag(self, tag: str, attrs) -> None:
        data = {k.lower(): (v or "") for k, v in attrs}
        classes = set(data.get("class", "").split())
        if tag == "meta":
            name = data.get("name", "").strip().lower()
            if name == "google-adsense-account" and data.get("content", "").strip():
                self.adsense_meta = True
            if name in {"robots", "googlebot"}:
                self.robots.append(data.get("content", ""))
        elif tag == "link":
            rel = {part.lower() for part in data.get("rel", "").split()}
            if "canonical" in rel and data.get("href"):
                self.canonicals.append(data["href"].strip())
        elif tag == "a" and data.get("href"):
            self.links.append((data["href"].strip(), self._source_context()))
        if tag not in VOID_TAGS:
            self.stack.append((tag, classes))

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break


def page_path_from_file(file_path: Path) -> str:
    relative = file_path.relative_to(DIST).as_posix()
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[:-len("index.html")]
    return "/" + relative


def file_for_url_path(url_path: str) -> Path | None:
    path = urllib.parse.unquote(url_path or "/")
    if not path.startswith("/"):
        path = "/" + path
    relative = path.lstrip("/")
    candidates: list[Path] = []
    if not relative:
        candidates.append(DIST / "index.html")
    else:
        exact = DIST / relative
        candidates.append(exact)
        candidates.append(exact / "index.html")
        if not Path(relative).suffix:
            candidates.append(DIST / (relative + ".html"))
    for candidate in candidates:
        try:
            candidate.resolve().relative_to(DIST.resolve())
        except ValueError:
            continue
        if candidate.is_file():
            return candidate
    return None


def load_redirects() -> dict[str, tuple[str, str]]:
    redirects: dict[str, tuple[str, str]] = {}
    if not REDIRECTS_FILE.exists():
        return redirects
    for line in REDIRECTS_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 3:
            continue
        source, target, status = parts[0], parts[1], parts[2]
        if "*" in source or ":" in source:
            continue
        redirects[path_key(source)] = (target, status)
    return redirects


def http_status(url: str) -> tuple[int | None, str, str | None]:
    headers = {"User-Agent": "FoodSupplyCrisis-EditorialAudit/1.0"}
    request = urllib.request.Request(url, headers=headers, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, response.geturl(), None
    except urllib.error.HTTPError as error:
        status, final_url = error.code, error.geturl()
        if status in {403, 405, 501}:
            try:
                get_request = urllib.request.Request(
                    url, headers={**headers, "Range": "bytes=0-0"}, method="GET"
                )
                with urllib.request.urlopen(get_request, timeout=15) as response:
                    return response.status, response.geturl(), None
            except urllib.error.HTTPError as get_error:
                return get_error.code, get_error.geturl(), None
            except Exception as get_error:
                return None, final_url, str(get_error)
        return status, final_url, None
    except Exception as error:
        return None, url, str(error)


def write_github_output(has_findings: bool, hard_count: int, warning_count: int) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if output_path:
        with open(output_path, "a", encoding="utf-8") as output:
            output.write(f"has_findings={'true' if has_findings else 'false'}\n")
            output.write(f"hard_errors={hard_count}\n")
            output.write(f"warnings={warning_count}\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fail-on-findings", action="store_true",
                        help="Return non-zero when any blocking audit finding exists.")
    parser.add_argument("--min-words", type=int, default=800,
                        help="Word-count threshold for review warnings (default: 800).")
    args = parser.parse_args()

    failures: list[str] = []
    warnings: list[str] = []
    info: list[str] = []

    def fail(message: str) -> None:
        failures.append(message)

    def warn(message: str) -> None:
        warnings.append(message)

    if not DIST.is_dir():
        print("ERROR: dist/ does not exist. Run npm run build first.", file=sys.stderr)
        return 2
    if not SITEMAP_FILE.is_file():
        fail("Built sitemap is missing: dist/sitemap.xml")

    redirects = load_redirects()
    redirect_targets = {key: value[0] for key, value in redirects.items()}
    page_files = sorted(p for p in DIST.rglob("*.html") if p.name != "404.html")
    page_info: dict[str, dict] = {}
    all_internal_links: list[tuple[str, str]] = []
    source_urls: set[str] = set()

    for file_path in page_files:
        page_path = norm_path(page_path_from_file(file_path))
        page_parser = PageParser()
        try:
            page_parser.feed(file_path.read_text(encoding="utf-8", errors="replace"))
        except Exception as error:
            fail(f"Could not parse built page {page_path}: {error}")
            continue

        if not page_parser.canonicals:
            fail(f"Missing canonical tag: {page_path}")
        elif len(set(page_parser.canonicals)) > 1:
            fail(f"Conflicting canonical tags: {page_path}")
        if not page_parser.adsense_meta:
            fail(f"Missing Google AdSense account meta tag: {page_path}")

        robots = ",".join(page_parser.robots).lower()
        is_noindex = any(token.strip() == "noindex" for token in robots.split(","))
        page_info[page_path] = {
            "file": file_path,
            "noindex": is_noindex,
            "canonical": page_parser.canonicals[0] if page_parser.canonicals else None,
        }
        for href, in_source_box in page_parser.links:
            all_internal_links.append((page_path, href))
            if in_source_box:
                absolute = urllib.parse.urljoin("https://foodsupplycrisis.pages.dev/", href)
                parsed = urllib.parse.urlsplit(absolute)
                if parsed.scheme in {"http", "https"} and parsed.netloc:
                    source_urls.add(urllib.parse.urlunsplit(
                        (parsed.scheme, parsed.netloc, parsed.path, parsed.query, "")
                    ))

    sitemap_paths: set[str] = set()
    sitemap_origin = "https://foodsupplycrisis.pages.dev"
    if SITEMAP_FILE.is_file():
        try:
            root = ET.parse(SITEMAP_FILE).getroot()
            locs = [element.text.strip() for element in root.iter()
                    if element.tag.lower().endswith("loc") and element.text and element.text.strip()]
            if locs:
                first = urllib.parse.urlsplit(locs[0])
                sitemap_origin = f"{first.scheme}://{first.netloc}"
            for loc in locs:
                parsed = urllib.parse.urlsplit(loc)
                url_path = norm_path(parsed.path or "/")
                key = path_key(url_path)
                if key in sitemap_paths:
                    fail(f"Duplicate sitemap entry: {loc}")
                sitemap_paths.add(key)
                if key in redirects:
                    fail(f"Sitemap contains redirected URL: {loc} -> {redirect_targets[key]}")
                target_file = file_for_url_path(url_path)
                if target_file is None:
                    fail(f"Sitemap URL has no built page: {loc}")
                    continue
                built_path = norm_path(page_path_from_file(target_file)) if target_file.suffix == ".html" else None
                if built_path in page_info and page_info[built_path]["noindex"]:
                    fail(f"Sitemap contains noindexed page: {loc}")
        except Exception as error:
            fail(f"Could not parse built sitemap: {error}")

    for page_path, details in sorted(page_info.items()):
        if not details["noindex"] and path_key(page_path) not in sitemap_paths:
            fail(f"Built indexable page missing from sitemap: {page_path}")

    for source_key, (target, status) in sorted(redirects.items()):
        if source_key in sitemap_paths:
            fail(f"Redirect source appears in sitemap: {source_key}")
        if path_key(target) in redirects:
            fail(f"Redirect target is itself redirected: {source_key} -> {target}")
        if file_for_url_path(target) is None:
            fail(f"Redirect target is missing from built output: {source_key} -> {target}")
        if status not in {"301", "302", "303", "307", "308"}:
            warn(f"Unrecognized redirect status {status}: {source_key} -> {target}")

    for source_page, href in all_internal_links:
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
            continue
        resolved = urllib.parse.urljoin(source_page, href)
        absolute = urllib.parse.urljoin(sitemap_origin + "/", resolved)
        parsed = urllib.parse.urlsplit(absolute)
        if parsed.scheme not in {"http", "https"} or parsed.netloc.lower() != urllib.parse.urlsplit(sitemap_origin).netloc.lower():
            continue
        target_path = norm_path(parsed.path or "/")
        key = path_key(target_path)
        if key in redirects:
            fail(f"Internal link points to redirected URL: {source_page} -> {target_path} -> {redirect_targets[key]}")
            continue
        if file_for_url_path(target_path) is None:
            fail(f"Broken internal link: {source_page} -> {href}")

    article_files = sorted(ARTICLE_DIR.glob("*.md")) if ARTICLE_DIR.is_dir() else []
    word_counts: list[tuple[str, int, str, str]] = []
    paragraph_owners: dict[str, set[str]] = {}
    shingle_owners: dict[str, set[str]] = {}

    for article_path in article_files:
        _, body, updated_date = read_article(article_path)
        plain = markdown_plain(body)
        count = len(WORD_RE.findall(plain))
        slug = article_path.stem
        has_update_note = bool(UPDATE_RE.search(body))
        note_status = "yes" if has_update_note else ("missing" if updated_date else "not marked updated")
        word_counts.append((slug, count, note_status, updated_date or "—"))

        if count < args.min_words:
            warn(f"Short article for editorial review ({count} words, threshold {args.min_words}): {slug}")
        if updated_date and not has_update_note:
            fail(f"Article has updatedDate but no visible explanatory update note: {slug} (updatedDate: {updated_date})")
        elif not has_update_note:
            info.append(f"{slug}: no visible update note; no updatedDate is recorded.")

        for paragraph in re.split(r"\n\s*\n", body):
            cleaned = markdown_plain(paragraph)
            normalized = " ".join(token.lower() for token in WORD_RE.findall(cleaned))
            if not normalized:
                continue
            paragraph_owners.setdefault(normalized, set()).add(slug)
            words = normalized.split()
            if len(words) >= 40:
                for index in range(len(words) - 39):
                    shingle_owners.setdefault(" ".join(words[index:index + 40]), set()).add(slug)

    duplicate_paragraphs = [
        (value, sorted(owners)) for value, owners in paragraph_owners.items()
        if len(owners) > 1 and len(value.split()) >= 8
    ]
    for value, owners in duplicate_paragraphs:
        fail(f"Duplicate paragraph across articles ({', '.join(owners)}): {value[:220]}")

    duplicate_40grams = [
        (phrase, sorted(owners)) for phrase, owners in shingle_owners.items()
        if len(owners) > 1
    ]
    pair_samples: dict[tuple[str, str], list[str]] = {}
    for phrase, owners in duplicate_40grams:
        for left_index in range(len(owners)):
            for right_index in range(left_index + 1, len(owners)):
                pair = (owners[left_index], owners[right_index])
                samples = pair_samples.setdefault(pair, [])
                if len(samples) < 3 and phrase not in samples:
                    samples.append(phrase)
    for pair, samples in sorted(pair_samples.items()):
        fail(f"Repeated 40+ word sequence between {pair[0]} and {pair[1]}: {samples[0][:220]}")

    checked_sources: list[tuple[str, int | None, str, str | None]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(http_status, url): url for url in sorted(source_urls)}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            try:
                status, final_url, error = future.result()
            except Exception as exception:
                status, final_url, error = None, url, str(exception)
            checked_sources.append((url, status, final_url, error))
            if status in {404, 410}:
                fail(f"External source link returns HTTP {status}: {url} (final URL: {final_url})")
            elif status is None:
                warn(f"Could not verify external source link (network/server error): {url} ({error})")
            elif status >= 500:
                warn(f"External source server returned HTTP {status}; retry manually: {url}")

    lines: list[str] = [
        "# Food Supply Crisis — Editorial Quality Audit", "",
        f"- Built pages checked: {len(page_info)}",
        f"- Sitemap URLs checked: {len(sitemap_paths)}",
        f"- Internal links checked: {len(all_internal_links)}",
        f"- Redirect rules checked: {len(redirects)}",
        f"- Article files checked: {len(article_files)}",
        f"- Unique external source URLs checked: {len(source_urls)}",
        f"- Blocking findings: {len(failures)}",
        f"- Review warnings: {len(warnings)}", "",
        "## Blocking findings", ""
    ]
    lines.extend([f"- {item}" for item in failures] or ["- None."])
    lines.extend(["", "## Review warnings", ""])
    lines.extend([f"- {item}" for item in warnings] or ["- None."])
    lines.extend(["", "## Article word counts and update notes", "",
                  "| Article | Words | Visible update note | updatedDate |",
                  "|---|---:|---|---|"])
    for slug, count, note_status, updated_date in word_counts:
        lines.append(f"| {slug} | {count} | {note_status} | {updated_date} |")
    lines.extend(["", "## Informational update-note inventory", ""])
    lines.extend([f"- {item}" for item in info[:80]] or ["- All articles have a visible update note."])
    if len(info) > 80:
        lines.append(f"- …and {len(info) - 80} more.")
    lines.extend(["", "## External source-link check", "",
                  f"Checked {len(checked_sources)} unique source URLs. Definite 404/410 responses are blocking; temporary network errors and 5xx responses are warnings.",
                  "", "## Safety", "",
                  "This audit is report-only. It does not edit articles, commit code, push branches, or merge pull requests."])
    report = "\n".join(lines) + "\n"
    REPORT_FILE.write_text(report, encoding="utf-8")

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as summary:
            summary.write(report)
    write_github_output(bool(failures or warnings), len(failures), len(warnings))
    print(report)

    if args.fail_on_findings and failures:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
