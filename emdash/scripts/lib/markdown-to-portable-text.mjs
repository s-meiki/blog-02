/**
 * Markdown (Sanity の bodyMarkdown) → EmDash Portable Text 変換。
 *
 * 現行サイト (web/src/components/blog/RichTextContent.tsx) と同じく
 * remark-gfm + remark-breaks 相当の解釈をする:
 * - 段落内の単一改行は改行として残す
 * - URL だけの段落が YouTube / X の URL なら埋め込みブロックにする
 * - 全角の ＃ / ＊ などの表記ゆれを normalizeMarkdownEmphasis と同じルールで補正する
 *
 * 画像は `resolveImage(url, alt)` で EmDash のメディアに差し替える。
 */
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { createKeyGenerator, isTweetUrl, isYouTubeUrl } from "./portable-text-utils.mjs";

const INLINE_OR_BLOCK_CODE_PATTERN = /(```[\s\S]*?```|`[^`\n]*`)/g;
const STAR_LIKE_MARKER = "[*＊﹡∗✱]";
const STAR_LIKE_PAIR_PATTERN = new RegExp(
	`(${STAR_LIKE_MARKER}{2})([^\\S\\r\\n]*)(.+?)([^\\S\\r\\n]*)(${STAR_LIKE_MARKER}{2})`,
	"gu",
);
const HEADING_MARKER_PATTERN = /^([^\S\r\n]*)([＃#]{2,4})([^\S\r\n]+)(.+)$/u;
const STRONG_MARKDOWN_PATTERN = /\*\*([^*\r\n]+?)\*\*/gu;

const trimEdgeWhitespace = (value) => value.replace(/^[^\S\r\n]+|[^\S\r\n]+$/gu, "");

function normalizeInlineSegment(segment) {
	const headingNormalized = segment
		.split("\n")
		.map((line) =>
			line.replace(
				HEADING_MARKER_PATTERN,
				(_m, indent, marks, gap, content) => `${indent}${marks.replace(/＃/gu, "#")}${gap}${content}`,
			),
		)
		.join("\n");
	const markerNormalized = headingNormalized.replace(
		STAR_LIKE_PAIR_PATTERN,
		(match, _open, left, inner, right) => {
			const text = trimEdgeWhitespace(inner);
			if (!text) return match;
			if (!left && !right && /^\*\*[^*\r\n]+?\*\*$/u.test(match)) return match;
			return `**${text}**`;
		},
	);
	return markerNormalized.replace(STRONG_MARKDOWN_PATTERN, (match, inner) => {
		const text = trimEdgeWhitespace(inner);
		return text ? `**${text}**` : match;
	});
}

export function normalizeMarkdown(markdown) {
	return markdown
		.split(INLINE_OR_BLOCK_CODE_PATTERN)
		.map((chunk) => (chunk.startsWith("`") ? chunk : normalizeInlineSegment(chunk)))
		.join("");
}

const parser = unified().use(remarkParse).use(remarkGfm);

/**
 * @param {string} markdown
 * @param {{ resolveImage: (url: string, alt: string, title?: string) => Promise<object | null> }} options
 * @returns {Promise<object[]>}
 */
