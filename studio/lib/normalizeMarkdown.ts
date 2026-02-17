const INLINE_OR_BLOCK_CODE_PATTERN = /(```[\s\S]*?```|`[^`\n]*`)/g;
const STAR_LIKE_MARKER = "[*＊﹡∗✱]";
const STAR_LIKE_PAIR_PATTERN = new RegExp(
  `(${STAR_LIKE_MARKER}{2})([^\\S\\r\\n]*)(.+?)([^\\S\\r\\n]*)(${STAR_LIKE_MARKER}{2})`,
  "gu",
);
const HEADING_MARKER_PATTERN = /^([^\S\r\n]*)([＃#]{2,4})([^\S\r\n]+)(.+)$/u;
const STRONG_MARKDOWN_PATTERN = /\*\*([^*\r\n]+?)\*\*/gu;

const trimMarkdownEdgeWhitespace = (value: string) => value.replace(/^[^\S\r\n]+|[^\S\r\n]+$/gu, "");

const normalizeHeadingLine = (line: string) =>
  line.replace(HEADING_MARKER_PATTERN, (_match, indent: string, marks: string, gap: string, content: string) => {
    const normalizedMarks = marks.replace(/[＃]/gu, "#");
    return `${indent}${normalizedMarks}${gap}${content}`;
  });

const normalizeInlineSegment = (segment: string) => {
  const headingNormalized = normalizeHeadingLine(segment);

  const markerNormalized = headingNormalized.replace(
    STAR_LIKE_PAIR_PATTERN,
    (match, _open, left: string, inner: string, right: string) => {
      const text = trimMarkdownEdgeWhitespace(inner);
      if (!text) return match;
      if (!left && !right && /^\*\*[^*\r\n]+?\*\*$/u.test(match)) return match;
      return `**${text}**`;
    },
  );

  return markerNormalized.replace(STRONG_MARKDOWN_PATTERN, (match, inner: string) => {
    const text = trimMarkdownEdgeWhitespace(inner);
    return text ? `**${text}**` : match;
  });
};

export const normalizeMarkdownEmphasis = (markdown: string): string =>
  markdown
    .split(INLINE_OR_BLOCK_CODE_PATTERN)
    .map((chunk) => (chunk.startsWith("```") || chunk.startsWith("`") ? chunk : normalizeInlineSegment(chunk)))
    .join("");
