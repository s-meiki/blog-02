This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Hugging Face 推論 API の利用

記事本文からカテゴリやタグ候補を抽出するための API エンドポイント (`/api/classify`) を用意しています。利用するには Hugging Face のアクセストークンを環境変数に設定してください。

1. プロジェクト直下で `.env.local` を作成し、以下を追加します。
   ```bash
   HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
   ```
   ※ 共有リポジトリには **絶対にコミットしない** でください。必要に応じて `web/.env.example` を参考にしてください。

2. 任意でモデルを変更する場合は以下を設定します。
   ```bash
   HF_ZERO_SHOT_MODEL=joeddav/xlm-roberta-large-xnli
   HF_KEYWORD_MODEL=ml6team/keyphrase-extraction-kbir-inspec
   ```

3. API の利用例（カテゴリ分類）:
   ```bash
   curl -X POST http://localhost:3000/api/classify \
     -H "Content-Type: application/json" \
     -d '{
       "text": "記事本文をここに入れてください。",
       "candidateLabels": ["テクノロジー", "デザイン", "お知らせ"],
       "multiLabel": true,
       "topK": 3
     }'
   ```

4. タグ候補（キーフレーズ抽出）:
   ```bash
   curl -X POST http://localhost:3000/api/classify \
     -H "Content-Type: application/json" \
     -d '{
       "text": "記事本文をここに入れてください。",
       "task": "keywords",
       "topK": 5
     }'
   ```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
