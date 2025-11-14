import { Suspense } from "react";

import { ArticleCard } from "@/components/blog/article-card";
import Link from "next/link";
import { PopularPosts } from "@/components/blog/popular-posts";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/layout/hero";
import { LatestSection } from "@/components/home/latest-section";
import { EngagementCta } from "@/components/home/engagement-cta";
import { CategoryNav } from "@/components/home/category-nav";
import { getCategoryHighlights, getLatestPosts, getPopularPosts, getSiteSettings } from "@/lib/sanity/api";

export const revalidate = 120;

export default async function HomePage() {
  const [settings, latestPosts, popularPosts, categoryHighlights] = await Promise.all([
    getSiteSettings(),
    getLatestPosts(),
    getPopularPosts(),
    getCategoryHighlights(),
  ]);

  const featuredPost = latestPosts?.[0] ?? null;
  const latestGridPosts = featuredPost ? latestPosts?.slice(1, 7) ?? [] : latestPosts ?? [];
  const highlightedCategories = categoryHighlights ?? [];

  const heroTitle = settings?.siteTitle ?? "ブログ";
  const heroDescription =
    settings?.siteDescription ?? "個人が活躍し、稼ぐための情報を発信しています";
  const heroSettings = settings?.hero;
  const popularWidget = settings?.popularWidget;
  const siteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;

  const structuredData: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: heroTitle,
      description: heroDescription,
      ...(siteUrl ? { url: siteUrl } : {}),
      ...(siteUrl
        ? {
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/blog?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }
        : {}),
    },
  ];

  if (siteUrl) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: heroTitle,
          item: siteUrl,
        },
      ],
    });
  }

  return (
    <div className="space-y-0">
      {structuredData.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
      <Hero
        title={heroTitle}
        description={heroDescription}
        featuredPost={featuredPost}
        eyebrow={heroSettings?.eyebrow ?? undefined}
        primaryCta={heroSettings?.primaryCta ?? undefined}
        secondaryCta={heroSettings?.secondaryCta ?? undefined}
        metrics={heroSettings?.metrics ?? undefined}
        backgroundPreset={heroSettings?.backgroundPreset ?? undefined}
      />

      <CategoryNav categories={highlightedCategories} />

      <div className="bg-neutral-50/60">
        <Container className="space-y-16 py-16">
          <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            <div className="order-1 lg:order-2 lg:w-[360px] lg:flex-none">
              <PopularPosts
                posts={popularPosts ?? []}
                accentColor={popularWidget?.accentColor}
                showTimeline={popularWidget?.showTimeline}
                headerImage={popularWidget?.headerImage}
              />
            </div>
            <div className="order-2 lg:order-1 lg:flex-1">
              <Suspense
                fallback={
                  <div className="rounded-[32px] border border-dashed border-primary-900/20 bg-white/70 p-10 text-center text-sm text-neutral-500">
                    最新の記事を読み込み中です…
                  </div>
                }
              >
                <LatestSection posts={latestGridPosts} />
              </Suspense>
            </div>
          </section>

          {settings?.engagementCta && <EngagementCta settings={settings.engagementCta} />}

          {highlightedCategories.length > 0 ? (
            <section className="space-y-6">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Collections</p>
                <h2 className="text-3xl font-display font-semibold text-primary-900">カテゴリで深掘り</h2>
                <p className="text-neutral-600">学びたい領域にあわせて記事をまとめました。</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {highlightedCategories.map((category) => {
                  const description = category.description ?? category.featuredPost?.excerpt ?? "関連記事を集めました。";
                  return (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="group flex h-full flex-col gap-4 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(15,23,42,0.35)]"
                      aria-label={`${category.title}カテゴリーの記事一覧 (${category.postCount}件)`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
                        Category
                      </p>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-display font-semibold text-primary-900">{category.title}</h3>
                        <p className="line-clamp-3 text-sm text-neutral-600">{description}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between text-sm font-semibold text-primary-700">
                        <span className="inline-flex items-center gap-2">
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
                        <span className="text-xs font-medium text-primary-500/80">{category.postCount}件</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="rounded-[28px] border border-dashed border-primary-900/20 bg-white/80 p-8 text-center text-sm text-neutral-500">
              カテゴリ情報を取得できませんでした。Sanity でカテゴリを作成してからご確認ください。
            </section>
          )}

          <section className="space-y-6 rounded-[32px] border border-neutral-200 bg-white/95 p-8 shadow-soft">
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
          </section>
        </Container>
      </div>
    </div>
  );
}
