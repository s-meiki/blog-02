import type { QueryParams } from "@sanity/client";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";

import {
  allAuthorsForSitemapQuery,
  allCategoriesForSitemapQuery,
  allPagesForSitemapQuery,
  allPublishedPostsForSitemapQuery,
  allTagsForSitemapQuery,
  authorDetailQuery,
  authorSlugsQuery,
  categoryDetailQuery,
  categorySlugsQuery,
  latestPostsQuery,
  paginatedPostsCountQuery,
  paginatedPostsQuery,
  popularPostsQuery,
  postSlugsQuery,
  relatedPostsQuery,
  singlePageQuery,
  singlePostQuery,
  siteSettingsQuery,
  tagDetailQuery,
  tagSlugsQuery,
  pageSlugsQuery,
} from "./queries";
import type {
  AuthorDetail,
  CategoryDetail,
  PageDetail,
  PostDetail,
  PostListItem,
  SiteSettings,
  TagDetail,
} from "./types";

type PageDetailWithMeta = PageDetail & { updatedAt?: string };

type QueryHandler = (params: QueryParams) => unknown;

const createPortableTextBlock = (() => {
  let counter = 0;
  return (
    text: string,
    style: PortableTextBlock["style"] = "normal",
  ): PortableTextBlock => {
    counter += 1;
    const key = `${style}-${counter}`;
    return {
      _key: key,
      _type: "block",
      style,
      markDefs: [],
      children: [
        {
          _key: `span-${counter}`,
          _type: "span",
          marks: [],
          text,
        },
      ],
    } satisfies PortableTextBlock;
  };
})();

const blocksToMarkdown = (blocks: PortableTextBlock[]): string =>
  blocks
    .map((block) => {
      if (block._type !== "block") return "";
      const text = (block.children as PortableTextSpan[] | undefined)?.map((child) => child.text).join("") ?? "";
      if (!text.trim()) return "";
      switch (block.style) {
        case "h2":
          return `## ${text.trim()}`;
        case "h3":
          return `### ${text.trim()}`;
        case "h4":
          return `#### ${text.trim()}`;
        case "blockquote":
          return text
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        default:
          return text.trim();
      }
    })
    .filter((segment) => segment.length > 0)
    .join("\n\n");

const mockSiteSettings: SiteSettings = {
  siteTitle: "Sanity Blog Demo",
  siteDescription: "Sanity と Next.js で構築したブログのデモデータです。",
  siteUrl: "http://localhost:3000",
  contactEmail: "hello@example.com",
  navigation: [
    { label: "ホーム", href: "/" },
    { label: "ブログ", href: "/blog" },
    { label: "カテゴリ", href: "/category/development" },
    { label: "タグ", href: "/tag/nextjs" },
    { label: "お問い合わせ", href: "/contact" },
  ],
  footerLinks: [
    { label: "運営者について", href: "/about" },
    { label: "ブログ", href: "/blog" },
    { label: "カテゴリ一覧", href: "/category/development" },
    { label: "タグ一覧", href: "/tag/nextjs" },
  ],
  socialLinks: [
    { platform: "Twitter", url: "https://twitter.com/sanity_io" },
    { platform: "GitHub", url: "https://github.com/sanity-io" },
    { platform: "YouTube", url: "https://www.youtube.com/@sanity_io" },
  ],
};

const mockAuthors: AuthorDetail[] = [
  {
    name: "田中 優希",
    slug: "yuki-tanaka",
    role: "フロントエンドエンジニア",
    bio: [
      createPortableTextBlock("Next.js と Sanity を中心にモダンな Web 開発を探求しています。"),
      createPortableTextBlock("休日はコーヒーを片手に OSS のコードリーディングを楽しむのが日課です。"),
    ],
    socialLinks: [
      { platform: "X", url: "https://twitter.com" },
      { platform: "GitHub", url: "https://github.com" },
    ],
  },
  {
    name: "佐藤 美咲",
    slug: "misaki-sato",
    role: "コンテンツストラテジスト",
    bio: [
      createPortableTextBlock("コンテンツ設計と UX ライティングを担当。日本語の読みやすさを重視した情報設計が得意です。"),
    ],
    socialLinks: [{ platform: "LinkedIn", url: "https://www.linkedin.com" }],
  },
];

