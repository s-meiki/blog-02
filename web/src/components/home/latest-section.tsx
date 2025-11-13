"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArticleCard } from "@/components/blog/article-card";
import type { PostListItem } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";

type LatestSectionProps = {
  posts: PostListItem[];
};

type FilterOption = {
  label: string;
  value: string;
};

const buildCategoryFilters = (posts: PostListItem[]): FilterOption[] => {
  const map = new Map<string, string>();

  posts.forEach((post) => {
    post.categories?.forEach((category) => {
      if (!category?.slug || !category.title) return;
      if (map.has(category.slug)) return;
      map.set(category.slug, category.title);
    });
  });

  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
};

const buildTagFilters = (posts: PostListItem[]): FilterOption[] => {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      const normalized = tag?.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value]) => ({ value, label: value }));
};

export const LatestSection = ({ posts }: LatestSectionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const categoryFilters = useMemo(() => buildCategoryFilters(posts), [posts]);
  const tagFilters = useMemo(() => buildTagFilters(posts), [posts]);
  const [category, setCategory] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        category === "all" ||
        post.categories?.some((item) => item?.slug === category);
      const matchesTag = tag === "all" || post.tags?.includes(tag);
      return matchesCategory && matchesTag;
    });
  }, [posts, category, tag]);

  const handleFilterUpdate = (type: "category" | "tag", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(type);
    } else {
      params.set(type, value);
    }

    startTransition(() => {
      router.replace(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
        { scroll: false },
      );
    });
  };

  const handleCategoryChange = (next: string) => {
    setCategory(next);
    handleFilterUpdate("category", next);
  };

  const handleTagChange = (next: string) => {
    setTag(next);
    handleFilterUpdate("tag", next);
  };

  useEffect(() => {
    const param = searchParams.get("category") ?? "all";
    const isValid = param === "all" || categoryFilters.some((option) => option.value === param);
    if (isValid && param !== category) {
      setCategory(param);
    }
  }, [searchParams, categoryFilters, category]);

  useEffect(() => {
    const param = searchParams.get("tag") ?? "all";
    const isValid = param === "all" || tagFilters.some((option) => option.value === param);
    if (isValid && param !== tag) {
      setTag(param);
    }
  }, [searchParams, tagFilters, tag]);

  if (posts.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Latest
          </p>
          <h2 className="text-3xl font-display font-semibold text-primary-900">
            最新の記事
          </h2>
        </div>
        <p className="rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
          まだ記事がありません。Sanity Studio から記事を作成してください。
        </p>
      </section>
    );
  }

  const [featured, ...rest] = filteredPosts;

  const renderFilterButton = (
    option: FilterOption,
    activeValue: string,
    onClick: (value: string) => void,
  ) => (
    <button
      key={option.value}
      type="button"
      onClick={() => onClick(option.value)}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition",
        activeValue === option.value
          ? "border-primary-800 bg-primary-800 text-white shadow-soft"
          : "border-primary-900/15 text-primary-600 hover:border-primary-900/40",
      )}
      aria-pressed={activeValue === option.value}
      disabled={isPending}
    >
      {option.label}
    </button>
  );

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
            {filteredPosts.length} 件
          </span>
        </div>
        <p className="text-neutral-600">
          いま読みたいストーリーをカテゴリやタグで絞り込んでチェックできます。
        </p>
      </div>

      {categoryFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {renderFilterButton({ label: "すべて", value: "all" }, category, handleCategoryChange)}
          {categoryFilters.map((option) => renderFilterButton(option, category, handleCategoryChange))}
        </div>
      )}

      {tagFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {renderFilterButton({ label: "ALL TAGS", value: "all" }, tag, handleTagChange)}
          {tagFilters.map((option) => renderFilterButton(option, tag, handleTagChange))}
        </div>
      )}

      {featured ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2">
            <ArticleCard post={featured} variant="featured" />
          </div>
          {rest.length > 0 ? (
            rest.map((post) => <ArticleCard key={post._id} post={post} />)
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
              選択したフィルターに一致する記事が見つかりませんでした。
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary-900/20 p-10 text-center text-neutral-500">
          選択したフィルターに一致する記事が見つかりませんでした。
        </div>
      )}
    </section>
  );
};
