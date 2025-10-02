import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleCard } from "@/components/blog/article-card";
import { BlogSearchForm } from "@/components/blog/blog-search-form";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/ui/pagination";
import {
  getCategoryBySlug,
  getPaginatedPosts,
  getPopularPosts,
  getSiteSettings,
} from "@/lib/sanity/api";
import { sanityFetch } from "@/lib/sanity/fetch";
import { categorySlugsQuery } from "@/lib/sanity/queries";
import type { CategoryDetail } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

export const revalidate = 120;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildMetadata = (category: CategoryDetail, siteUrl?: string, description?: string) => {
  const canonical = category.seo?.canonicalUrl ?? (siteUrl ? `${siteUrl}/category/${category.slug}` : undefined);
  return {
    title: category.seo?.title ?? category.title,
    description: description ?? category.description ?? `${category.title} に関する記事一覧`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: category.seo?.title ?? category.title,
      description: description ?? category.description ?? `${category.title} に関する記事一覧`,
      type: "website",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: category.seo?.title ?? category.title,
      description: description ?? category.description ?? `${category.title} に関する記事一覧`,
    },
  } satisfies Metadata;
};

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(categorySlugsQuery, {}, { revalidate: 3600, tags: ["category"] });
  return slugs?.map((entry) => ({ slug: entry.slug })) ?? [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [category, settings] = await Promise.all([
    getCategoryBySlug(params.slug),
    getSiteSettings(),
  ]);

  if (!category) {
    return {
      title: "カテゴリが見つかりません",
    };
  }

  const description = category.seo?.description ?? category.description;
  return buildMetadata(category, settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL, description);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const queryParams = Object.fromEntries(
    Object.entries(resolvedParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  ) as Record<string, string | undefined>;

  const query = queryParams.q?.trim() || undefined;
  const page = toNumber(queryParams.page, 1);

  const [category, settings, popularPosts, postsResult] = await Promise.all([
    getCategoryBySlug(params.slug),
    getSiteSettings(),
    getPopularPosts(),
    getPaginatedPosts({ category: params.slug, query, page }),
  ]);

  if (!category) {
    notFound();
  }

  const searchParamsObj = new URLSearchParams();
  if (query) searchParamsObj.set("q", query);

  const buildHref = (pageNumber: number) => {
    const paramsClone = new URLSearchParams(searchParamsObj.toString());
    if (pageNumber <= 1) {
      paramsClone.delete("page");
    } else {
      paramsClone.set("page", String(pageNumber));
    }
    const queryString = paramsClone.toString();
    return queryString ? `/category/${params.slug}?${queryString}` : `/category/${params.slug}`;
  };

  return (
    <div className="py-16">
      <Container className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "カテゴリ", href: "/blog" },
            { label: category.title },
          ]}
        />
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">Category</p>
          <h1 className="text-4xl font-display font-bold text-neutral-900">{category.title}</h1>
          {category.description && <p className="max-w-2xl text-neutral-600">{category.description}</p>}
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            <div className="space-y-4">
              <BlogSearchForm actionPath={`/category/${params.slug}`} />
              <p className="text-sm text-neutral-500">
                全 {postsResult.total} 件の記事
                {postsResult.items[0]?.publishedAt && (
                  <span className="ml-2">最終更新 {formatDate(postsResult.items[0].publishedAt)}</span>
                )}
              </p>
            </div>

            {postsResult.items.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {postsResult.items.map((post) => (
                  <ArticleCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center text-neutral-500">
                このカテゴリの記事はまだありません。
              </div>
            )}

            <Pagination
              currentPage={postsResult.page}
              totalPages={postsResult.pageCount}
              hrefBuilder={buildHref}
            />
          </div>

          <aside className="space-y-8">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">人気記事</h2>
              <ul className="mt-4 space-y-4">
                {(popularPosts ?? []).map((post) => (
                  <li key={post._id}>
                    <Link href={`/blog/${post.slug}`} className="text-sm text-neutral-700 transition-colors hover:text-primary-600">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900">フォローする</h2>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                  {settings.socialLinks.map((social) => (
                    <li key={social.platform}>
                      <a href={social.url} target="_blank" rel="noreferrer" className="hover:text-primary-600">
                        {social.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
