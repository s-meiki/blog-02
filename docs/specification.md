# Sanity Blog Specification Summary

## プロジェクト概要
- Sanity を headless CMS として利用し、日本語ブログを Next.js 13 App Router + TypeScript + Tailwind CSS で構築。
- Vercel へデプロイし、全ページを SSG/ISR で配信。記事一覧・詳細・カテゴリ/タグ/著者・固定ページ・検索・人気/関連記事・目次・OGP・サイトマップなどを実装。
- SEO 最適化（構造化データ、OGP 自動生成、サイトマップ、Lighthouse 90+ を目標）。

## Sanity コンテンツモデル
- `post`: タイトル、スラッグ、抜粋、本文 (Portable Text)、カバー画像、公開/更新日時、読み時間、著者、カテゴリ、タグ、featured、popularScore、SEO メタ情報。
- `category` / `tag` / `author`: タイトル・スラッグ・説明やプロフィール・SNS リンクなど必要項目を保持。
- `page`: `/about` `/contact` などの固定ページを管理。
- `siteSettings`: サイト共通情報、ナビゲーション、SNS、OG 画像、ロゴを一元管理。
- Portable Text は見出し、画像、コード、引用などをサポート。画像には必ず alt を設定し、公開日は未来日時を除外。

## Next.js 構成
- App Router 下で `/` `/blog` `/blog/[slug]` `/category/[slug]` `/tag/[slug]` `/author/[slug]` `/about` `/contact` を構築し、`generateStaticParams` + ISR で再生成。
- 検索とページネーションは GROQ によるサーバサイド処理。人気記事・関連記事・目次を再利用コンポーネントとして提供。
- `/sitemap.xml` `/feed.xml` `/robots.txt` `/api/og` `/api/revalidate` を用意。Sanity Webhook で revalidate。
- `generateMetadata` と JSON-LD (BlogPosting / Breadcrumb / WebSite) で SEO を実装。

## データフローと ISR
- `lib/sanity.client.ts` + `cachedFetch` で GROQ クエリを共通化し、公開日時フィルタと必要フィールド抽出を徹底。
- トップ/一覧/詳細は 60–120 秒、固定ページは 1 時間、サイトマップは 1 日で ISR リバリデート。
- `revalidateTag` と `/api/revalidate` を組み合わせ、Sanity 更新を迅速に反映。Portable Text から目次を生成し、人気記事/関連記事クエリを提供。

## SEO / OGP
- 各ページで title/description/canonical/OG/Twitter を算出。記事ページでは BlogPosting JSON-LD と Breadcrumb JSON-LD を注入。
- `/api/og` でタイトルや著者情報を用いた OGP 画像を自動生成。
- サイトマップ、robots、RSS を配信し、画像最適化と CLS 回避で Lighthouse 90+ を狙う。

## Tailwind デザイン
- ダークブルーを基調にアクセントブルーを追加。フォントは `Inter` + `Noto Sans JP`。
- `container` `section` `card` などのユーティリティと Typography プラグインを活用し、Portable Text 表現を整形。
- モバイルファーストで `lg` 以上は 2 カラム、`sticky` サイドバー、検索モーダル、TOC アコーディオンなどレスポンシブ対応。
- focus-visible と色コントラストを確保し、アクセシビリティを担保。

## 運用 / 開発
- 環境変数 (`SANITY_*`, `NEXT_PUBLIC_SITE_URL` など) を設定し、ESLint + Prettier + Tailwind で品質を維持。
- Vercel デプロイ後、Sanity Studio から公開すると Webhook が発火し ISR を再実行。
- リリース前には構造化データテスト、OG カード、Lighthouse 計測を実施。

---

## Sanity スキーマ詳細サンプル

