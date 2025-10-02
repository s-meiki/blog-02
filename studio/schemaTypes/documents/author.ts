import { defineField, defineType } from "sanity";
import { isUniqueAcrossAllDocuments } from "../../lib/isUnique";

export default defineType({
  name: "author",
  title: "著者",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "氏名",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
        isUnique: isUniqueAcrossAllDocuments,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "プロフィール画像",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "代替テキスト",
          validation: (rule) => rule.required().max(120),
        }),
      ],
    }),
    defineField({
      name: "role",
      title: "肩書き",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "プロフィール",
      type: "blockContent",
    }),
    defineField({
      name: "socialLinks",
      title: "SNS リンク",
      type: "array",
      of: [
        defineField({
          name: "socialLink",
          type: "object",
          title: "リンク",
          fields: [
            defineField({
              name: "platform",
              title: "プラットフォーム",
              type: "string",
              options: {
                list: [
                  { title: "X (Twitter)", value: "twitter" },
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Web サイト", value: "website" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "avatar",
      subtitle: "role",
    },
  },
});
