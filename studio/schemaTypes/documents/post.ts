import { defineField, defineType } from "sanity";
import { isUniqueAcrossAllDocuments } from "../../lib/isUnique";

export default defineType({
  name: "post",
  title: "記事",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueAcrossAllDocuments,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "リード文",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "coverImage",
      title: "カバー画像",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "代替テキスト",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bodyMarkdown",
      title: "本文",
      type: "markdown",
      description:
        "Markdown形式で本文を編集します。エディタ右下のアイコンでプレビュー表示に切り替えられます。",
      options: {
        preview: true,
        imageUrl: (asset) => `${asset.url}?w=1200`,
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const document = context.document as { body?: unknown[] | null };
          const hasLegacy = Array.isArray(document?.body) && document.body.length > 0;
          if (typeof value === "string" && value.trim().length > 0) {
            return true;
          }
          if (hasLegacy) {
            return true;
          }
          return "本文を入力してください。";
        }),
    }),
    defineField({
      name: "body",
      title: "本文（旧リッチテキスト）",
      type: "blockContent",
      description: "過去の記事でリッチテキスト保存された本文です。必要に応じてMarkdown欄へコピーしてください。",
      readOnly: true,
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({ document }) => {
        const legacyBody = (document as { body?: unknown[] | null } | undefined)?.body;
        if (Array.isArray(legacyBody)) {
          return legacyBody.length === 0;
        }
        return !legacyBody;
      },
    }),
    defineField({
      name: "publishedAt",
      title: "公開日時",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "更新日時",
      type: "datetime",
    }),
    defineField({
      name: "readingTime",
      title: "想定読了時間 (分)",
      type: "number",
      validation: (rule) => rule.min(1).max(60),
    }),
    defineField({
      name: "author",
      title: "著者",
      type: "reference",
      to: [{ type: "author" }],
      initialValue: async ({ getClient }) => {
        try {
          const client = getClient({ apiVersion: "2023-10-01" });
          const authorId =
            (await client.fetch<string | null>(
              `*[_type == "author" && (slug.current == $slug || name == $name)][0]._id`,
              { slug: "meiki", name: "meiki" },
            )) ?? null;

          if (!authorId) return undefined;

          return {
            _type: "reference",
            _ref: authorId,
          };
        } catch (error) {
          console.warn("Failed to resolve default author", error);
          return undefined;
        }
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "カテゴリ",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "tags",
      title: "タグ",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featured",
      title: "特集表示",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "popularScore",
      title: "人気スコア",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      publishedAt: "publishedAt",
    },
    prepare: ({ title, media, publishedAt }) => ({
      title,
      subtitle: publishedAt
        ? new Date(publishedAt).toLocaleDateString("ja-JP")
        : "未公開",
      media,
    }),
  },
  orderings: [
    {
      title: "公開日 (新しい順)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "人気順",
      name: "popularScoreDesc",
      by: [{ field: "popularScore", direction: "desc" }],
    },
  ],
});
