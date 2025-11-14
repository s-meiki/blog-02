"use client";

import { ArticleCard } from "@/components/blog/article-card";
import type { PostListItem } from "@/lib/sanity/types";

type LatestSectionProps = {
  posts: PostListItem[];
};

export const LatestSection = ({ posts }: LatestSectionProps) => {
  if (posts.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Latest
          </p>
          <h2 className="text-3xl font-display font-semibold text-primary-900">最新の記事</h2>
        </div>
        <p className="rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
          まだ記事がありません。Sanity Studio から記事を作成してください。
        </p>
      </section>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
          Latest
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-display font-semibold text-primary-900">
            最新の記事
          </h2>
          <span className="rounded-full border border-primary-900/10 px-3 py-1 text-xs font-semibold text-primary-600">
            {posts.length} 件
          </span>
        </div>
        <p className="text-neutral-600">
          気になるテーマをサクッとチェック。編集部がピックアップした最新コンテンツをお届けします。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featured && (
          <div className="md:col-span-2">
            <ArticleCard post={featured} variant="featured" />
          </div>
        )}
        {rest.length > 0 ? (
          rest.map((post) => <ArticleCard key={post._id} post={post} />)
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
            他の記事が追加されるまで少々お待ちください。
          </div>
        )}
      </div>
    </section>
  );
};
