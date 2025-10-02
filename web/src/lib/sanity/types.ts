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
  body: PortableTextBlock[];
  featured?: boolean;
  seo?: SeoMetadata;
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
};

export type TagDetail = {
  title: string;
  slug: string;
  description?: string;
};

export type AuthorDetail = AuthorSummary & {
  socialLinks?: { platform: string; url: string }[];
  bio?: PortableTextBlock[];
};
export type PageDetail = {
  title: string;
  slug: string;
  body: PortableTextBlock[];
  seo?: SeoMetadata;
};

