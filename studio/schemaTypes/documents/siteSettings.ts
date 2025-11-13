import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "サイト設定",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "サイトタイトル",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "siteDescription",
      title: "説明",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "hero",
      title: "ヒーローセクション",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "アイキャッチテキスト",
          type: "string",
          description: "Hero の小ラベル。例: Journal / Insights など。",
        }),
        defineField({
          name: "primaryCta",
          title: "メイン CTA",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "ボタンラベル",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "リンク先",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
        defineField({
          name: "secondaryCta",
          title: "サブ CTA",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "ボタンラベル",
              type: "string",
            }),
            defineField({
              name: "href",
              title: "リンク先",
              type: "string",
            }),
          ],
        }),
        defineField({
          name: "metrics",
          title: "メトリクス",
          type: "array",
          of: [
            defineField({
              name: "metric",
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  title: "ラベル",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "value",
                  title: "値",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "backgroundPreset",
          title: "背景演出",
          type: "string",
          initialValue: "glow",
          options: {
            layout: "radio",
            list: [
              { title: "なし", value: "none" },
              { title: "ソフトグロー", value: "glow" },
              { title: "ビビッド", value: "vibrant" },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: "popularWidget",
      title: "人気記事ウィジェット",
      type: "object",
      fields: [
        defineField({
          name: "showTimeline",
          title: "タイムライン装飾を表示",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "accentColor",
          title: "アクセントカラー",
          type: "string",
          description: "例: #2563eb",
        }),
        defineField({
          name: "headerImage",
          title: "ヘッダー画像",
          type: "image",
          description: "人気記事セクションの見出し横に表示されます。",
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
      ],
    }),
    defineField({
      name: "siteUrl",
      title: "サイト URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "ロゴ",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "defaultOGImage",
      title: "デフォルト OG 画像",
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
      name: "contactEmail",
      title: "連絡先メール",
      type: "string",
    }),
    defineField({
      name: "navigation",
      title: "ナビゲーション",
      type: "array",
      of: [
        defineField({
          name: "navItem",
          title: "リンク",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "ラベル",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "external",
              title: "外部リンク",
              type: "boolean",
              initialValue: false,
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "footerLinks",
      title: "フッターリンク",
      type: "array",
      of: [
        defineField({
          name: "footerLink",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "ラベル",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "SNS リンク",
      type: "array",
      of: [
        defineField({
          name: "socialLink",
          type: "object",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              title: "プラットフォーム",
              options: {
                list: [
                  { title: "X (Twitter)", value: "twitter" },
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "RSS", value: "rss" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              type: "url",
              title: "URL",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "engagementCta",
      title: "エンゲージメント CTA",
      type: "object",
      fields: [
        defineField({
          name: "badge",
          title: "バッジ",
          type: "string",
        }),
        defineField({
          name: "title",
          title: "タイトル",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "description",
          title: "説明",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "primaryCta",
          title: "メイン CTA",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "ラベル",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "リンク先",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
        defineField({
          name: "secondaryCta",
          title: "サブ CTA",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "ラベル",
              type: "string",
            }),
            defineField({
              name: "href",
              title: "リンク先",
              type: "string",
            }),
          ],
        }),
        defineField({
          name: "socialProof",
          title: "ソーシャルプルーフ",
          type: "array",
          of: [
            defineField({
              name: "proof",
              type: "object",
              fields: [
                defineField({ name: "label", type: "string", title: "ラベル" }),
                defineField({ name: "value", type: "string", title: "値" }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "siteTitle",
      subtitle: "siteDescription",
    },
  },
});
