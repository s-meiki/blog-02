/**
 * Sanity の旧リッチテキスト本文 (blockContent) → EmDash Portable Text 変換。
 *
 * テキストブロックはどちらも Portable Text なのでほぼそのまま使える。
 * Sanity 独自のブロックだけ EmDash の組み込みブロックに置き換える:
 * - imageWithCaption → image（画像は EmDash のメディアにアップロード）
 * - codeBlock        → code
 * - youtubeEmbed / tweetEmbed → embed
 * リンクの openInNewWindow は EmDash の blank に読み替える。
 */
import { embedBlock } from "./markdown-to-portable-text.mjs";
import { createKeyGenerator } from "./portable-text-utils.mjs";

/**
 * @param {object[]} blocks
 * @param {{ resolveImage: (image: object) => Promise<object | null> }} options
 */
export async function sanityPortableTextToEmDash(blocks, { resolveImage }) {
	if (!Array.isArray(blocks)) return [];
	const key = createKeyGenerator("s");
	const result = [];

	for (const block of blocks) {
		switch (block?._type) {
			case "block":
				result.push({
					...block,
					markDefs: (block.markDefs ?? []).map(({ openInNewWindow, ...def }) =>
						def._type === "link" && openInNewWindow ? { ...def, blank: true } : def,
					),
				});
				break;
			case "image":
			case "imageWithCaption": {
				const image = await resolveImage(block);
				if (image) result.push({ _key: block._key ?? key(), ...image });
				break;
			}
			case "codeBlock":
				result.push({
					_type: "code",
					_key: block._key ?? key(),
					code: block.code ?? "",
					...(block.language ? { language: block.language } : {}),
					...(block.filename ? { filename: block.filename } : {}),
				});
				break;
			case "youtubeEmbed":
			case "tweetEmbed":
				if (block.url) result.push({ ...embedBlock(block.url, key), _key: block._key ?? key() });
				break;
			default:
				console.warn(`  ⚠️ 未対応のブロック "${block?._type}" をスキップしました`);
		}
	}
	return result;
}
