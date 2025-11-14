import Image from "next/image";
import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ArticleCardVariant = "default" | "compact" | "featured";

export const ArticleCard = ({
  post,
  variant = "default",
}: {
  post: PostListItem;
  variant?: ArticleCardVariant;
}) => {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  const articleClassName = cn(
    "flex h-full flex-col overflow-hidden rounded-3xl border border-primary-900/10 bg-white/90 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_45px_-30px_rgba(26,38,49,0.35)]",
    isCompact && "flex-row items-center gap-4 border-none bg-transparent shadow-none group-hover:translate-y-0",
    isFeatured &&
      "md:flex-row md:items-center md:gap-10 border-primary-900/5 bg-gradient-to-br from-white via-white to-primary-50/80 p-4 md:p-6 lg:p-8",
  );

  const imageWrapperClassName = cn(
    "relative aspect-[16/9] w-full overflow-hidden",
    isCompact && "h-24 w-32 flex-shrink-0 rounded-xl",
    isFeatured && "aspect-auto h-56 w-full flex-none overflow-hidden rounded-[28px] md:h-80 md:w-1/2",
  );

  const bodyClassName = cn(
    "flex flex-1 flex-col gap-4 p-7",
    isCompact && "gap-3 p-0",
    isFeatured && "gap-5 p-0",
  );

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        isCompact && "focus-visible:ring-offset-0",
      )}
      aria-label={`${post.title}の記事を読む`}
    >
      <article className={articleClassName}>
        {post.coverImage?.url && (
          <div className={imageWrapperClassName}>
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt ?? post.title}
              fill
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-105",
                isCompact ? "rounded-xl" : "rounded-t-3xl",
                isFeatured && "rounded-[28px]",
              )}
              sizes={isFeatured ? "(max-width: 1280px) 50vw, 560px" : "(max-width: 768px) 100vw, 33vw"}
            />
          </div>
        )}
        <div className={bodyClassName}>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.35em] text-primary-500">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.readingTime ? <span>{post.readingTime}分</span> : null}
          </div>
          <div className="space-y-3">
            <h3
              className={cn(
                "text-2xl font-display font-semibold text-primary-900 transition-colors duration-300 group-hover:text-primary-600",
                isFeatured && "text-3xl md:text-4xl",
              )}
            >
              {post.title}
            </h3>
            <p className={cn("line-clamp-3 text-sm text-neutral-600", isFeatured && "text-base text-neutral-700")}>
              {post.excerpt}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            {post.author?.name && (
              <span className="font-medium text-primary-600">
                {post.author.name}
              </span>
            )}
            {post.categories?.[0]?.title && (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-neutral-500">
                {post.categories[0].title}
              </span>
            )}
            {isFeatured && post.tags?.length ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-900/5 px-3 py-1 text-xs font-semibold text-primary-700">
                #{post.tags[0]}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
};
