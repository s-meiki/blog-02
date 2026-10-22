/**
 * Sanity からデータを読み込み、移行用の共通形式に揃える。
 *
 * 読み込み元は 2 通り:
 * - API:    SANITY_PROJECT_ID / SANITY_DATASET / SANITY_READ_TOKEN を使って GROQ で取得
 * - NDJSON: `sanity dataset export` の出力（.tar.gz / 展開済みフォルダ / data.ndjson）
 *
 * 画像は { url } か { file }（ローカルパス）で表す。
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const API_VERSION = "2023-10-01";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

const imageProjection = (field) => `"${field}": select(defined(${field}.asset) => {
	"url": ${field}.asset->url,
	"alt": ${field}.alt,
	"caption": ${field}.caption
})`;

const bodyProjection = `body[]{
	...,
	_type in ["image", "imageWithCaption"] => { "url": asset->url }
}`;

const QUERIES = {
	authors: `*[_type == "author" && !(_id in path("drafts.**"))]{
		_id, name, "slug": slug.current, role, bio, ${imageProjection("avatar")}
	}`,
	categories: `*[_type == "category" && !(_id in path("drafts.**"))]{
		_id, title, "slug": slug.current, description
	}`,
	tags: `*[_type == "tag" && !(_id in path("drafts.**"))]{
		_id, title, "slug": slug.current, description
	}`,
	posts: `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt asc){
		_id, title, "slug": slug.current, excerpt, publishedAt, updatedAt, _createdAt, _updatedAt,
		featured, popularScore, bodyMarkdown, ${bodyProjection},
		${imageProjection("coverImage")},
		"author": author->_id,
		"categories": categories[]->_id,
		tags,
		seo{ title, description, canonicalUrl, "ogImage": ogImage.asset->url }
	}`,
	pages: `*[_type == "page" && !(_id in path("drafts.**"))]{
		_id, title, "slug": slug.current, bodyMarkdown, ${bodyProjection}, _createdAt, _updatedAt,
		seo{ title, description, canonicalUrl, "ogImage": ogImage.asset->url }
	}`,
};

export async function loadFromSanityApi({ projectId, dataset, token }) {
	const base = `https://${projectId}.api.sanity.io/v${API_VERSION}/data/query/${dataset}`;
	const query = async (groq) => {
		const url = `${base}?query=${encodeURIComponent(groq)}&perspective=published`;
		const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
		if (!res.ok) throw new Error(`Sanity API エラー (${res.status}): ${await res.text()}`);
		return (await res.json()).result;
	};
	const [authors, categories, tags, posts, pages] = await Promise.all(
		["authors", "categories", "tags", "posts", "pages"].map((name) => query(QUERIES[name])),
	);
	return normalize({ authors, categories, tags, posts, pages });
}

// ---------------------------------------------------------------------------
// NDJSON (sanity dataset export)
// ---------------------------------------------------------------------------

export function loadFromNdjson(inputPath, { projectId, dataset } = {}) {
	const { ndjsonPath, baseDir } = locateExport(resolve(inputPath));
	const docs = readFileSync(ndjsonPath, "utf8")
		.split("\n")
		.filter((line) => line.trim())
		.map((line) => JSON.parse(line));

	const byId = new Map(docs.map((doc) => [doc._id, doc]));
	const published = (type) => docs.filter((doc) => doc._type === type && !doc._id.startsWith("drafts."));

	const image = (value) => {
		if (!value) return null;
		const source = resolveAssetSource(value, { baseDir, byId, projectId, dataset });
		if (!source) return null;
		return { ...source, alt: value.alt, caption: value.caption };
	};
	const body = (blocks) =>
		Array.isArray(blocks)
			? blocks.map((block) =>
					block._type === "image" || block._type === "imageWithCaption"
						? { ...block, ...resolveAssetSource(block, { baseDir, byId, projectId, dataset }) }
						: block,
				)
			: blocks;
	const seo = (value) =>
		value
			? {
					title: value.title,
					description: value.description,
					canonicalUrl: value.canonicalUrl,
					ogImage: value.ogImage ? image(value.ogImage)?.url : undefined,
				}
			: undefined;

	return normalize({
		authors: published("author").map((doc) => ({ ...doc, slug: doc.slug?.current, avatar: image(doc.avatar) })),
		categories: published("category").map((doc) => ({ ...doc, slug: doc.slug?.current })),
		tags: published("tag").map((doc) => ({ ...doc, slug: doc.slug?.current })),
		posts: published("post").map((doc) => ({
			...doc,
			slug: doc.slug?.current,
			coverImage: image(doc.coverImage),
			body: body(doc.body),
			author: doc.author?._ref,
			categories: (doc.categories ?? []).map((ref) => ref._ref),
			seo: seo(doc.seo),
		})),
		pages: published("page").map((doc) => ({
			...doc,
			slug: doc.slug?.current,
			body: body(doc.body),
			seo: seo(doc.seo),
		})),
	});
}

function locateExport(inputPath) {
	if (!existsSync(inputPath)) throw new Error(`見つかりません: ${inputPath}`);
	if (statSync(inputPath).isDirectory()) {
		const direct = join(inputPath, "data.ndjson");
		if (existsSync(direct)) return { ndjsonPath: direct, baseDir: inputPath };
		throw new Error(`${inputPath} に data.ndjson がありません`);
	}
	if (/\.(tar\.gz|tgz)$/.test(inputPath)) {
		const dir = mkdtempSync(join(tmpdir(), "sanity-export-"));
		execFileSync("tar", ["-xzf", inputPath, "-C", dir]);
		const found = execFileSync("find", [dir, "-name", "data.ndjson"], { encoding: "utf8" }).trim().split("\n")[0];
		if (!found) throw new Error("エクスポートの中に data.ndjson がありません");
		return { ndjsonPath: found, baseDir: dirname(found) };
	}
	return { ndjsonPath: inputPath, baseDir: dirname(inputPath) };
}

/** 画像の参照から実体（URL かローカルファイル）を求める */
function resolveAssetSource(value, { baseDir, byId, projectId, dataset }) {
	// `sanity dataset export` は画像を images/ に同梱し、参照を _sanityAsset に書き換える
	if (typeof value._sanityAsset === "string") {
		const match = value._sanityAsset.match(/^(?:image|file)@(.+)$/);
		if (match) {
			const location = match[1];
			if (location.startsWith("file://")) return { file: resolve(baseDir, location.slice("file://".length)) };
			return { url: location };
		}
	}
	if (typeof value.url === "string") return { url: value.url };

	const ref = value.asset?._ref;
	if (!ref) return null;
	const assetDoc = byId.get(ref);
	if (assetDoc?.url) return { url: assetDoc.url };
	// image-<hash>-<w>x<h>-<ext>
	const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
	if (match && projectId && dataset) {
		return { url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${match[1]}-${match[2]}.${match[3]}` };
	}
	console.warn(`  ⚠️ 画像 ${ref} の場所がわかりません（--project-id を指定すると CDN から取得します）`);
	return null;
}

// ---------------------------------------------------------------------------
// 共通形式
// ---------------------------------------------------------------------------

function normalize({ authors, categories, tags, posts, pages }) {
	const slugify = (value) =>
		String(value)
			.normalize("NFKC")
			.toLowerCase()
			.trim()
			.replace(/[^\p{Letter}\p{Number}]+/gu, "-")
			.replace(/^-+|-+$/g, "");

	const tagList = tags.filter((tag) => tag.slug).map((tag) => ({ slug: tag.slug, label: tag.title ?? tag.slug, description: tag.description }));
	const tagLookup = new Map();
	for (const tag of tagList) {
		tagLookup.set(tag.slug, tag);
		tagLookup.set(tag.label.toLowerCase(), tag);
	}
	// 記事のタグは文字列で持っているので、タグ文書のスラッグかタイトルに突き合わせる
	const resolveTag = (value) => {
		const found = tagLookup.get(value) ?? tagLookup.get(String(value).toLowerCase());
		if (found) return found.slug;
		const created = { slug: slugify(value), label: value };
		tagList.push(created);
		tagLookup.set(created.slug, created);
		tagLookup.set(String(value).toLowerCase(), created);
		return created.slug;
	};

	const categoryById = new Map(categories.map((cat) => [cat._id, cat]));

	return {
		authors: authors
			.filter((author) => author.slug)
			.map((author) => ({
				id: author._id,
				slug: author.slug,
				name: author.name ?? author.slug,
				role: author.role,
				bio: author.bio,
				avatar: author.avatar ?? null,
			})),
		categories: categories
			.filter((cat) => cat.slug)
			.map((cat) => ({ slug: cat.slug, label: cat.title ?? cat.slug, description: cat.description })),
		tags: tagList,
		posts: posts
			.filter((post) => post.slug)
			.map((post) => ({
				id: post._id,
				slug: post.slug,
				title: post.title ?? "",
				excerpt: post.excerpt ?? "",
				publishedAt: post.publishedAt ?? post._createdAt ?? null,
				createdAt: post._createdAt ?? post.publishedAt ?? null,
				revisedAt: post.updatedAt ?? null,
				featured: Boolean(post.featured),
				popularScore: typeof post.popularScore === "number" ? Math.round(post.popularScore) : 0,
				bodyMarkdown: typeof post.bodyMarkdown === "string" ? post.bodyMarkdown : "",
				body: Array.isArray(post.body) ? post.body : [],
				coverImage: post.coverImage ?? null,
				authorId: post.author ?? null,
				categories: (post.categories ?? []).map((id) => categoryById.get(id)?.slug).filter(Boolean),
				tags: (post.tags ?? []).filter(Boolean).map(resolveTag),
				seo: post.seo ?? null,
			})),
		pages: pages
			.filter((page) => page.slug)
			.map((page) => ({
				id: page._id,
				slug: page.slug,
				title: page.title ?? "",
				createdAt: page._createdAt ?? null,
				bodyMarkdown: typeof page.bodyMarkdown === "string" ? page.bodyMarkdown : "",
				body: Array.isArray(page.body) ? page.body : [],
				seo: page.seo ?? null,
			})),
	};
}
