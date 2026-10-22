#!/usr/bin/env node
/**
 * Sanity → EmDash 移行スクリプト
 *
 * 記事・固定ページ・カテゴリ・タグ・著者・画像を EmDash の API 経由で取り込む。
 * 公開日・スラッグ・SEO 情報はそのまま引き継ぐ。何度実行しても同じスラッグの
 * エントリーを上書きするだけなので、移行のやり直しが効く。
 *
 * 使い方は emdash/README.md を参照。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { parseArgs } from "node:util";

import { EmDashClient } from "emdash/client";

import { markdownToPortableText } from "./lib/markdown-to-portable-text.mjs";
import { portableTextToPlainText } from "./lib/portable-text-utils.mjs";
import { sanityPortableTextToEmDash } from "./lib/sanity-portable-text.mjs";
import { loadFromNdjson, loadFromSanityApi } from "./lib/sanity-source.mjs";

const { values: args } = parseArgs({
	options: {
		ndjson: { type: "string" },
		"project-id": { type: "string", default: process.env.SANITY_PROJECT_ID },
		dataset: { type: "string", default: process.env.SANITY_DATASET ?? "production" },
		target: { type: "string", default: process.env.EMDASH_URL ?? "http://localhost:4321" },
		"dry-run": { type: "boolean", default: false },
		out: { type: "string", default: ".emdash/sanity-import-preview.json" },
		help: { type: "boolean", short: "h", default: false },
	},
});

if (args.help) {
	console.log(`使い方:
  node scripts/import-sanity.mjs [--ndjson <export.tar.gz|dir|data.ndjson>] [--target <url>] [--dry-run]

読み込み元:
  --ndjson を指定しない場合は Sanity API から取得します
  (SANITY_PROJECT_ID / SANITY_DATASET / SANITY_READ_TOKEN)

書き込み先:
  --target   EmDash サイトの URL（既定: http://localhost:4321）
             localhost 以外は EMDASH_TOKEN（管理画面で発行する API トークン）が必要です
  --dry-run  書き込まずに変換結果を ${".emdash/sanity-import-preview.json"} に出力します`);
	process.exit(0);
}

const MEDIA_MAP_PATH = resolve(".emdash/sanity-media-map.json");

async function main() {
	const source = args.ndjson
		? loadFromNdjson(args.ndjson, { projectId: args["project-id"], dataset: args.dataset })
		: await loadSanityApi();

	console.log(
		`📦 読み込み: 記事 ${source.posts.length} / 固定ページ ${source.pages.length} / カテゴリ ${source.categories.length} / タグ ${source.tags.length} / 著者 ${source.authors.length}`,
	);

	if (args["dry-run"]) {
		await dryRun(source);
		return;
	}

	const target = new URL(args.target);
	const isLocal = ["localhost", "127.0.0.1"].includes(target.hostname);
	const token = process.env.EMDASH_TOKEN;
	if (!isLocal && !token) throw new Error("本番に書き込むには EMDASH_TOKEN が必要です");
	const client = new EmDashClient({ baseUrl: target.origin, ...(token ? { token } : { devBypass: true }) });

	const media = createMediaUploader(client);

	console.log("🏷️  カテゴリ・タグ");
	await ensureTerms(client, "category", source.categories);
	await ensureTerms(client, "tag", source.tags);

	console.log("👤 著者");
	const bylineIds = await ensureBylines(client, source.authors, media);

	console.log("📝 記事");
	for (const post of source.posts) {
		const content = await convertBody(post, media);
		const featuredImage = post.coverImage ? await media.fieldValue(post.coverImage) : null;
		const data = {
			title: post.title,
			excerpt: post.excerpt,
			content,
			featured: post.featured,
			popular_score: post.popularScore,
			revised_at: post.revisedAt,
			...(featuredImage ? { featured_image: featuredImage } : {}),
		};
		await upsert(client, "posts", post.slug, {
			data,
			publishedAt: post.publishedAt,
			createdAt: post.createdAt,
			taxonomies: { category: post.categories, tag: post.tags },
			bylines: bylineIds.has(post.authorId) ? [{ bylineId: bylineIds.get(post.authorId) }] : [],
			seo: seoInput(post.seo),
		});
	}

	console.log("📄 固定ページ");
	for (const page of source.pages) {
		const content = await convertBody(page, media);
		await upsert(client, "pages", page.slug, {
			data: { title: page.title, content },
			createdAt: page.createdAt,
			seo: seoInput(page.seo),
		});
	}

	media.save();
	console.log("✅ 完了しました");
}

async function loadSanityApi() {
	const projectId = args["project-id"];
	if (!projectId) {
		throw new Error("SANITY_PROJECT_ID を設定するか、--ndjson でエクスポートファイルを指定してください");
	}
	return loadFromSanityApi({ projectId, dataset: args.dataset, token: process.env.SANITY_READ_TOKEN });
}

/** Markdown 本文を優先し、なければ旧リッチテキスト本文を使う（現行サイトと同じ優先順位） */
async function convertBody(entry, media) {
	if (entry.bodyMarkdown.trim()) {
		return markdownToPortableText(entry.bodyMarkdown, {
			resolveImage: (url, alt, title) => media.portableTextImage({ url, alt, caption: title }),
		});
	}
	return sanityPortableTextToEmDash(entry.body, {
		resolveImage: (block) => media.portableTextImage({ url: block.url, file: block.file, alt: block.alt, caption: block.caption }),
	});
}

