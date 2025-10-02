import { NextResponse } from "next/server";

import {
  getAllAuthors,
  getAllCategories,
  getAllPostsForSitemap,
  getAllTags,
  getAllPages,
  getSiteSettings,
} from "@/lib/sanity/api";

export const revalidate = 86400;

const generateUrl = (baseUrl: string, path: string) => `${baseUrl}${path}`;

export async function GET() {
  const [settings, posts, categories, tags, authors, pages] = await Promise.all([
    getSiteSettings(),
    getAllPostsForSitemap(),
    getAllCategories(),
    getAllTags(),
    getAllAuthors(),
    getAllPages(),
  ]);

  const configuredUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = configuredUrl ? configuredUrl.replace(/\/$/, "") : undefined;
  if (!siteUrl) {
    return NextResponse.json({ error: "Site URL is not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();

  const urls: string[] = [];
  const pushUrl = (
    loc: string,
    { lastmod, changefreq = "weekly", priority = "0.7" }: { lastmod?: string; changefreq?: string; priority?: string } = {},
  ) => {
    const segments = [
      `<loc>${loc}</loc>`,
      lastmod ? `<lastmod>${lastmod}</lastmod>` : null,
      `<changefreq>${changefreq}</changefreq>`,
      `<priority>${priority}</priority>`,
    ].filter(Boolean);
    urls.push(`  <url>\n    ${segments.join("\n    ")}\n  </url>`);
  };

  pushUrl(generateUrl(siteUrl, "/"), { lastmod: now, changefreq: "daily", priority: "1.0" });
  pushUrl(generateUrl(siteUrl, "/blog"), { lastmod: now, changefreq: "daily", priority: "0.9" });

  pages?.forEach((page) => {
    if (!page?.slug) return;
    pushUrl(generateUrl(siteUrl, `/${page.slug}`), {
      lastmod: page.updatedAt ?? now,
      changefreq: "monthly",
      priority: "0.6",
    });
  });

  posts?.forEach((post) => {
    pushUrl(generateUrl(siteUrl, `/blog/${post.slug}`), {
      lastmod: post.updatedAt ?? post.publishedAt,
      changefreq: "weekly",
      priority: "0.8",
    });
  });

  categories?.forEach((category) => {
    pushUrl(generateUrl(siteUrl, `/category/${category.slug}`), {
      lastmod: now,
      changefreq: "weekly",
      priority: "0.5",
    });
  });

  tags?.forEach((tag) => {
    pushUrl(generateUrl(siteUrl, `/tag/${tag.slug}`), {
      lastmod: now,
      changefreq: "weekly",
      priority: "0.5",
    });
  });

  authors?.forEach((author) => {
    pushUrl(generateUrl(siteUrl, `/author/${author.slug}`), {
      lastmod: now,
      changefreq: "weekly",
      priority: "0.4",
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
