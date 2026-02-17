import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";

const MAX_SEO_DESCRIPTION = 160;

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const truncateText = (value, maxLength) => {
  const chars = [...value];
  if (chars.length <= maxLength) return value;
  return `${chars.slice(0, Math.max(0, maxLength - 3)).join("").trimEnd()}...`;
};

const normalizeMarkdownEmphasis = (markdown) =>
  markdown
    .replace(/^([^\S\r\n]*)([＃#]{2,4})([^\S\r\n]+)(.+)$/gmu, (_m, indent, marks, gap, content) => {
      const normalizedMarks = marks.replace(/[＃]/gu, "#");
      return `${indent}${normalizedMarks}${gap}${content}`;
    })
    .replace(/([*＊﹡∗✱]{2})([^\S\r\n]*)(.+?)([^\S\r\n]*)([*＊﹡∗✱]{2})/gu, (_m, _open, _l, inner) => {
      const text = String(inner).replace(/^[^\S\r\n]+|[^\S\r\n]+$/gu, "");
      return text ? `**${text}**` : _m;
    })
    .replace(/\*\*([^*\r\n]+?)\*\*/gu, (match, inner) => {
      const text = String(inner).replace(/^[^\S\r\n]+|[^\S\r\n]+$/gu, "");
      return text ? `**${text}**` : match;
    });

const markdownToPlainText = (markdown) => {
  const normalized = normalizeMarkdownEmphasis(markdown);
  return normalizeWhitespace(
    normalized
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`\n]*)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^[ \t]*([#＃]{1,6}|>|[-*+]|\d+\.)[ \t]+/gm, "")
      .replace(/[*_~]/g, " ")
      .replace(/\r?\n+/g, " "),
  );
};

const portableToPlainText = (body) => {
  if (!Array.isArray(body)) return "";
  return normalizeWhitespace(
    body
      .filter((item) => item && typeof item === "object" && item._type === "block" && Array.isArray(item.children))
      .map((block) => block.children.map((child) => (typeof child?.text === "string" ? child.text : "")).join(""))
      .join(" "),
  );
};

const deriveDescription = ({ bodyMarkdown, excerpt, body }) => {
  const bodyText = typeof bodyMarkdown === "string" ? markdownToPlainText(bodyMarkdown) : "";
  const excerptText = typeof excerpt === "string" ? normalizeWhitespace(excerpt) : "";
  const portableText = portableToPlainText(body);
  const candidate = bodyText || excerptText || portableText;
  if (!candidate) return "";
  return truncateText(candidate, MAX_SEO_DESCRIPTION);
};

const deriveOgImage = (coverImage) => {
  if (!coverImage || typeof coverImage !== "object" || !coverImage.asset?._ref) return null;
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: coverImage.asset._ref,
    },
    ...(coverImage.alt ? { alt: coverImage.alt } : {}),
    ...(coverImage.crop ? { crop: coverImage.crop } : {}),
    ...(coverImage.hotspot ? { hotspot: coverImage.hotspot } : {}),
  };
};

const sameImage = (left, right) =>
  JSON.stringify({
    ref: left?.asset?._ref ?? null,
    alt: left?.alt ?? null,
    crop: left?.crop ?? null,
    hotspot: left?.hotspot ?? null,
  }) === JSON.stringify({
    ref: right?.asset?._ref ?? null,
    alt: right?.alt ?? null,
    crop: right?.crop ?? null,
    hotspot: right?.hotspot ?? null,
  });

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
const token =
  process.env.SANITY_WRITE_TOKEN ??
  process.env.SANITY_API_TOKEN ??
  process.env.SANITY_AUTH_TOKEN ??
  process.env.SANITY_READ_TOKEN;

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
const chunkArg = args.find((arg) => arg.startsWith("--chunk="));
const chunkSize = Math.max(1, Number(chunkArg?.split("=")[1] ?? 50));

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "raw",
});

const posts = await client.fetch(
  `*[_type == "post"]{
    _id,
    title,
    excerpt,
    body,
    bodyMarkdown,
    coverImage,
    seo
  }`,
);

const changes = [];
for (const post of posts) {
  const nextTitle = typeof post.title === "string" ? post.title.trim() : "";
  const nextDescription = deriveDescription(post);
  const nextOgImage = deriveOgImage(post.coverImage);
  const seo = post.seo ?? {};

  const titleChanged = nextTitle && seo.title !== nextTitle;
  const descriptionChanged = nextDescription && seo.description !== nextDescription;
  const ogImageChanged = nextOgImage && !sameImage(seo.ogImage, nextOgImage);

  if (!titleChanged && !descriptionChanged && !ogImageChanged) continue;

  const nextSeo = {
    ...(seo && typeof seo === "object" ? seo : {}),
    ...(nextTitle ? { title: nextTitle } : {}),
    ...(nextDescription ? { description: nextDescription } : {}),
    ...(nextOgImage ? { ogImage: nextOgImage } : {}),
  };

  changes.push({
    _id: post._id,
    title: post.title ?? "(untitled)",
    seo: nextSeo,
  });
}

console.log(`[sync-post-seo] checked=${posts.length} changed=${changes.length}`);
if (changes.length > 0) {
  console.log("[sync-post-seo] changed docs (up to 20):");
  for (const row of changes.slice(0, 20)) {
    console.log(`  - ${row._id} | ${row.title}`);
  }
}

if (!apply) {
  console.log("[sync-post-seo] dry-run complete. Add --apply to patch documents.");
  process.exit(0);
}

let updated = 0;
for (let i = 0; i < changes.length; i += chunkSize) {
  const batch = changes.slice(i, i + chunkSize);
  let tx = client.transaction();
  for (const doc of batch) {
    tx = tx.patch(doc._id, { set: { seo: doc.seo } });
  }
  await tx.commit({ autoGenerateArrayKeys: false });
  updated += batch.length;
  console.log(`[sync-post-seo] committed ${updated}/${changes.length}`);
}

console.log(`[sync-post-seo] done. updated=${updated}`);
