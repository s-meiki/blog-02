import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Heading as MdHeading } from "mdast";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";

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

export const extractHeadings = (blocks: PortableTextBlock[] | null | undefined): Heading[] => {
  if (!blocks) return [];
  const generateId = createHeadingIdGenerator();

  return blocks
    .filter((block) => block._type === "block" && block.style && /^h[2-4]$/.test(block.style))
    .map((block) => {
      const text = getPortableBlockText(block).trim();
      if (!text) {
        return null;
      }
      return {
        id: generateId(text),
        text,
        level: Number(block.style?.replace("h", "")),
      };
    })
    .filter((heading): heading is Heading => Boolean(heading));
};

export const extractHeadingsFromMarkdown = (markdown: string | null | undefined): Heading[] => {
  if (!markdown) return [];

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
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