export async function markdownToPortableText(markdown, { resolveImage }) {
	const tree = parser.parse(normalizeMarkdown(markdown));
	const key = createKeyGenerator();
	const blocks = [];

	/** mdast の inline ノード列 → { children, markDefs } */
	function inline(nodes, marks = [], markDefs = []) {
		const children = [];
		const push = (text, extraMarks = []) => {
			if (!text) return;
			const allMarks = [...marks, ...extraMarks];
			const last = children[children.length - 1];
			if (last && sameMarks(last.marks, allMarks)) {
				last.text += text;
				return;
			}
			children.push({ _type: "span", _key: key(), text, marks: allMarks });
		};
		for (const node of nodes) {
			switch (node.type) {
				case "text":
					push(node.value);
					break;
				case "break":
					push("\n");
					break;
				case "inlineCode":
					push(node.value, ["code"]);
					break;
				case "strong":
					children.push(...inline(node.children, [...marks, "strong"], markDefs).children);
					break;
				case "emphasis":
					children.push(...inline(node.children, [...marks, "em"], markDefs).children);
					break;
				case "delete":
					children.push(...inline(node.children, [...marks, "strike-through"], markDefs).children);
					break;
				case "link": {
					const defKey = key();
					markDefs.push({ _type: "link", _key: defKey, href: node.url, ...(isExternal(node.url) ? { blank: true } : {}) });
					children.push(...inline(node.children, [...marks, defKey], markDefs).children);
					break;
				}
				case "image":
					// 段落内の画像はブロック化できないので alt 付きリンクとして残す
					{
						const defKey = key();
						markDefs.push({ _type: "link", _key: defKey, href: node.url });
						push(node.alt || node.url, [defKey]);
					}
					break;
				case "html":
					push(node.value);
					break;
				default:
					if (node.children) children.push(...inline(node.children, marks, markDefs).children);
					else if (typeof node.value === "string") push(node.value);
			}
		}
		if (children.length === 0) children.push({ _type: "span", _key: key(), text: "", marks: [] });
		return { children, markDefs };
	}

	function textBlock(nodes, style = "normal", extra = {}) {
		const { children, markDefs } = inline(nodes);
		return { _type: "block", _key: key(), style, markDefs, children, ...extra };
	}

	async function paragraph(node, style = "normal", extra = {}) {
		const content = node.children.filter((c) => !(c.type === "text" && c.value.trim() === ""));

		// URL だけの段落 → 埋め込み
		if (content.length === 1 && style === "normal" && !extra.listItem) {
			const only = content[0];
			const url =
				only.type === "link" ? only.url : only.type === "text" ? only.value.trim() : null;
			if (url && (isYouTubeUrl(url) || isTweetUrl(url))) {
				blocks.push(embedBlock(url, key));
				return;
			}
		}

		// 画像だけの段落 → 画像ブロック（画像が複数並ぶ場合は前後で分割）
		if (style === "normal" && !extra.listItem && content.some((c) => c.type === "image")) {
			let buffer = [];
			const flush = () => {
				const meaningful = buffer.filter((c) => !(c.type === "break" || (c.type === "text" && !c.value.trim())));
				if (meaningful.length) blocks.push(textBlock(buffer));
				buffer = [];
			};
			for (const child of node.children) {
				if (child.type === "image") {
					flush();
					const image = await resolveImage(child.url, child.alt ?? "", child.title ?? undefined);
					if (image) blocks.push({ _key: key(), ...image });
				} else {
					buffer.push(child);
				}
			}
			flush();
			return;
		}

		blocks.push(textBlock(node.children, style, extra));
	}

	async function list(node, level) {
		const listItem = node.ordered ? "number" : "bullet";
		for (const item of node.children) {
			let first = true;
			for (const child of item.children) {
				if (child.type === "paragraph") {
					const prefix =
						first && typeof item.checked === "boolean" ? [{ type: "text", value: item.checked ? "☑ " : "☐ " }] : [];
					blocks.push(textBlock([...prefix, ...child.children], "normal", { listItem, level }));
					first = false;
				} else if (child.type === "list") {
					await list(child, level + 1);
				} else {
					await walk(child);
				}
			}
		}
	}

	async function walk(node) {
		switch (node.type) {
			case "heading":
				// 本文の h1 は記事タイトルと重なるので h2 に寄せる
				blocks.push(textBlock(node.children, `h${Math.min(Math.max(node.depth, 2), 6)}`));
				break;
			case "paragraph":
				await paragraph(node);
				break;
			case "blockquote":
				for (const child of node.children) {
					if (child.type === "paragraph") blocks.push(textBlock(child.children, "blockquote"));
					else await walk(child);
				}
				break;
			case "list":
				await list(node, 1);
				break;
			case "code": {
				const [language, ...rest] = (node.lang ?? "").split(":");
				const filename = rest.join(":") || (node.meta?.match(/title="?([^"\s]+)"?/)?.[1] ?? undefined);
				blocks.push({
					_type: "code",
					_key: key(),
					code: node.value,
					...(language ? { language } : {}),
					...(filename ? { filename } : {}),
				});
				break;
			}
			case "table":
				blocks.push(tableBlock(node));
				break;
			case "thematicBreak":
				blocks.push({ _type: "break", _key: key(), style: "line" });
				break;
			case "html":
				if (node.value.trim()) blocks.push({ _type: "htmlBlock", _key: key(), html: node.value });
				break;
			default:
				if (node.children) for (const child of node.children) await walk(child);
		}
	}

	function tableBlock(node) {
		const rows = node.children.map((row, rowIndex) => ({
			_type: "tableRow",
			_key: key(),
			cells: row.children.map((cell, cellIndex) => {
				const { children, markDefs } = inline(cell.children);
				const align = node.align?.[cellIndex];
				return {
					_type: "tableCell",
					_key: key(),
					content: children,
					...(markDefs.length ? { markDefs } : {}),
					...(rowIndex === 0 ? { isHeader: true } : {}),
					...(align ? { textAlign: align } : {}),
				};
			}),
		}));
		return { _type: "table", _key: key(), hasHeaderRow: true, rows };
	}

	for (const child of tree.children) await walk(child);
	return blocks;
}

export function embedBlock(url, key) {
	return {
		_type: "embed",
		_key: key(),
		url,
		provider: isYouTubeUrl(url) ? "youtube" : "twitter",
	};
}

function sameMarks(a = [], b = []) {
	return a.length === b.length && a.every((mark, i) => mark === b[i]);
}

function isExternal(url) {
	return /^https?:\/\//.test(url);
}
