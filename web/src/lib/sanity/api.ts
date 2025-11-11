import type { QueryParams } from "@sanity/client";

import { sanityFetch } from "./fetch";
import {
  authorDetailQuery,
  latestPostsQuery,
  paginatedPostsCountQuery,
  paginatedPostsQuery,
  popularPostsQuery,
  siteSettingsQuery,
  categoryDetailQuery,
  categoryHighlightsQuery,
  tagDetailQuery,
  tagUsageSourceQuery,
  allPublishedPostsForSitemapQuery,
  allCategoriesForSitemapQuery,
  allTagsForSitemapQuery,
  allAuthorsForSitemapQuery,
  singlePageQuery,
  allPagesForSitemapQuery,
} from "./queries";
import type {
  AuthorDetail,
  CategoryDetail,
  CategoryHighlight,
  PageDetail,
  PostListItem,
  SiteSettings,
  TagDetail,
  TrendingTag,
} from "./types";

type ListParams = {
  query?: string;
  category?: string;
  tag?: string;
  author?: string;
  limit?: number;
  page?: number;
};

const PAGE_SIZE = 10;

export const getSiteSettings = async () =>
  sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, {
    revalidate: 3600,
    tags: ["siteSettings"],
  });

export const getLatestPosts = async () =>
  sanityFetch<PostListItem[]>(latestPostsQuery, {}, {
    revalidate: 120,
    tags: ["post"],
  });

export const getPopularPosts = async () =>
  sanityFetch<PostListItem[]>(popularPostsQuery, {}, {
    revalidate: 600,
    tags: ["post"],
  });

export const getCategoryHighlights = async () =>
  sanityFetch<CategoryHighlight[]>(categoryHighlightsQuery, {}, {
    revalidate: 600,
    tags: ["category", "post"],
  });

type TagUsageDocument = {
  tags?: string[];
};

export const getTrendingTags = async (limit = 10): Promise<TrendingTag[]> => {
  const tagDocs = await sanityFetch<TagUsageDocument[]>(tagUsageSourceQuery, {}, {
    revalidate: 600,
    tags: ["post"],
  });

  const counts = new Map<string, number>();

  tagDocs.forEach((doc) => {
    doc.tags?.forEach((tag) => {
      const normalized = tag?.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0], "ja");
    })
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

export const getPaginatedPosts = async (params: ListParams = {}) => {
  const limit = params.limit ?? PAGE_SIZE;
  const page = params.page ?? 1;
  const offset = (page - 1) * limit;
  const pattern = params.query ? `*${params.query.toLowerCase()}*` : undefined;

  const listParams: QueryParams = { offset, limit };
  const countParams: QueryParams = {};

  if (params.query) {
    listParams.search = params.query;
    countParams.search = params.query;
  }

  if (pattern) {
    listParams.pattern = pattern;
    countParams.pattern = pattern;
  }

  if (params.category) {
    listParams.category = params.category;
    countParams.category = params.category;
  }

  if (params.tag) {
    listParams.tagSlug = params.tag;
    countParams.tagSlug = params.tag;
  }

  if (params.author) {
    listParams.author = params.author;
    countParams.author = params.author;
  }

  const [items, total] = await Promise.all([
    sanityFetch<PostListItem[]>(
      paginatedPostsQuery,
      listParams,
      {
        revalidate: 120,
        tags: ["post"],
      },
    ),
    sanityFetch<number>(
      paginatedPostsCountQuery,
      countParams,
      {
        revalidate: 120,
        tags: ["post"],
      },
    ),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit),
  };
};

export const getCategoryBySlug = async (slug: string) =>
  sanityFetch<CategoryDetail | null>(
    categoryDetailQuery,
    { slug },
    { revalidate: 3600, tags: ["category", `category:${slug}`] },
  );

export const getTagBySlug = async (slug: string) =>
  sanityFetch<TagDetail | null>(
    tagDetailQuery,
    { slug },
    { revalidate: 3600, tags: ["tag", `tag:${slug}`] },
  );

export const getAuthorBySlug = async (slug: string) =>
  sanityFetch<AuthorDetail | null>(
    authorDetailQuery,
    { slug },
    { revalidate: 3600, tags: ["author", `author:${slug}`] },
  );

export const getAllPostsForSitemap = async () =>
  sanityFetch<{ slug: string; publishedAt: string; updatedAt?: string }[]>(
    allPublishedPostsForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["post"] },
  );

export const getAllCategories = async () =>
  sanityFetch<{ slug: string }[]>(
    allCategoriesForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["category"] },
  );

export const getAllTags = async () =>
  sanityFetch<{ slug: string }[]>(
    allTagsForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["tag"] },
  );

export const getAllAuthors = async () =>
  sanityFetch<{ slug: string }[]>(
    allAuthorsForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["author"] },
  );

export const getPageBySlug = async (slug: string) =>
  sanityFetch<PageDetail | null>(
    singlePageQuery,
    { slug },
    { revalidate: 3600, tags: ["page", `page:${slug}`] },
  );

export const getAllPages = async () =>
  sanityFetch<{ slug: string; updatedAt?: string }[]>(
    allPagesForSitemapQuery,
    {},
    { revalidate: 3600, tags: ["page"] },
  );