function seoInput(seo) {
	if (!seo) return undefined;
	const input = {};
	if (seo.title) input.title = seo.title;
	if (seo.description) input.description = seo.description;
	if (seo.canonicalUrl) input.canonical = seo.canonicalUrl;
	return Object.keys(input).length ? input : undefined;
}

async function upsert(client, collection, slug, input) {
	let existing = null;
	try {
		existing = await client.get(collection, slug, { raw: true });
	} catch (error) {
		if (error?.status !== 404) throw error;
	}

	const item = existing
		? await client.update(collection, existing.id, {
				data: input.data,
				publishedAt: input.publishedAt,
				taxonomies: input.taxonomies,
				bylines: input.bylines,
				seo: input.seo,
				overrideLock: true,
			})
		: await client.create(collection, { slug, ...input });

	await client.publish(collection, item.id, { overrideLock: true });
	console.log(`  ${existing ? "↻ 更新" : "＋ 追加"}: ${collection}/${slug}`);
}

async function ensureTerms(client, taxonomy, terms) {
	const { items } = await client.terms(taxonomy, { includeCounts: false });
	const existing = new Set(items.map((term) => term.slug));
	for (const term of terms) {
		if (existing.has(term.slug)) continue;
		await client.createTerm(taxonomy, {
			slug: term.slug,
			label: term.label,
			...(term.description ? { description: term.description } : {}),
		});
		existing.add(term.slug);
		console.log(`  ＋ ${taxonomy}: ${term.label}`);
	}
}

async function ensureBylines(client, authors, media) {
	const listed = await client.request("GET", "/admin/bylines?limit=100");
	const items = listed.items ?? listed.bylines ?? [];
	const bySlug = new Map(items.map((byline) => [byline.slug, byline.id]));
	const ids = new Map();
	for (const author of authors) {
		const slug = author.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
		let id = bySlug.get(slug);
		if (!id) {
			const avatar = author.avatar ? await media.upload(author.avatar) : null;
			const bio = [author.role, portableTextToPlainText(author.bio)].filter(Boolean).join("\n");
			const created = await client.request("POST", "/admin/bylines", {
				slug,
				displayName: author.name,
				...(bio ? { bio } : {}),
				...(avatar ? { avatarMediaId: avatar.id } : {}),
			});
			id = created.id ?? created.byline?.id;
			console.log(`  ＋ ${author.name}`);
		}
		ids.set(author.id, id);
	}
	return ids;
}

