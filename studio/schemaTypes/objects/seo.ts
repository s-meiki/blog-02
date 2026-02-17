import { defineField, defineType } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "description",
      title: "ディスクリプション",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "ogImage",
      title: "OG 画像",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "代替テキスト",
          type: "string",
          validation: (rule) => rule.max(120),
        }),
      ],
    }),
    defineField({
      name: "canonicalUrl",
      title: "カノニカル URL",
      type: "url",
    }),
  ],
});
