import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const articleDirectory = fileURLToPath(new URL("../src/data/articles/", import.meta.url));
const articleFiles = (await readdir(articleDirectory)).filter((name) => name.endsWith(".md"));

if (articleFiles.length === 0) {
  throw new Error("No Markdown articles were found in src/data/articles.");
}

const failures = [];
const seen = {
  title: new Map(),
  seoTitle: new Map(),
  description: new Map(),
  primaryKeyword: new Map()
};

const field = (metadata, name) => {
  const match = metadata.match(new RegExp("^" + name + ":[ \\t]*(.*)$", "m"));
  if (!match) return "";
  const value = match[1].trim();
  if (value.startsWith('"')) {
    try { return JSON.parse(value); } catch { return value.slice(1, -1); }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
};

const rememberUnique = (kind, value, file) => {
  const normalized = value.trim().toLowerCase().replace(/\\s+/g, " ");
  if (!normalized) return;
  const previous = seen[kind].get(normalized);
  if (previous) {
    failures.push(`${file}: duplicate ${kind} also used by ${previous}`);
  } else {
    seen[kind].set(normalized, file);
  }
};

const normalizedParagraph = (paragraph) => paragraph
  .toLowerCase()
  .replace(/https?:\\/\\/\\S+/g, " ")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\\s+/g, " ")
  .trim();

const longParagraphs = new Map();
const repeatedHeadings = /^##\\s+(?:How to read the country risk correctly|Practical response:\\s+what to do if conditions worsen)\\s*$/im;

for (const file of articleFiles) {
  const fullPath = join(articleDirectory, file);
  const content = await readFile(fullPath, "utf8");
  const frontmatter = content.match(/^---\\s*\\n([\\s\\S]*?)\\n---/);

  if (!frontmatter) {
    failures.push(`${file}: missing YAML frontmatter`);
    continue;
  }

  const metadata = frontmatter[1];
  const title = field(metadata, "title");
  const seoTitle = field(metadata, "seoTitle");
  const description = field(metadata, "description");
  const primaryKeyword = field(metadata, "primaryKeyword");
  const searchIntent = field(metadata, "searchIntent");
  const sources = metadata.match(/^sources:[ \\t]*$/m);
  const sourceUrl = metadata.match(/^[ \\t]+url:[ \\t]*["']?https?:\\/\\//im);
  const keywordBlock = metadata.match(/^keywords:[ \\t]*\\n([\\s\\S]*?)(?=^[A-Za-z][A-Za-z0-9_]*:[ \\t]*|$)/m);
  const keywordCount = keywordBlock ? (keywordBlock[1].match(/^[ \\t]+-/gm) || []).length : 0;

  if (!title) failures.push(`${file}: missing title`);
  if (!seoTitle) failures.push(`${file}: missing SEO title`);
  if (seoTitle.length > 70) failures.push(`${file}: SEO title is ${seoTitle.length} characters; keep it at or below 70`);
  if (!description || description.length < 80 || description.length > 180) {
    failures.push(`${file}: meta description must be 80–180 characters`);
  }
  if (!primaryKeyword) failures.push(`${file}: missing one primary keyword`);
  if (!["informational", "how-to", "comparison", "analysis", "reference"].includes(searchIntent)) {
    failures.push(`${file}: missing or invalid searchIntent`);
  }
  if (!sources || !sourceUrl) failures.push(`${file}: add at least one direct HTTP(S) source URL`);
  if (keywordCount < 3 || keywordCount > 15) failures.push(`${file}: include 3–15 secondary keywords`);

  rememberUnique("title", title, file);
  rememberUnique("seoTitle", seoTitle, file);
  rememberUnique("description", description, file);
  rememberUnique("primaryKeyword", primaryKeyword, file);

  if (repeatedHeadings.test(content)) {
    failures.push(`${file}: remove a repeated generic editorial section and replace it with topic-specific analysis`);
  }

  const body = content.replace(/^---\\s*\\n[\\s\\S]*?\\n---/, "");
  const paragraphs = body.split(/\\n\\s*\\n/).filter((p) => p.trim() && !p.trim().startsWith("#"));
  for (const paragraph of paragraphs) {
    const normalized = normalizedParagraph(paragraph);
    const wordCount = normalized ? normalized.split(" ").length : 0;
    if (wordCount < 50) continue;
    const previous = longParagraphs.get(normalized);
    if (previous && previous !== file) {
      failures.push(`${file}: contains a repeated long paragraph also found in ${previous}`);
    } else {
      longParagraphs.set(normalized, file);
    }
  }
}

if (failures.length > 0) {
  console.error("Editorial SEO audit failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Editorial SEO audit passed for ${articleFiles.length} articles: unique primary keywords, titles and descriptions; required sources; no repeated boilerplate or identical long paragraphs.`);
}
