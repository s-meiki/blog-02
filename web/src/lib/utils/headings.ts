import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9一-龯ぁ-んァ-ンー]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const extractHeadings = (blocks: PortableTextBlock[] | undefined): Heading[] => {
  if (!blocks) return [];
  const usedIds = new Map<string, number>();

  return blocks
    .filter((block) => block._type === "block" && block.style && /^h[2-4]$/.test(block.style))
    .map((block) => {
      const text = (block.children as PortableTextSpan[] | undefined)?.map((child) => child.text).join("") ?? "";
      const baseId = slugify(text) || "section";
      const count = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, count + 1);
      const id = count > 0 ? `${baseId}-${count + 1}` : baseId;
      return {
        id,
        text,
        level: Number(block.style?.replace("h", "")),
      };
    });
};
