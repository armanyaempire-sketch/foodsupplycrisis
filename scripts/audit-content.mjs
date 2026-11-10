import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const articleDirectory = fileURLToPath(new URL("../src/data/articles/", import.meta.url));
const articleFiles = (await readdir(articleDirectory)).filter((name) => name.endsWith(".md"));

if (articleFiles.length === 0) {
  throw new Error("No Markdown articles were found in src/data/articles.");
}

const failures = [];
const repeatedHeading = /^##\s+Practical response:\s+what to do if conditions worsen\s*$/im;

for (const file of articleFiles) {
  const fullPath = join(articleDirectory, file);
  const content = await readFile(fullPath, "utf8");
  const frontmatter = content.match(/^---\s*\n([\s\S]*?)\n---/);

  if (!frontmatter) {
    failures.push(`${file}: missing YAML frontmatter`);
    continue;
  }

  const metadata = frontmatter[1];
  if (!/^title:\s*\S/im.test(metadata)) failures.push(`${file}: missing title`);
  if (!/^description:\s*\S/im.test(metadata)) failures.push(`${file}: missing description`);
  if (!/^sources:[ \t]*$/m.test(metadata) || !/^[ \t]+url:[ \t]*https?:\/\//im.test(metadata)) {
    failures.push(`${file}: add at least one direct, valid HTTP(S) source URL`);
  }
  if (repeatedHeading.test(content)) {
    failures.push(`${file}: remove the repeated generic preparedness section; add topic-specific reporting instead`);
  }
}

if (failures.length > 0) {
  console.error("Editorial content audit failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Editorial content audit passed for ${articleFiles.length} article files.`);
}