/**
 * 画像のアップロード。同じ画像を二重に取り込まないよう、
 * 取り込み元 → EmDash メディアの対応を .emdash/sanity-media-map.json に残す。
 */
function createMediaUploader(client) {
	const map = existsSync(MEDIA_MAP_PATH) ? JSON.parse(readFileSync(MEDIA_MAP_PATH, "utf8")) : {};

	async function upload(image) {
		const sourceKey = image.file ?? image.url;
		if (!sourceKey) return null;
		if (map[sourceKey]) return map[sourceKey];

		let body;
		let contentType;
		let filename;
		if (image.file) {
			body = new Uint8Array(readFileSync(image.file));
			filename = basename(image.file);
		} else {
			const res = await fetch(image.url);
			if (!res.ok) {
				console.warn(`  ⚠️ 画像を取得できませんでした (${res.status}): ${image.url}`);
				return null;
			}
			body = new Uint8Array(await res.arrayBuffer());
			contentType = res.headers.get("content-type") ?? undefined;
			filename = basename(new URL(image.url).pathname) || "image";
		}
		if (!extname(filename) && contentType?.startsWith("image/")) filename += `.${contentType.slice(6).split(";")[0]}`;

		const item = await client.mediaUpload(body, filename, { alt: image.alt, ...(contentType ? { contentType } : {}) });
		const record = {
			id: item.id,
			storageKey: item.storageKey ?? item.key,
			url: item.url,
			filename: item.filename,
			mimeType: item.mimeType,
			width: item.width,
			height: item.height,
			blurhash: item.blurhash,
			dominantColor: item.dominantColor,
		};
		map[sourceKey] = record;
		console.log(`  🖼️  ${filename}`);
		return record;
	}

	return {
		upload,
		/** 画像フィールド（カバー画像）用の値 */
		async fieldValue(image) {
			const media = await upload(image);
			if (!media) return null;
			return {
				provider: "local",
				id: media.id,
				...(image.alt ? { alt: image.alt } : {}),
				...(media.width ? { width: media.width, height: media.height } : {}),
				mimeType: media.mimeType,
				filename: media.filename,
				...(media.blurhash ? { blurhash: media.blurhash } : {}),
				...(media.dominantColor ? { dominantColor: media.dominantColor } : {}),
				meta: { storageKey: media.storageKey },
			};
		},
		/** 本文中の画像ブロック */
		async portableTextImage(image) {
			const media = await upload(image);
			if (!media) return null;
			return {
				_type: "image",
				asset: {
					_type: "reference",
					_ref: media.id,
					url: media.url,
				},
				...(image.alt ? { alt: image.alt } : {}),
				...(image.caption ? { caption: image.caption } : {}),
				...(media.width ? { width: media.width, height: media.height } : {}),
				...(media.blurhash ? { blurhash: media.blurhash } : {}),
				...(media.dominantColor ? { dominantColor: media.dominantColor } : {}),
			};
		},
		save() {
			mkdirSync(dirname(MEDIA_MAP_PATH), { recursive: true });
			writeFileSync(MEDIA_MAP_PATH, `${JSON.stringify(map, null, 2)}\n`);
		},
	};
}

async function dryRun(source) {
	const media = {
		portableTextImage: async (image) => ({
			_type: "image",
			asset: { _type: "reference", _ref: "(dry-run)", url: image.url ?? image.file },
			...(image.alt ? { alt: image.alt } : {}),
		}),
	};
	const posts = [];
	for (const post of source.posts) posts.push({ ...post, content: await convertBody(post, media) });
	const pages = [];
	for (const page of source.pages) pages.push({ ...page, content: await convertBody(page, media) });
	const out = resolve(args.out);
	mkdirSync(dirname(out), { recursive: true });
	writeFileSync(out, `${JSON.stringify({ ...source, posts, pages }, null, 2)}\n`);
	console.log(`📝 変換結果を書き出しました: ${out}`);
}

main().catch((error) => {
	console.error(`❌ ${error.message}`);
	if (error.details) console.error(error.details);
	process.exit(1);
});