const mockCategories: CategoryDetail[] = [
  {
    title: "開発ノート",
    slug: "development",
    description: "Next.js や Sanity を使った開発ノウハウをまとめています。",
    seo: {
      title: "開発ノート",
      description: "Sanity と Next.js を活用した開発のベストプラクティス",
    },
  },
  {
    title: "デザイン",
    slug: "design",
    description: "UI/UX デザインや情報設計に関するアイデアを共有します。",
  },
  {
    title: "ワークスタイル",
    slug: "productivity",
    description: "チーム開発やリモートワークを支えるナレッジを紹介。",
  },
];

const mockTags: TagDetail[] = [
  { title: "Next.js", slug: "nextjs", description: "App Router や最新機能に関するトピック" },
  { title: "Sanity", slug: "sanity", description: "Sanity Studio と GROQ の活用事例" },
  { title: "Tailwind CSS", slug: "tailwind", description: "Tailwind v4 のTips" },
  { title: "UI/UX", slug: "ui-ux" },
  { title: "Productivity", slug: "productivity" },
];

const aboutPageBody = [
  createPortableTextBlock("Sanity Blog Demo では、Sanity をヘッドレス CMS として活用したワークフローを紹介しています。"),
  createPortableTextBlock("このデモは開発環境向けのスタブデータで動作しており、実際の Sanity プロジェクトがなくても UI を確認できます。"),
  createPortableTextBlock("ミッション", "h2"),
  createPortableTextBlock("開発者が素早くコンテンツ体験を検証できる環境を提供すること。"),
];

const contactPageBody = [
  createPortableTextBlock("ご意見やお問い合わせは下記メールアドレスまでご連絡ください。"),
  createPortableTextBlock("hello@example.com", "h3"),
  createPortableTextBlock("通常 2 営業日以内に返信いたします。"),
];

const mockPages: PageDetailWithMeta[] = [
  {
    title: "About",
    slug: "about",
    body: aboutPageBody,
    bodyMarkdown: blocksToMarkdown(aboutPageBody),
    seo: {
      title: "About - Sanity Blog Demo",
      description: "Sanity Blog Demo のコンセプトとチーム紹介",
    },
    updatedAt: "2024-05-20T06:00:00.000Z",
  },
  {
    title: "Contact",
    slug: "contact",
    body: contactPageBody,
    bodyMarkdown: blocksToMarkdown(contactPageBody),
    seo: {
      title: "Contact",
      description: "Sanity Blog Demo へのお問い合わせ窓口",
    },
    updatedAt: "2024-05-28T08:30:00.000Z",
  },
];

const toListItem = (post: PostDetail): PostListItem => ({
  _id: post._id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  publishedAt: post.publishedAt,
  readingTime: post.readingTime,
  coverImage: post.coverImage,
  author: post.author,
  categories: post.categories,
  tags: post.tags,
  popularScore: post.popularScore,
});

const post001Body = [
  createPortableTextBlock("Sanity を活用することで、開発者体験と編集者体験の両方を高められます。"),
  createPortableTextBlock("セットアップ手順", "h2"),
  createPortableTextBlock("1. create-next-app でプロジェクトを作成します。"),
  createPortableTextBlock("2. Sanity Studio を /studio ディレクトリに追加し、スキーマを定義します。"),
  createPortableTextBlock("3. ISR と Webhook を設定して公開フローを整えましょう。"),
  createPortableTextBlock("実装のポイント", "h2"),
  createPortableTextBlock("Portable Text を用いることで、記事本文にリッチな表現を加えられます。"),
  createPortableTextBlock("テーマカスタマイズ", "h3"),
  createPortableTextBlock("Tailwind CSS でダークブルーを基調としたテーマを構築します。"),
];

