import { defineField, defineType } from "sanity";
import { isUniqueAcrossAllDocuments } from "../../lib/isUnique";

export default defineType({
  name: "page",
  title: "固定ページ",
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
      name: "bodyMarkdown",
      title: "本文",
      type: "markdown",
      description: "Markdown形式で本文を編集します。エディタ右下のアイコンでプレビュー表示に切り替えられます。",
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
      description: "過去のリッチテキスト本文です。必要に応じてMarkdown欄へコピーして整形してください。",
      readOnly: true,
      options: {
        collapsible: true,
        collapsed: true,
      },
      hidden: ({ document }) => {
        const legacy = (document as { body?: unknown[] | null } | undefined)?.body;
        if (Array.isArray(legacy)) {
          return legacy.length === 0;
        }
        return !legacy;
      },
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
      subtitle: "slug.current",
    },
  },
});
