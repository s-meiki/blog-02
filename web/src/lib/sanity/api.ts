import { cache } from "react";

import { sanityFetch } from "./fetch";
import {
  authorDetailQuery,
  latestPostsQuery,
  paginatedPostsCountQuery,
  paginatedPostsQuery,
  popularPostsQuery,
  siteSettingsQuery,
  categoryDetailQuery,
  tagDetailQuery,
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
  PageDetail,
  PostListItem,
  SiteSettings,
  TagDetail,
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

export const getSiteSettings = cache(async () => {
  return sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, {
    revalidate: 3600,
    tags: ["siteSettings"],
  });
});

export const getLatestPosts = cache(async () => {
  return sanityFetch<PostListItem[]>(latestPostsQuery, {}, {
    revalidate: 120,
    tags: ["post"],
  });
});

export const getPopularPosts = cache(async () => {
  return sanityFetch<PostListItem[]>(popularPostsQuery, {}, {
    revalidate: 600,
    tags: ["post"],
  });
});

export const getPaginatedPosts = cache(async (params: ListParams = {}) => {
  const limit = params.limit ?? PAGE_SIZE;
  const page = params.page ?? 1;
  const offset = (page - 1) * limit;
  const pattern = params.query ? `*${params.query.toLowerCase()}*` : undefined;

  const [items, total] = await Promise.all([
    sanityFetch<PostListItem[]>(
      paginatedPostsQuery,
      {
        query: params.query,
        category: params.category,
        tag: params.tag,
        author: params.author,
        offset,
        limit,
        pattern,
      },
      {
        revalidate: 120,
        tags: ["post"],
      },
    ),
    sanityFetch<number>(
      paginatedPostsCountQuery,
      {
        query: params.query,
        category: params.category,
        tag: params.tag,
        author: params.author,
        pattern,
      },
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
});

export const getCategoryBySlug = cache(async (slug: string) =>
  sanityFetch<CategoryDetail | null>(
    categoryDetailQuery,
    { slug },
    { revalidate: 3600, tags: ["category", `category:${slug}`] },
  ),
);

export const getTagBySlug = cache(async (slug: string) =>
  sanityFetch<TagDetail | null>(
    tagDetailQuery,
    { slug },
    { revalidate: 3600, tags: ["tag", `tag:${slug}`] },
  ),
);

export const getAuthorBySlug = cache(async (slug: string) =>
  sanityFetch<AuthorDetail | null>(
    authorDetailQuery,
    { slug },
    { revalidate: 3600, tags: ["author", `author:${slug}`] },
  ),
);

export const getAllPostsForSitemap = cache(async () =>
  sanityFetch<{ slug: string; publishedAt: string; updatedAt?: string }[]>(
    allPublishedPostsForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["post"] },
  ),
);

export const getAllCategories = cache(async () =>
  sanityFetch<{ slug: string }[]>(
    allCategoriesForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["category"] },
  ),
);

export const getAllTags = cache(async () =>
  sanityFetch<{ slug: string }[]>(
    allTagsForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["tag"] },
  ),
);

export const getAllAuthors = cache(async () =>
  sanityFetch<{ slug: string }[]>(
    allAuthorsForSitemapQuery,
    {},
    { revalidate: 86400, tags: ["author"] },
  ),
);

export const getPageBySlug = cache(async (slug: string) =>
  sanityFetch<PageDetail | null>(
    singlePageQuery,
    { slug },
    { revalidate: 3600, tags: ["page", `page:${slug}`] },
  ),
);

export const getAllPages = cache(async () =>
  sanityFetch<{ slug: string; updatedAt?: string }[]>(
    allPagesForSitemapQuery,
    {},
    { revalidate: 3600, tags: ["page"] },
  ),
);