const post002Body = [
  createPortableTextBlock("Sanity Studio は編集者ごとに最適化されたカスタムビューを構築できます。"),
  createPortableTextBlock("Desk Structure の設計", "h2"),
  createPortableTextBlock("カテゴリやタグの一覧をすぐに開けるようにすることで、編集効率が向上します。"),
  createPortableTextBlock("入力支援", "h3"),
  createPortableTextBlock("バリデーションや初期値を設定し、迷いなく記事を作成できるようにしましょう。"),
];

const post003Body = [
  createPortableTextBlock("公開フローを自動化することで、コンテンツの鮮度を保ちやすくなります。"),
  createPortableTextBlock("ワークフロー構築", "h2"),
  createPortableTextBlock("Sanity Webhook を使って Vercel の ISR 再検証を自動化します。"),
  createPortableTextBlock("チームコラボレーション", "h3"),
  createPortableTextBlock("レビューや承認ステップをスプレッドシートではなく、Studio 内で完結させましょう。"),
];

const mockPosts: PostDetail[] = [
  {
    _id: "mock-post-001",
    title: "Next.js 15 と Sanity で始めるモダンなブログ構築",
    slug: "nextjs-sanity-modern-blog",
    excerpt: "App Router と Sanity のコンビネーションで、柔軟なブログ基盤を構築するためのベストプラクティスを紹介します。",
    publishedAt: "2024-06-01T09:00:00.000Z",
    updatedAt: "2024-06-05T03:00:00.000Z",
    readingTime: 6,
    author: mockAuthors[0],
    categories: [
      { title: mockCategories[0].title, slug: mockCategories[0].slug },
    ],
    tags: ["nextjs", "sanity", "tailwind"],
    popularScore: 98,
    body: post001Body,
    bodyMarkdown: blocksToMarkdown(post001Body),
  },
  {
    _id: "mock-post-002",
    title: "コンテンツ編集者のための Sanity Studio カスタマイズ",
    slug: "sanity-studio-for-editors",
    excerpt: "ドキュメント構造やカスタムアクションを整えて、編集者にとって操作しやすい Studio を設計します。",
    publishedAt: "2024-05-20T04:30:00.000Z",
    updatedAt: "2024-05-22T07:45:00.000Z",
    readingTime: 8,
    author: mockAuthors[1],
    categories: [
      { title: mockCategories[1].title, slug: mockCategories[1].slug },
    ],
    tags: ["sanity", "ui-ux"],
    popularScore: 87,
    body: post002Body,
    bodyMarkdown: blocksToMarkdown(post002Body),
  },
  {
    _id: "mock-post-003",
    title: "リモートチームでのコンテンツ運用ワークフロー",
    slug: "remote-content-workflow",
    excerpt: "Sanity の Draft/Publish モデルと Next.js の ISR を連携させて、リモートチームでも安心して運用できる仕組みを解説します。",
    publishedAt: "2024-04-28T10:15:00.000Z",
    updatedAt: "2024-04-29T02:10:00.000Z",
    readingTime: 5,
    author: mockAuthors[0],
    categories: [
      { title: mockCategories[2].title, slug: mockCategories[2].slug },
    ],
    tags: ["productivity", "nextjs"],
    popularScore: 76,
    body: post003Body,
    bodyMarkdown: blocksToMarkdown(post003Body),
  },
];