### ドキュメント構成
- `post`: タイトル、スラッグ、本文、画像、公開/更新日時、読み時間、著者参照、カテゴリ参照、タグ、注目フラグ、人気スコア、SEO メタ。
- `category` / `tag`: タイトル、スラッグ、説明、SEO メタ (カテゴリのみ)。
- `author`: 氏名、スラッグ、アバター、肩書き、プロフィール (Portable Text)、SNS リンク。
- `page`: 固定ページ用のタイトル、スラッグ、本文、SEO メタ。
- `siteSettings`: サイトタイトル、説明、サイト URL、ロゴ、OG 画像、ナビ/フッターリンク、SNS リンク、連絡先。

### コード例 (`post`)
```ts
import { defineType, defineField } from "sanity";
import { isUniqueAcrossAllDocuments } from "../lib/isUnique";

export default defineType({
  name: "post",
  type: "document",
  title: "Blog Post",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: rule => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueAcrossAllDocuments,
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      validation: rule => rule.required().max(200),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          validation: rule => rule.required().max(120),
        }),
      ],
      validation: rule => rule.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        { type: "block" },
        { type: "imageWithCaption" },
        { type: "codeBlock" },
      ],
      validation: rule => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      type: "datetime",
    }),
    defineField({
      name: "readingTime",
      type: "number",
      validation: rule => rule.min(1).max(60),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      validation: rule => rule.required(),
    }),
    defineField({
      name: "categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: rule => rule.min(1),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "popularScore",
      type: "number",
      initialValue: 0,
      validation: rule => rule.min(0).max(100),
    }),
    defineField({
      name: "seo",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      publishedAt: "publishedAt",
    },
    prepare: ({ title, media, publishedAt }) => ({
      title,
      subtitle: publishedAt
        ? new Date(publishedAt).toLocaleDateString("ja-JP")
        : "未公開",
      media,
    }),
  },
  orderings: [
    {
      title: "公開日 (新しい順)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "人気順",
      name: "popularScoreDesc",
      by: [{ field: "popularScore", direction: "desc" }],
    },
  ],
});
```

### 実装メモ
- 画像オブジェクト (`imageWithCaption`) には caption / credit を付与し、Portable Text レンダリング時に利用。
- `seo` オブジェクトは共通スキーマとして切り出し、title/description/ogImage/canonicalUrl を保持。
- Sanity Structure Builder で `siteSettings` をシングルトン化し、Studio のナビゲーションから直接編集できるようにする。
- 将来拡張 (CTA / シリーズ / メタ情報) を Portable Text のカスタムブロックで追加しやすいよう、`blockContent.ts` にコンポーネント定義を集約。

---

## Next.js ルーティング & データフロー詳細

### ディレクトリ構造 (抜粋)
```
app/
  layout.tsx
  globals.css
  page.tsx
  blog/
    page.tsx
    [slug]/page.tsx
  category/[slug]/page.tsx
  tag/[slug]/page.tsx
  author/[slug]/page.tsx
  about/page.tsx
  contact/page.tsx
  sitemap.xml/route.ts
  robots.txt/route.ts
  feed.xml/route.ts
  api/
    og/route.ts
    revalidate/route.ts
components/
lib/
  sanity.client.ts
  sanity.server.ts
  queries.ts
  metadata.ts
  structured-data.ts
```

### ページ別仕様
- `/`: 最新記事 6 件、人気記事 3 件、カテゴリ一覧を表示。`revalidate = 120`。
- `/blog`: 検索・タグ/カテゴリフィルタ・ページネーション (10 件/ページ) を実装。`revalidate = 60`。
- `/blog/[slug]`: 記事詳細を表示し、Portable Text 本文、目次、関連記事、人気記事サイドバー、SNS シェアを提供。`generateStaticParams` + `revalidate = 60`。
- `/category/[slug]` `/tag/[slug]` `/author/[slug]`: 各エンティティ情報と記事一覧 (ページネーション可)。`revalidate = 120`。
- `/about` `/contact`: 固定ページ (`page` ドキュメント) を SSG。`revalidate = 3600`。
- `/sitemap.xml` `/feed.xml` `/robots.txt`: GROQ で取得したスラッグからドキュメントを生成し、`revalidate = 86400`。

