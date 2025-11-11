import type { PortableTextBlock } from "@portabletext/types";

export type ImageWithAlt = {
  url: string;
  alt?: string;
};

export type AuthorSummary = {
  name: string;
  slug: string;
  avatar?: string;
  role?: string;
  bio?: PortableTextBlock[];
};

export type CategorySummary = {
  title: string;
  slug: string;
};

export type SeoMetadata = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: {
    asset?: { _ref: string };
    alt?: string;
  };
};

export type CategoryDetail = CategorySummary & {
  description?: string;
  seo?: SeoMetadata;
};

export type CategoryHighlight = CategorySummary & {
  description?: string;
  postCount: number;
  featuredPost?: {
    title: string;
    slug: string;
    excerpt?: string;
  };
};

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readingTime?: number;
  coverImage?: ImageWithAlt;
  author?: AuthorSummary;
  categories?: CategorySummary[];
  tags?: string[];
  popularScore?: number;
};

export type PostDetail = PostListItem & {
  updatedAt?: string;
  body?: PortableTextBlock[] | null;
  bodyMarkdown?: string | null;
  featured?: boolean;
  seo?: SeoMetadata;
};

export type HeroMetric = {
  label: string;
  value: string;
};

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroSettings = {
  eyebrow?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  metrics?: HeroMetric[];
};

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  siteUrl?: string;
  contactEmail?: string;
  logo?: string;
  defaultOgImage?: string;
  navigation?: { label: string; href: string; external?: boolean }[];
  footerLinks?: { label: string; href: string }[];
  socialLinks?: { platform: string; url: string }[];
  hero?: HeroSettings;
};

export type TagDetail = {
  title: string;
  slug: string;
  description?: string;
};

export type TrendingTag = {
  name: string;
  count: number;
};

export type AuthorDetail = AuthorSummary & {
  socialLinks?: { platform: string; url: string }[];
  bio?: PortableTextBlock[];
};
export type PageDetail = {
  title: string;
  slug: string;
  body?: PortableTextBlock[] | null;
  bodyMarkdown?: string | null;
  seo?: SeoMetadata;
};