const sortByPublishedDesc = (posts: PostDetail[]) =>
  [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

const sortByPopularity = (posts: PostDetail[]) =>
  [...posts].sort((a, b) => {
    const scoreDiff = (b.popularScore ?? 0) - (a.popularScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const filterPosts = (params: QueryParams) => {
  const query = typeof params.search === "string" ? params.search.toLowerCase() : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const tag = typeof params.tagSlug === "string" ? params.tagSlug : undefined;
  const author = typeof params.author === "string" ? params.author : undefined;

  return sortByPublishedDesc(
    mockPosts.filter((post) => {
      if (category && !post.categories?.some((cat) => cat.slug === category)) {
        return false;
      }
      if (tag && !post.tags?.includes(tag)) {
        return false;
      }
      if (author && post.author?.slug !== author) {
        return false;
      }
      if (query) {
        const haystack = [post.title, post.excerpt, ...(post.tags ?? [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    }),
  );
};

const handlers = new Map<string, QueryHandler>([
  [siteSettingsQuery, () => mockSiteSettings],
  [latestPostsQuery, () => sortByPublishedDesc(mockPosts).slice(0, 6).map(toListItem)],
  [popularPostsQuery, () => sortByPopularity(mockPosts).slice(0, 5).map(toListItem)],
  [paginatedPostsQuery, (params) => {
    const filtered = filterPosts(params);
    const offset = toNumber(params.offset, 0);
    const limit = toNumber(params.limit, filtered.length);
    return filtered.slice(offset, offset + limit).map(toListItem);
  }],
  [paginatedPostsCountQuery, (params) => filterPosts(params).length],
  [categoryDetailQuery, (params) =>
    mockCategories.find((category) => category.slug === params.slug) ?? null],
  [tagDetailQuery, (params) => mockTags.find((tag) => tag.slug === params.slug) ?? null],
  [authorDetailQuery, (params) => mockAuthors.find((author) => author.slug === params.slug) ?? null],
  [postSlugsQuery, () => mockPosts.map((post) => ({ slug: post.slug }))],
  [categorySlugsQuery, () => mockCategories.map((category) => ({ slug: category.slug }))],
  [tagSlugsQuery, () => mockTags.map((tag) => ({ slug: tag.slug }))],
  [authorSlugsQuery, () => mockAuthors.map((author) => ({ slug: author.slug }))],
  [singlePostQuery, (params) =>
    mockPosts.find((post) => post.slug === params.slug) ?? null],
  [relatedPostsQuery, (params) => {
    const slug = typeof params.slug === "string" ? params.slug : undefined;
    const category = typeof params.category === "string" ? params.category : undefined;
    const related = mockPosts.filter((post) => {
      if (slug && post.slug === slug) return false;
      if (category && !post.categories?.some((cat) => cat.slug === category)) return false;
      return true;
    });
    return sortByPublishedDesc(related).slice(0, 3).map((post) => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      coverImage: post.coverImage,
    }));
  }],
  [allPublishedPostsForSitemapQuery, () =>
    mockPosts.map((post) => ({
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }))],
  [allCategoriesForSitemapQuery, () => mockCategories.map((category) => ({ slug: category.slug }))],
  [allTagsForSitemapQuery, () => mockTags.map((tag) => ({ slug: tag.slug }))],
  [allAuthorsForSitemapQuery, () => mockAuthors.map((author) => ({ slug: author.slug }))],
  [singlePageQuery, (params) =>
    mockPages.find((page) => page.slug === params.slug) ?? null],
  [allPagesForSitemapQuery, () =>
    mockPages.map((page) => ({ slug: page.slug, updatedAt: page.updatedAt ?? new Date().toISOString() }))],
  [pageSlugsQuery, () => mockPages.map((page) => ({ slug: page.slug }))],
]);

export const hasSanityCredentials = Boolean(process.env.SANITY_PROJECT_ID);

export function mockSanityFetch<T>(query: string, params: QueryParams = {}): T {
  const handler = handlers.get(query);
  if (!handler) {
    console.warn(`[sanity-mock] No handler defined for query: ${query}`);
    return null as T;
  }
  return handler(params) as T;
}

export function getMockSiteSettings() {
  return mockSiteSettings;
}
