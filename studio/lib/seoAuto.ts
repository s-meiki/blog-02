import { normalizeMarkdownEmphasis } from "./normalizeMarkdown";

type PortableSpan = {
  _type?: string;
  text?: string;
};

type PortableBlock = {
  _type?: string;
  children?: PortableSpan[];
};

type ImageAssetRef = {
  _type?: "reference";
  _ref?: string;
};

type SanityImageLike = {
  _type?: "image";
  asset?: ImageAssetRef;
  alt?: string;
  crop?: {
    _type?: "sanity.imageCrop";
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  hotspot?: {
    _type?: "sanity.imageHotspot";
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  };
};

const MAX_SEO_DESCRIPTION = 160;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const truncateText = (value: string, maxLength: number) => {
  const chars = [...value];
  if (chars.length <= maxLength) return value;
  return `${chars.slice(0, Math.max(0, maxLength - 3)).join("").trimEnd()}...`;
};

const markdownToPlainText = (markdown: string) => {
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

const portableToPlainText = (body: unknown): string => {
  if (!Array.isArray(body)) return "";
  return normalizeWhitespace(
    body
      .filter((item): item is PortableBlock => Boolean(item && typeof item === "object"))
      .map((block) => {
        if (block._type !== "block" || !Array.isArray(block.children)) return "";
        return block.children
          .filter((child): child is PortableSpan => Boolean(child && typeof child === "object"))
          .map((child) => child.text ?? "")
          .join("");
      })
      .join(" "),
  );
};

export const deriveSeoTitle = (title: unknown) =>
  typeof title === "string" ? title.trim() : "";

export const deriveSeoDescription = ({
  bodyMarkdown,
  excerpt,
  body,
}: {
  bodyMarkdown: unknown;
  excerpt: unknown;
  body: unknown;
}) => {
  const bodyText = typeof bodyMarkdown === "string" ? markdownToPlainText(bodyMarkdown) : "";
  const excerptText = typeof excerpt === "string" ? normalizeWhitespace(excerpt) : "";
  const portableText = portableToPlainText(body);
  const candidate = bodyText || excerptText || portableText;
  if (!candidate) return "";
  return truncateText(candidate, MAX_SEO_DESCRIPTION);
};

export const deriveSeoOgImage = (coverImage: unknown): SanityImageLike | null => {
  if (!coverImage || typeof coverImage !== "object") return null;
  const image = coverImage as SanityImageLike;
  if (!image.asset?._ref) return null;

  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: image.asset._ref,
    },
    ...(image.alt ? { alt: image.alt } : {}),
    ...(image.crop ? { crop: image.crop } : {}),
    ...(image.hotspot ? { hotspot: image.hotspot } : {}),
  };
};

export const isSameSeoImage = (a: unknown, b: unknown) => {
  if (!a && !b) return true;
  if (!a || !b) return false;

  const left = a as SanityImageLike;
  const right = b as SanityImageLike;

  return JSON.stringify({
    assetRef: left.asset?._ref ?? null,
    alt: left.alt ?? null,
    crop: left.crop ?? null,
    hotspot: left.hotspot ?? null,
  }) === JSON.stringify({
    assetRef: right.asset?._ref ?? null,
    alt: right.alt ?? null,
    crop: right.crop ?? null,
    hotspot: right.hotspot ?? null,
  });
};
