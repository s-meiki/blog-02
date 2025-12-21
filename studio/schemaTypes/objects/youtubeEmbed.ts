import { defineField, defineType } from "sanity";

const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(?:[&?#].*)?$/i;

export default defineType({
  name: "youtubeEmbed",
  title: "YouTube 埋め込み",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "動画 URL",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["http", "https"] })
          .custom((value) => {
            if (!value) return true;
            return youtubePattern.test(value) ? true : "YouTube の動画 URL を入力してください";
          }),
      description: "https://www.youtube.com/watch?v=... または https://youtu.be/... の形式で入力してください。",
    }),
    defineField({
      name: "title",
      title: "表示タイトル (任意)",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: { title: "title", url: "url" },
    prepare: ({ title, url }) => ({
      title: title || "YouTube 埋め込み",
      subtitle: url ?? "URL が設定されていません",
    }),
  },
});