### データアクセス
- `lib/sanity.client.ts` で Sanity クライアントを生成し CDN を活用。必要に応じて `token` を設定。
- `lib/sanity.server.ts` で `cache` + `fetch` をラップし、ISR のタグ管理 (`next: { revalidate, tags }`) を実装。
- GROQ クエリは `lib/queries.ts` に集約し、一覧用・詳細用・人気/関連記事用の projection を定義。

```ts
export const paginatedPostsQuery = `
  *[_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()
     && (!defined($query) || title match $pattern || excerpt match $pattern || $query in tags)
     && (!defined($category) || $category in categories[]->slug.current)
     && (!defined($tag) || $tag in tags)
  ] | order(publishedAt desc) [$offset...$offset + $limit - 1] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    readingTime,
    "coverImage": coverImage{..., asset->},
    "author": author->{name, "slug": slug.current, "avatar": avatar.asset->url},
    "categories": categories[]->{title, "slug": slug.current},
    tags,
    popularScore
  }
`;
```

### API ルート
- `/api/og`: Edge Runtime で `@vercel/og` を利用し、記事タイトル・カテゴリ・著者を描画した OGP 画像を生成。`slug` が存在しない場合はデフォルト画像を返す。
- `/api/revalidate`: Sanity Webhook から受信した slug/type をもとに `revalidateTag` / `revalidatePath` を実行。シークレットトークンで保護。
- `/sitemap.xml`: サイトの静的ルートと Sanity の公開ドキュメントを列挙し XML を返す。`priority` / `changefreq` を記事・固定ページで調整。
- `/feed.xml`: RSS/Atom を生成し最新記事 20 件を配信 (任意だが仕様に含める)。

### SEO・構造化データ・ISR
- `generateMetadata` を各ページに実装し、`siteSettings` のデフォルトをマージ。Canonical・OG・Twitter・article meta を設定。
- `lib/structured-data.ts` で BlogPosting/Breadcrumb/WebSite JSON-LD を組み立て、記事詳細では `<Script type="application/ld+json">` で出力。
- `revalidate` 時間はトップ/一覧/詳細で 60–120 秒、固定ページは 3600 秒、サイトマップは 86400 秒。
- Sanity Webhook + `revalidateTag` で変更を即時反映。公開待ち (未来日時) の記事は GROQ フィルタ `publishedAt <= now()` で除外。

### UI 補足
- 目次は Portable Text からサーバサイドで heading 配列を生成し、クライアントコンポーネントでスクロール連動。
- 検索フォームはモーダル + `/blog` ページのクエリパラメータを更新する方式 (`router.replace`)。
- 人気記事・関連記事・タグクラウド・シェアボタンなどを専用コンポーネントとして `components/blog` 以下に配置し再利用性を高める。

### Tailwind コンポーネント指針
- **レイアウト**: `Container` (`max-w-container mx-auto px-4 sm:px-6 lg:px-8`)、`Section` (`py-12 sm:py-16 lg:py-20`)、`Grid` (`grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]`) をプリミティブ化。
- **UI パターン**: `Card` (`bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-200`)、`Badge` (`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium`)、`Button` (`inline-flex items-center justify-center rounded-full px-5 py-2.5 font-semibold`).
- **ヘッダー/フッター**: Header は `sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-100`、Footer は `bg-neutral-900 text-neutral-100 py-12` で 3 カラム (`grid gap-8 sm:grid-cols-2 lg:grid-cols-3`)。
- **記事カード**: 画像は `aspect-[16/9] overflow-hidden rounded-2xl`, 本文は `space-y-3`. メタ情報は `text-sm text-neutral-500 flex items-center gap-3`。
- **サイドバー**: `lg:sticky lg:top-24 space-y-8`, モバイルでは `mt-12 space-y-6`。
- **TOC**: Desktop は `hidden lg:block`, `border border-neutral-200 rounded-xl p-4 text-sm`. モバイルは `<details>` 風 (`lg:hidden`, `bg-white border rounded-lg`)

