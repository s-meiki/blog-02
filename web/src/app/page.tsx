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

  return (
    <div className="space-y-20">
      <Hero
        title={settings?.siteTitle ?? "Sanity Blog"}
        description={
          settings?.siteDescription ??
          "Sanity と Next.js、Tailwind CSS で構築したモダンなブログプラットフォーム"
        }
      />

      <Container className="space-y-16">
        <section className="space-y-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Latest
            </p>
            <h2 className="text-3xl font-display font-semibold text-primary-900">最新記事</h2>
            <p className="text-neutral-600">
              Sanity Studio から更新された最新の記事をチェックしましょう。
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {latestPosts?.map((post) => (
              <ArticleCard key={post._id} post={post} />
            ))}
            {(!latestPosts || latestPosts.length === 0) && (
              <p className="col-span-full rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
                まだ記事がありません。Sanity Studio から記事を作成してください。
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-semibold text-primary-900">編集部のおすすめ</h2>
            <p className="text-neutral-600">
              注目の記事やストーリーを厳選してお届けします。カテゴリ横断で人気の高いコンテンツをピックアップ。
            </p>
            <div className="space-y-6">
              {latestPosts?.slice(0, 3).map((post) => (
                <ArticleCard key={post._id} post={post} variant="compact" />
              ))}
            </div>
          </div>
          <PopularPosts posts={popularPosts ?? []} />
        </section>
      </Container>
    </div>
  );
}
