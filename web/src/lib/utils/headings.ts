import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Heading as MdHeading } from "mdast";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import { normalizeMarkdownEmphasis } from "./normalize-markdown";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9一-龯ぁ-んァ-ンー]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const createHeadingIdGenerator = () => {
  const usedIds = new Map<string, number>();
  return (text: string) => {
    const baseId = slugify(text) || "section";
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);
    return count > 0 ? `${baseId}-${count + 1}` : baseId;
  };
};

const getPortableBlockText = (block: PortableTextBlock) =>
  (block.children as PortableTextSpan[] | undefined)?.map((child) => child.text ?? "").join("") ?? "";

const MARKDOWN_HEADING_IN_TEXT = /^[^\S\r\n]*([#＃]{2,4})[^\S\r\n]+(.+)$/u;

export const extractHeadings = (blocks: PortableTextBlock[] | null | undefined): Heading[] => {
  if (!blocks) return [];
  const generateId = createHeadingIdGenerator();

  return blocks
    .filter((block) => block._type === "block")
    .map((block) => {
      if (block.style && /^h[2-4]$/.test(block.style)) {
        const text = getPortableBlockText(block).trim();
        if (!text) {
          return null;
        }
        return {
          id: generateId(text),
          text,
          level: Number(block.style?.replace("h", "")),
        };
      }

      if (block.style !== "normal") {
        return null;
      }

      const rawText = getPortableBlockText(block);
      const match = rawText.match(MARKDOWN_HEADING_IN_TEXT);
      if (!match) {
        return null;
      }

      const level = Math.min(4, Math.max(2, match[1].replace(/[＃]/gu, "#").length));
      const text = match[2].trim();
      if (!text) {
        return null;
      }
      return {
        id: generateId(text),
        text,
        level,
      };
    })
    .filter((heading): heading is Heading => Boolean(heading));
};

export const extractHeadingsFromMarkdown = (markdown: string | null | undefined): Heading[] => {
  if (!markdown) return [];

  const tree = unified().use(remarkParse).use(remarkGfm).parse(normalizeMarkdownEmphasis(markdown));
  const generateId = createHeadingIdGenerator();
  const headings: Heading[] = [];

  visit(tree, "heading", (node: MdHeading) => {
    if (!node.depth || node.depth < 2 || node.depth > 4) return;
    const text = toString(node).trim();
    if (!text) return;
    headings.push({
      id: generateId(text),
      text,
      level: node.depth,
    });
  });

  return headings;
};
