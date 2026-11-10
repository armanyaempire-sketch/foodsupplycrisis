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

const readField = (lines, name) => {
  const line = lines.find((item) => item.startsWith(name + ":"));
  if (!line) return "";
  const raw = line.slice(name.length + 1).trim();
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); } catch { return raw.slice(1, -1); }
  }
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replace(/''/g, "'");
  return raw;
};

const rememberUnique = (kind, value, file) => {
  const normalized = value.trim().toLowerCase().replace(/ +/g, " ");
  if (!normalized) return;
  const previous = seen[kind].get(normalized);
  if (previous) failures.push(`${file}: duplicate ${kind} also used by ${previous}`);
  else seen[kind].set(normalized, file);
};

const normalizeParagraph = (paragraph) =>
  paragraph.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const longParagraphs = new Map();
const knownLowValueBoilerplate = [
  "use the evidence in this article to judge whether the risk is real and local",
  "prepare proportionately secure water keep a modest rotating food buffer protect refrigeration",
  "the most successful pantry is therefore one that can be consumed normally replenished gradually"
];
const knownLowValueBoilerplate = [
  "use the evidence in this article to judge whether the risk is real and local",
  "prepare proportionately secure water keep a modest rotating food buffer protect refrigeration",
  "the most successful pantry is therefore one that can be consumed normally replenished gradually"
];
const allowedIntents = new Set(["informational", "how-to", "comparison", "analysis", "reference"]);

for (const file of articleFiles) {
  const fullPath = join(articleDirectory, file);
  const content = await readFile(fullPath, "utf8");
  const firstDivider = content.indexOf("---");
  const secondDivider = content.indexOf("\n---", firstDivider + 3);

  if (firstDivider !== 0 || secondDivider < 0) {
    failures.push(`${file}: missing YAML frontmatter`);
    continue;
  }

  const metadata = content.slice(firstDivider + 3, secondDivider);
  const lines = metadata.split("\n").map((line) => line.trimEnd());
  const title = readField(lines, "title");
  const seoTitle = readField(lines, "seoTitle");
  const description = readField(lines, "description");
  const primaryKeyword = readField(lines, "primaryKeyword");
  const searchIntent = readField(lines, "searchIntent");
  const updatedDate = readField(lines, "updatedDate");

  const keywordStart = lines.findIndex((line) => line.trim() === "keywords:");
  let keywordCount = 0;
  if (keywordStart >= 0) {
    for (let i = keywordStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 0 && !line.startsWith(" ") && line.includes(":")) break;
      if (line.trimStart().startsWith("- ")) keywordCount++;
    }
  }

  const hasSources = lines.some((line) => line.trim() === "sources:");
  const hasSourceUrl = lines.some((line) => {
    const value = line.trim().startsWith("url:") ? line.trim().slice(4).trim() : "";
    return value.startsWith("https://") || value.startsWith('"https://') || value.startsWith("http://") || value.startsWith('"http://');
  });

  if (!title) failures.push(`${file}: missing title`);
  if (!seoTitle) failures.push(`${file}: missing SEO title`);
  if (seoTitle.length > 70) failures.push(`${file}: SEO title is ${seoTitle.length} characters; keep it at or below 70`);
  if (!description || description.length < 80 || description.length > 180) {
    failures.push(`${file}: meta description must be 80–180 characters`);
  }
  if (!primaryKeyword) failures.push(`${file}: missing one primary keyword`);
  if (!allowedIntents.has(searchIntent)) failures.push(`${file}: missing or invalid searchIntent`);
  if (!updatedDate) failures.push(`${file}: missing material updatedDate`);
  if (!hasSources || !hasSourceUrl) failures.push(`${file}: add at least one direct HTTP(S) source URL`);
  if (keywordCount < 3 || keywordCount > 15) failures.push(`${file}: include 3–15 secondary keywords`);

  rememberUnique("title", title, file);
  rememberUnique("seoTitle", seoTitle, file);
  rememberUnique("description", description, file);
  rememberUnique("primaryKeyword", primaryKeyword, file);

  const body = content.slice(secondDivider + 4);
  if (body.includes("\\\\n")) {
    failures.push(`${file}: contains a literal escaped newline; use real Markdown line breaks`);
  }

  const normalizedBody = normalizeParagraph(body);
  for (const phrase of knownLowValueBoilerplate) {
    if (normalizedBody.includes(phrase)) {
      failures.push(`${file}: remove repeated generic boilerplate; write a conclusion specific to this article's subject`);
      break;
    }
  }

  const normalizedBody = normalizeParagraph(body);
  for (const phrase of knownLowValueBoilerplate) {
    if (normalizedBody.includes(phrase)) {
      failures.push(`${file}: remove repeated generic boilerplate; write a conclusion specific to this article's subject`);
      break;
    }
  }

  if (body.includes("## How to read the country risk correctly")) {
    failures.push(`${file}: repeated country-risk template heading remains`);
  }
  if (body.includes("## Practical response: what to do if conditions worsen")) {
    failures.push(`${file}: repeated generic preparedness section remains`);
  }

  for (const paragraph of body.split("\n\n")) {
    const normalized = normalizeParagraph(paragraph);
    const wordCount = normalized ? normalized.split(" ").filter(Boolean).length : 0;
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
  console.log(`Editorial SEO audit passed for ${articleFiles.length} articles: unique primary keywords, titles and descriptions; required sources; no repeated boilerplate or identical long paragraphs; known generic conclusions are blocked.`);
}
