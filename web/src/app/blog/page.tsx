import Link from "next/link";

import { ArticleCard } from "@/components/blog/article-card";
import { BlogSearchForm } from "@/components/blog/blog-search-form";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/ui/pagination";
import { getPaginatedPosts, getPopularPosts } from "@/lib/sanity/api";
import type { PostListItem } from "@/lib/sanity/types";

const PAGE_SIZE = 10;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildHref = (searchParams: URLSearchParams) => (page: number) => {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const queryString = params.toString();
  return queryString ? `/blog?${queryString}` : "/blog";
};

const EmptyState = ({ query }: { query?: string | null }) => (
  <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center">
    <h2 className="text-xl font-semibold text-neutral-800">該当する記事が見つかりませんでした</h2>
    <p className="mt-2 text-neutral-500">
      {query ? `"${query}" の検索条件に一致する記事はありません。キーワードを変更してみてください。` : "条件を変更して再度お試しください。"}
    </p>
  </div>
);

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const params = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  ) as Record<string, string | undefined>;

  const query = params.q?.trim() || undefined;
  const page = toNumber(params.page, 1);
  const tag = params.tag?.trim() || undefined;
  const category = params.category?.trim() || undefined;

  const [{ items, total, pageCount }, popularPosts] = await Promise.all([
    getPaginatedPosts({ query, page, tag, category, limit: PAGE_SIZE }),
    getPopularPosts(),
  ]);

  const searchParamsObject = new URLSearchParams();
  if (query) searchParamsObject.set("q", query);
  if (tag) searchParamsObject.set("tag", tag);
  if (category) searchParamsObject.set("category", category);

  return (
    <div className="py-16 sm:py-20">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Blog</p>
              <h1 className="text-3xl font-display font-semibold text-primary-900">記事一覧</h1>
              <p className="text-neutral-600">
                検索やタグ・カテゴリフィルタを活用して、目的の記事を素早く見つけましょう。
              </p>
            </div>
            <BlogSearchForm actionPath="/blog" />
            <p className="text-sm text-neutral-500">
              全 {total} 件の記事を掲載中。ページ {page} / {pageCount}
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {items.map((post: PostListItem) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState query={query} />
          )}

          <Pagination
            currentPage={page}
            totalPages={pageCount}
            hrefBuilder={buildHref(searchParamsObject)}
          />
        </div>

        <aside className="space-y-8">
          <section className="rounded-3xl border border-primary-900/10 bg-white/90 p-6 shadow-soft">
            <h2 className="text-lg font-display text-primary-900">人気記事</h2>
            <ul className="mt-4 space-y-4">
              {(popularPosts ?? []).map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-primary-800 transition-colors hover:text-primary-600"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </Container>
    </div>
  );
}
