import { defineField, defineType } from "sanity";

export default defineType({
  name: "imageWithCaption",
  title: "画像",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "代替テキスト",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "caption",
      title: "キャプション",
      type: "string",
    }),
    defineField({
      name: "credit",
      title: "クレジット",
      type: "string",
    }),
  ],
});
