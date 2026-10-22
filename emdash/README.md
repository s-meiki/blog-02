# blog-02 on EmDash（試作）

Sanity + Next.js で動いている現行ブログ（`../web`, `../studio`）を、Cloudflare の [EmDash](https://emdashcms.com) に移すための試作です。
EmDash 公式の `blog-cloudflare` テンプレートをもとに、次の点を変えています。

- UI を日本語化し、フォントを Noto Sans JP に変更
- URL を現行サイトに合わせた（記事は `/blog/{slug}`、固定ページは `/{slug}`）
- スキーマ（`seed/seed.json`）を現行の Sanity に合わせた（リード文・カバー画像・更新日・特集・人気スコア・カテゴリ・タグ）
- Sanity からの移行スクリプト `scripts/import-sanity.mjs` を追加

現行の `web/` と `studio/` には手を入れていないので、試作と並行して今のブログはそのまま動きます。

## ローカルで動かす

```bash
cd emdash
npm install
npm run dev
```

- サイト: http://localhost:4321
- 管理画面: http://localhost:4321/_emdash/admin（ローカルでは「Dev bypass」でログインできます）

初回アクセス時にデータベース（ローカルの D1）が作られ、`seed/seed.json` のスキーマが適用されます。

## Sanity の記事を取り込む

開発サーバーを起動したまま、別のターミナルで実行します。何度実行しても同じスラッグの記事を上書きするだけなので、やり直しができます。

### サンプルデータで試す

```bash
npm run import:sanity -- --ndjson scripts/fixtures/sample-export
```

### 本物の記事を取り込む（どちらか）

**A. Sanity の API から直接取り込む**

```bash
SANITY_PROJECT_ID=xxxxxxxx SANITY_DATASET=production SANITY_READ_TOKEN=sk... \
  npm run import:sanity
```

`SANITY_READ_TOKEN` は sanity.io/manage の「API → Tokens」で発行する Viewer 権限のトークンです（データセットが公開なら不要）。

**B. エクスポートファイルから取り込む**

```bash
cd ../studio && npx sanity dataset export production ../sanity-export.tar.gz
cd ../emdash && npm run import:sanity -- --ndjson ../sanity-export.tar.gz
```

書き込まずに変換結果だけ確認したいときは `--dry-run` を付けます（`.emdash/sanity-import-preview.json` に出力）。

### 移行される内容

| Sanity | EmDash |
| --- | --- |
| 記事 (`post`) | `posts` コレクション。公開日・スラッグ・リード文・カバー画像・SEO（タイトル/説明/カノニカル）を引き継ぎ |
| 本文 (`bodyMarkdown`) | Portable Text に変換。見出し・リスト・表・コード・引用・画像・YouTube/X の URL 単独行（埋め込み）に対応 |
| 旧リッチテキスト本文 (`body`) | Markdown が空の記事のみ使用。画像・コード・YouTube/X 埋め込みを EmDash のブロックに変換 |
| 固定ページ (`page`) | `pages` コレクション（`/{slug}` で表示） |
| カテゴリ / タグ | `category` / `tag` タクソノミー |
| 著者 (`author`) | バイライン（名前・プロフィール・アバター） |
| 画像 | EmDash のメディアライブラリにアップロード |

下書き（`drafts.` で始まる文書）は取り込みません。

## Cloudflare に公開する

1. Cloudflare にログインしてデプロイします。

   ```bash
   npx wrangler login
   npm run deploy
   ```

   `wrangler.jsonc` の D1（`blog-02`）と R2（`blog-02-media`）は初回デプロイ時に自動で作られます。
   作られなかった場合は `npx wrangler d1 create blog-02` / `npx wrangler r2 bucket create blog-02-media` で作り、
   表示された `database_id` を `wrangler.jsonc` に追記してから再度デプロイしてください。
2. 公開された URL の `/_emdash/admin` を開き、管理者アカウントを作成します（パスキーでログインします）。
3. 管理画面の設定（Settings）→ API トークンでトークンを発行し、本番に記事を取り込みます。

   ```bash
   EMDASH_URL=https://blog-02.<あなたのサブドメイン>.workers.dev EMDASH_TOKEN=ec_pat_... \
   SANITY_PROJECT_ID=xxxxxxxx SANITY_READ_TOKEN=sk... npm run import:sanity
   ```

## 現行サイトから未移植の機能

試作では EmDash テンプレートの標準機能に寄せています。本移行の前に次を移植する予定です。

- お問い合わせフォーム（`/contact`、Turnstile + Webhook）
- プロフィールページ（`/profile`）、著者ページ（`/author/{slug}`）
- OG 画像の自動生成（`/api/og`）、人気記事、Google Analytics
- 記事の自動分類（Hugging Face）
- 現行サイトのデザイン（色・レイアウト）。今はテンプレートのデザインのままです
- `/feed.xml` → `/rss.xml` などの URL 変更のリダイレクト

Sanity の Webhook による再生成（`/api/revalidate`）とプレビュー（`/api/preview`）は、EmDash ではリクエスト時に描画されるため不要になります。
