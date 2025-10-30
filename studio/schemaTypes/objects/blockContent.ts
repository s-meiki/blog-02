import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "blockContent",
  title: "本文",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      marks: {
        annotations: [
          defineType({
            name: "link",
            type: "object",
            title: "リンク",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) => rule.uri({ allowRelative: true }),
              }),
              defineField({
                name: "openInNewWindow",
                type: "boolean",
                title: "新しいタブで開く",
                initialValue: false,
              }),
            ],
          }),
        ],
      },
      styles: [
        { title: "通常", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "引用", value: "blockquote" },
      ],
      lists: [
        { title: "番号付き", value: "number" },
        { title: "ドット", value: "bullet" },
      ],
    }),
    defineArrayMember({
      type: "imageWithCaption",
    }),
    defineArrayMember({
      type: "codeBlock",
    }),
    defineArrayMember({
      type: "tweetEmbed",
    }),
    defineArrayMember({
      type: "youtubeEmbed",
    }),
  ],
});
