import { defineField, defineType } from "sanity";

export default defineType({
  name: "codeBlock",
  title: "コード",
  type: "object",
  fields: [
    defineField({
      name: "language",
      title: "言語",
      type: "string",
      options: {
        list: [
          { title: "TypeScript", value: "typescript" },
          { title: "JavaScript", value: "javascript" },
          { title: "JSON", value: "json" },
          { title: "Shell", value: "bash" },
          { title: "CSS", value: "css" },
          { title: "HTML", value: "html" },
          { title: "Markdown", value: "markdown" },
        ],
      },
    }),
    defineField({
      name: "code",
      title: "コード",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "filename",
      title: "ファイル名",
      type: "string",
    }),
  ],
});
