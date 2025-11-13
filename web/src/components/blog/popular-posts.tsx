"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ImageWithAlt, PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";
import { trackInteraction } from "@/lib/utils/analytics";

type PopularPostsProps = {
  posts: PostListItem[];
  accentColor?: string | null;
  showTimeline?: boolean | null;
  headerImage?: ImageWithAlt | null;
};

export const PopularPosts = ({ posts, accentColor, showTimeline, headerImage }: PopularPostsProps) => {
  const accent = accentColor && /^#([\da-f]{3}){1,2}$/i.test(accentColor) ? accentColor : "#1d4ed8";
  const timelineVisible = showTimeline !== false;
  const headingImage = headerImage?.url ? headerImage : posts[0]?.coverImage;

  const gradientStyle: CSSProperties | undefined = timelineVisible
    ? { background: `linear-gradient(180deg, ${accent}40, ${accent})` }
    : undefined;

  const rankBadgeStyle: CSSProperties = {
    backgroundColor: accent,
    boxShadow: `0 10px 25px ${accent}40`,
  };

  const nodeStyle: CSSProperties = {
    backgroundColor: accent,
    boxShadow: `0 0 12px ${accent}80`,
  };

  const arrowStyle: CSSProperties = {
    color: accent,
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary-900/10 bg-white/95 p-6 shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/40 via-transparent to-accent-200/20" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {headingImage?.url && (
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-primary-900/10 bg-primary-50/60">
                <Image
                  src={headingImage.url}
                  alt={headingImage.alt ?? "人気の記事"}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Popular</p>
              <h2 className="text-lg font-display text-primary-900">人気の記事</h2>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
            Ranking
          </span>
        </div>
        <div className="relative pl-8">
          {timelineVisible && <span className="absolute left-4 top-0 h-full w-px opacity-80" style={gradientStyle} aria-hidden />}
          <ol className="space-y-6">
            {posts.map((post, index) => (
              <li key={post._id} className="relative">
                {timelineVisible && <span className="absolute -left-[11px] top-2 h-3 w-3 rounded-full border-2 border-white" style={nodeStyle} aria-hidden />}
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-transparent px-3 py-2 transition hover:border-primary-900/15 hover:bg-primary-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                  aria-label={`${post.title}の記事を読む`}
                  data-analytics-id="popular-post"
                  data-analytics-rank={index + 1}
                  data-analytics-slug={post.slug}
                  onClick={() =>
                    trackInteraction({
                      id: "popular-post",
                      data: { slug: post.slug, rank: index + 1 },
                    })}
                >
                  <div
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold text-white shadow-soft"
                    style={rankBadgeStyle}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                  {post.coverImage?.url ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl">
                      <Image
                        src={post.coverImage.url}
                        alt={post.coverImage.alt ?? post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-900/5 text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
                      {post.categories?.[0]?.title?.slice(0, 2) ?? "PB"}
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-primary-900 transition-colors duration-200 group-hover:text-primary-600">
                      {post.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      {post.categories?.[0]?.title && (
                        <span className="inline-flex items-center gap-1 font-semibold text-primary-600">
                          {post.categories[0].title}
                        </span>
                      )}
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, "yyyy/MM/dd")}</time>
                      {post.readingTime && <span>{post.readingTime}分</span>}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                    style={arrowStyle}
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
