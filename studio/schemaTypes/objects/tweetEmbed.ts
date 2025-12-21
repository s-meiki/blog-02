import { defineField, defineType } from "sanity";

const twitterUrlPattern = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]+\/status\/[0-9]+/i;

export default defineType({
  name: "tweetEmbed",
  title: "X (Twitter) 埋め込み",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "ツイート URL",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["http", "https"] })
          .custom((value) => {
            if (!value) return true;
            return twitterUrlPattern.test(value) ? true : "Twitter(X) のツイート URL を入力してください";
          }),
      description: "https://x.com/... 形式の URL を入力してください。",
    }),
  ],
  preview: {
    select: { url: "url" },
    prepare: ({ url }) => ({
      title: "X (Twitter) 埋め込み",
      subtitle: url ?? "URL が設定されていません",
    }),
  },
});
