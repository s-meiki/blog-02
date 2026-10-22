const YOUTUBE_PATTERN = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/i;
const TWEET_PATTERN = /^(https?:\/\/)?(www\.|mobile\.)?(twitter|x)\.com\/[A-Za-z0-9_]+\/status\/\d+/i;

export const isYouTubeUrl = (url) => YOUTUBE_PATTERN.test(url.trim());
export const isTweetUrl = (url) => TWEET_PATTERN.test(url.trim());

/** Portable Text の _key を連番で発行する */
export function createKeyGenerator(prefix = "k") {
	let counter = 0;
	return () => `${prefix}${(counter++).toString(36)}`;
}

/** Portable Text からプレーンテキストを取り出す（著者プロフィールなどに使う） */
export function portableTextToPlainText(blocks) {
	if (!Array.isArray(blocks)) return "";
	return blocks
		.filter((block) => block?._type === "block" && Array.isArray(block.children))
		.map((block) => block.children.map((child) => child.text ?? "").join(""))
		.filter(Boolean)
		.join("\n");
}