### レスポンシブ挙動
- `sm (<640px)`: 単一カラム。Header はハンバーガー + スライドインメニュー (`Dialog`). TOC とサイドバーはメインコンテンツ下に配置。
- `md (≥768px)`: 記事カード 2 カラム (`grid-cols-2`)、Hero レイアウトはテキスト中心 + 装飾背景。ナビは横並びが可能なら表示。
- `lg (≥1024px)`: メイン + サイドバーの 2 カラム固定。Hero は 2 カラム (`grid-cols-2`)、TOP 人気記事をサイドで表示。
- `xl (≥1280px)`: 余白を広げ、ヒーロー背景にグラデーション (CSS pseudo) を追加。テキストサイズをやや拡大 (`text-4xl`).

### カラーパレット
| Token | 値 | 用途 |
|-------|-----|------|
| `primary-600` | `#2563EB` | CTA ボタン、リンク hover、アクティブタグ |
| `primary-800` | `#1E3A8A` | ヘッダーテキスト、強調背景 |
| `neutral-50` | `#F8FAFC` | ボディ背景 |
| `neutral-900` | `#0F172A` | ダーク背景 (フッター) |
| `accent-300` | `#7DD3FC` | 装飾ライン、マイクロインタラクション |

### タイポグラフィ設定
- ベースフォントサイズ `16px`, 行間 `1.7`. `font-sans` を全体に適用し、見出しは `font-display`。
- Portable Text 用 `.prose` を `@layer components` でカスタム：`h2` `mt-10 mb-4 text-2xl font-semibold`, `blockquote` `border-l-4 border-primary-500 pl-4 italic bg-primary-50`, `pre` `bg-neutral-900 text-neutral-50 rounded-xl p-4 overflow-x-auto`。
- コードインライン (`code`) は `bg-neutral-100 px-1.5 py-0.5 rounded`。

### アクセシビリティ & モーション
- `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2` をボタン/リンクに適用。
- スキップリンク (`<a href="#main" className="sr-only focus:not-sr-only">`) を Header 先頭に配置。
- `prefers-reduced-motion` を尊重し、モーションは `transition-opacity/transform` 程度で 200ms 以下。
- 色コントラストは AA 以上を維持。背景が `primary-600` の場合は文字色を `white` に固定。

### インタラクション仕様
- Hover: カードが `translate-y-[-2px]` + `shadow-soft`, ボタンは `bg-primary-500` に遷移。
- Active: `scale-95` を付与しクリック感を出す (`transition-transform duration-100`).
- モバイルナビ: `Dialog` で `aria-modal` を設定、閉じるボタン (`X` アイコン) に `aria-label` を付与。
- 目次: 現在位置を Intersection Observer で監視し、active な項目に `text-primary-600 font-semibold` を付与。

### 再利用コンポーネント一覧
- `Header`, `Footer`, `MobileNav`, `SearchDialog`, `SkipLink`
- `ArticleCard`, `FeaturedArticle`, `PostMeta`, `TagBadge`, `CategoryBadge`
- `TableOfContents`, `ShareButtons`, `PopularPosts`, `RelatedPosts`
- `AuthorCard`, `Breadcrumbs`, `Pagination`, `EmptyState`, `LoadingSkeleton`
- `PortableTextRenderer` (ブロック/マーク/タイプ別コンポーネント), `CodeBlock`, `ImageFigure`

---

