import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleCard } from "@/components/blog/article-card";
import { BlogSearchForm } from "@/components/blog/blog-search-form";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/ui/pagination";
import {
  getPaginatedPosts,
  getPopularPosts,
  getSiteSettings,
  getTagBySlug,
} from "@/lib/sanity/api";
import { sanityFetch } from "@/lib/sanity/fetch";
import { tagSlugsQuery } from "@/lib/sanity/queries";
import type { TagDetail } from "@/lib/sanity/types";

export const revalidate = 120;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildMetadata = (tag: TagDetail, siteUrl?: string) => {
  const url = siteUrl ? `${siteUrl}/tag/${tag.slug}` : undefined;
  const description = tag.description ?? `${tag.title} に関する記事`;
  return {
    title: `${tag.title}の記事一覧`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${tag.title}の記事一覧`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag.title}の記事一覧`,
      description,
    },
  } satisfies Metadata;
};

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(tagSlugsQuery, {}, { revalidate: 3600, tags: ["tag"] });
  return slugs?.map((entry) => ({ slug: entry.slug })) ?? [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [tag, settings] = await Promise.all([
    getTagBySlug(params.slug),
    getSiteSettings(),
  ]);

  if (!tag) {
    return {
      title: "タグが見つかりません",
    };
  }

  return buildMetadata(tag, settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL);
}

export default async function TagPage({
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

  const [tag, popularPosts, postsResult] = await Promise.all([
    getTagBySlug(params.slug),
    getPopularPosts(),
    getPaginatedPosts({ tag: params.slug, query, page }),
  ]);

  if (!tag) {
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
    return queryString ? `/tag/${params.slug}?${queryString}` : `/tag/${params.slug}`;
  };

  return (
    <div className="py-16">
      <Container className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "タグ", href: "/blog" },
            { label: tag.title },
          ]}
        />
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">Tag</p>
          <h1 className="text-4xl font-display font-bold text-neutral-900">#{tag.title}</h1>
          {tag.description && <p className="max-w-2xl text-neutral-600">{tag.description}</p>}
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            <div className="space-y-4">
              <BlogSearchForm actionPath={`/tag/${params.slug}`} />
            </div>

            {postsResult.items.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {postsResult.items.map((post) => (
                  <ArticleCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center text-neutral-500">
                このタグの記事はまだありません。
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
          </aside>
        </div>
      </Container>
    </div>
  );
}
