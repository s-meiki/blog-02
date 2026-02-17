import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";

const INLINE_OR_BLOCK_CODE_PATTERN = /(```[\s\S]*?```|`[^`\n]*`)/g;
const STAR_LIKE_MARKER = "[*＊﹡∗✱]";
const STAR_LIKE_PAIR_PATTERN = new RegExp(
  `(${STAR_LIKE_MARKER}{2})([^\\S\\r\\n]*)(.+?)([^\\S\\r\\n]*)(${STAR_LIKE_MARKER}{2})`,
  "gu",
);
const HEADING_MARKER_PATTERN = /^([^\S\r\n]*)([＃#]{2,4})([^\S\r\n]+)(.+)$/u;
const STRONG_MARKDOWN_PATTERN = /\*\*([^*\r\n]+?)\*\*/gu;

const trimMarkdownEdgeWhitespace = (value) => value.replace(/^[^\S\r\n]+|[^\S\r\n]+$/gu, "");

const normalizeHeadingLine = (line) =>
  line.replace(HEADING_MARKER_PATTERN, (_match, indent, marks, gap, content) => {
    const normalizedMarks = marks.replace(/[＃]/gu, "#");
    return `${indent}${normalizedMarks}${gap}${content}`;
  });

const normalizeInlineSegment = (segment) => {
  const headingNormalized = normalizeHeadingLine(segment);

  const markerNormalized = headingNormalized.replace(STAR_LIKE_PAIR_PATTERN, (match, _open, left, inner, right) => {
    const text = trimMarkdownEdgeWhitespace(inner);
    if (!text) return match;
    if (!left && !right && /^\*\*[^*\r\n]+?\*\*$/u.test(match)) return match;
    return `**${text}**`;
  });

  return markerNormalized.replace(STRONG_MARKDOWN_PATTERN, (match, inner) => {
    const text = trimMarkdownEdgeWhitespace(inner);
    return text ? `**${text}**` : match;
  });
};

const normalizeMarkdownEmphasis = (markdown) =>
  markdown
    .split(INLINE_OR_BLOCK_CODE_PATTERN)
    .map((chunk) => (chunk.startsWith("```") || chunk.startsWith("`") ? chunk : normalizeInlineSegment(chunk)))
    .join("");

const loadEnvFile = (filepath) => {
  if (!fs.existsSync(filepath)) return;
  const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const sep = line.indexOf("=");
    if (sep < 0) continue;
    const key = line.slice(0, sep).trim();
    const raw = line.slice(sep + 1).trim();
    const value = raw.replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

const cwd = process.cwd();
loadEnvFile(path.join(cwd, ".env.local"));
loadEnvFile(path.join(cwd, ".env"));

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.SANITY_STUDIO_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2023-10-01";
const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN ?? process.env.SANITY_READ_TOKEN;

if (!projectId) {
  console.error("Missing SANITY_PROJECT_ID / SANITY_STUDIO_PROJECT_ID");
  process.exit(1);
}

if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN / SANITY_API_TOKEN / SANITY_READ_TOKEN");
  process.exit(1);
}

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const typesArg = args.find((arg) => arg.startsWith("--types="));
const chunkArg = args.find((arg) => arg.startsWith("--chunk="));
const chunkSize = Math.max(1, Number(chunkArg?.split("=")[1] ?? 50));
const types = (typesArg?.split("=")[1] ?? "post")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "raw",
});

const docs = await client.fetch(
  `*[_type in $types]{
    _id,
    _type,
    title,
    bodyMarkdown
  }`,
  { types },
);

const changes = [];
for (const doc of docs) {
  if (typeof doc?.bodyMarkdown !== "string") continue;
  const normalized = normalizeMarkdownEmphasis(doc.bodyMarkdown);
  if (normalized !== doc.bodyMarkdown) {
    changes.push({
      _id: doc._id,
      _type: doc._type,
      title: doc.title ?? "(untitled)",
      next: normalized,
    });
  }
}

console.log(`[normalize-body-markdown] checked=${docs.length} changed=${changes.length} types=${types.join(",")}`);
if (changes.length > 0) {
  const preview = changes.slice(0, 20).map((item) => `${item._id} | ${item._type} | ${item.title}`);
  console.log("[normalize-body-markdown] changed docs (up to 20):");
  for (const row of preview) {
    console.log(`  - ${row}`);
  }
}

if (!apply) {
  console.log("[normalize-body-markdown] dry-run complete. Add --apply to patch documents.");
  process.exit(0);
}

let updated = 0;
for (let i = 0; i < changes.length; i += chunkSize) {
  const batch = changes.slice(i, i + chunkSize);
  let tx = client.transaction();
  for (const doc of batch) {
    tx = tx.patch(doc._id, { set: { bodyMarkdown: doc.next } });
  }
  await tx.commit({ autoGenerateArrayKeys: false });
  updated += batch.length;
  console.log(`[normalize-body-markdown] committed ${updated}/${changes.length}`);
}

console.log(`[normalize-body-markdown] done. updated=${updated}`);