## 実装ロードマップ
1. **プロジェクト初期化**: `create-next-app` (App Router + TypeScript) で雛形作成、Tailwind/ESLint/Prettier をセットアップ。`docs/specification.md` を README にリンク。
2. **Sanity Studio 構築**: `sanity init` で Studio を `/studio` に生成し、スキーマ (`post`, `category`, `tag`, `author`, `page`, `siteSettings`) とカスタム構造を実装。開発環境向け `.env` を設定。
3. **Sanity クライアントレイヤ**: `lib/sanity.client.ts`, `lib/queries.ts`, `lib/structured-data.ts` などのユーティリティを整備し、型定義 (`types/sanity.d.ts`) を追加。
4. **レイアウト & 共通コンポーネント**: `app/layout.tsx`, `Header`, `Footer`, `Container`, `Section`, `SearchDialog`, `Breadcrumbs` を作成。Tailwind テーマ (色/フォント/typography) を反映。
5. **ページ実装 (第1フェーズ)**: `/`, `/blog`, `/blog/[slug]` を優先実装し、一覧/詳細を Sanity データと接続。TOC、関連記事、人気記事を含む。
6. **ページ実装 (第2フェーズ)**: `/category/[slug]`, `/tag/[slug]`, `/author/[slug]`, `/about`, `/contact` を仕上げ、検索/ページネーション/フィルタを実装。
7. **SEO/OGP 機能**: `generateMetadata`, JSON-LD, `/api/og`, `/sitemap.xml`, `/feed.xml`, `/robots.txt` を実装し、サイト設定データと連携。
8. **ISR & Webhook**: `revalidateTag` を導入し、Sanity Webhook → `/api/revalidate` の連携を構築。開発環境で手動テスト。
9. **テスト & 品質保証**: 単体テスト (Portable Text renderer, utils)、スナップショット (コンポーネント)、Lighthouse 計測、構造化データ/OG チェック。
10. **デプロイ & ドキュメント**: Vercel へデプロイ、環境変数設定、最終的な README/運用手順を整備。必要な場合は GitHub Actions を追加。

## テスト & デプロイチェックリスト
- [ ] ESLint / TypeScript を通過 (`yarn lint` / `yarn type-check`)
- [ ] キーコンポーネントのユニットテストが成功 (`yarn test`)
- [ ] Lighthouse (モバイル/デスクトップ) スコア 90 以上
- [ ] `/sitemap.xml`, `/feed.xml`, `/robots.txt` が正しい URL を返す
- [ ] OGP/Twitter プレビューが正常（記事ごとに `/api/og` 動作確認）
- [ ] Google Rich Results Test で構造化データが有効 (BlogPosting, BreadcrumbList)
- [ ] Sanity Studio から記事を更新 → Vercel ISR 再生成が行われる
- [ ] 404 ページとエラーハンドリングの挙動を確認
- [ ] モバイル端末での表示と操作性 (ヘッダーメニュー/検索/TOC) を検証

---

## 実装済みルートまとめ

### App Pages
- `/blog/[slug]`: 記事詳細（目次・関連記事・Share・構造化データ含む）
- `/category/[slug]`: カテゴリ別一覧（検索・ページネーション・人気記事サイドバー）
- `/tag/[slug]`: タグ別一覧
- `/author/[slug]`: 著者プロフィール + 記事一覧
- `/sitemap.xml`, `/robots.txt`, `/feed.xml`: SEO 用エンドポイント
- `/api/og`: OGP 画像を動的生成（Edge Runtime）
- `/api/revalidate`: Sanity Webhook からの再検証入口（タグで ISR 無効化）

### Sanity クエリ/ヘルパー（主な追加）
- `allPublishedPostsForSitemapQuery`, `allCategoriesForSitemapQuery`, `allTagsForSitemapQuery`, `allAuthorsForSitemapQuery`
- `getAllPostsForSitemap`, `getAllCategories`, `getAllTags`, `getAllAuthors`
- `getCategoryBySlug`, `getTagBySlug`, `getAuthorBySlug`

### API/OG 動作
- `/api/og?slug=...` で指定記事のタイトル・抜粋を利用した OG 画像を生成
- サイト設定が未入力の場合でも `NEXT_PUBLIC_SITE_URL` からフォールバック
- `/api/revalidate` は `REVALIDATE_SECRET` で保護し、`post` タグを再構築
