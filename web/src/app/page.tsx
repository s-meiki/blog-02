import { ArticleCard } from "@/components/blog/article-card";
import Link from "next/link";

import { ArticleCard } from "@/components/blog/article-card";
import { PopularPosts } from "@/components/blog/popular-posts";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/layout/hero";
import { getLatestPosts, getPopularPosts, getSiteSettings } from "@/lib/sanity/api";

export default async function HomePage() {
  const [settings, latestPosts, popularPosts] = await Promise.all([
    getSiteSettings(),
    getLatestPosts(),
    getPopularPosts(),
  ]);

  const featuredPost = latestPosts?.[0] ?? null;
  const latestGridPosts = featuredPost ? latestPosts?.slice(1, 7) ?? [] : latestPosts ?? [];

  const tags = Array.from(
    new Set(
      (latestPosts ?? [])
        .flatMap((post) => post.tags ?? [])
        .filter((tag): tag is string => Boolean(tag && tag.trim())),
    ),
  ).slice(0, 10);

  const categoryHighlights = (() => {
    const map = new Map<
      string,
      {
        title: string;
        slug: string;
        excerpt: string;
      }
    >();

    (latestPosts ?? []).forEach((post) => {
      post.categories?.forEach((category) => {
        if (!category?.slug || map.has(category.slug)) return;
        map.set(category.slug, {
          title: category.title,
          slug: category.slug,
          excerpt: post.excerpt,
        });
      });
    });

    return Array.from(map.values()).slice(0, 3);
  })();

  return (
    <div className="space-y-0">
      <Hero
        title={settings?.siteTitle ?? "Sanity Blog"}
        description={
          settings?.siteDescription ??
          "Sanity と Next.js、Tailwind CSS で構築したモダンなブログプラットフォーム"
        }
        featuredPost={featuredPost}
      />

      <div className="bg-neutral-50/60">
        <Container className="space-y-16 py-16">
          <section className="space-y-8">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
                Latest
              </p>
              <h2 className="text-3xl font-display font-semibold text-primary-900">最新の記事</h2>
              <p className="text-neutral-600">いま読みたいストーリーを厳選しました。</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {latestGridPosts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
              {latestGridPosts.length === 0 && (
                <p className="col-span-full rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
                  まだ記事がありません。Sanity Studio から記事を作成してください。
                </p>
              )}
            </div>
          </section>

          {tags.length > 0 && (
            <section className="rounded-[32px] border border-primary-900/10 bg-primary-900 text-white">
              <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Topics</p>
                  <h3 className="text-2xl font-display">気になるテーマから読む</h3>
                  <p className="text-sm text-white/80">
                    最近よく読まれているタグをピックアップしました。気になるテーマをクリックして記事を探してみてください。
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/20"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {categoryHighlights.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Collections</p>
                <h2 className="text-3xl font-display font-semibold text-primary-900">カテゴリで深掘り</h2>
                <p className="text-neutral-600">学びたい領域にあわせて記事をまとめました。</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {categoryHighlights.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="group flex h-full flex-col gap-4 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(15,23,42,0.35)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
                      Category
                    </p>
                    <h3 className="text-2xl font-display font-semibold text-primary-900">{category.title}</h3>
                    <p className="line-clamp-3 text-sm text-neutral-600">{category.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                      記事一覧へ
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6 rounded-[32px] border border-neutral-200 bg-white/95 p-8 shadow-soft">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
                  Editors Note
                </p>
                <h2 className="text-2xl font-display font-semibold text-primary-900">編集部のおすすめ</h2>
                <p className="text-neutral-600">最近注目しているトピックをピックアップしました。</p>
              </div>
              <div className="space-y-6">
                {(latestPosts ?? []).slice(0, 3).map((post) => (
                  <ArticleCard key={post._id} post={post} variant="compact" />
                ))}
              </div>
            </div>
            <PopularPosts posts={popularPosts ?? []} />
          </section>
        </Container>
      </div>
    </div>
  );
}
