import Image from "next/image";
import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const ArticleCard = ({ post, variant = "default" }: { post: PostListItem; variant?: "default" | "compact" }) => {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-primary-900/10 bg-white/90 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_-30px_rgba(26,38,49,0.35)]",
        variant === "compact" && "flex-row items-center gap-4 border-none bg-transparent shadow-none hover:translate-y-0",
      )}
    >
      {post.coverImage?.url && (
        <div className={cn("relative aspect-[16/9] w-full overflow-hidden", variant === "compact" && "h-24 w-32 flex-shrink-0 rounded-xl")}
        >
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            fill
            className={cn("object-cover transition-transform duration-500 group-hover:scale-105", variant === "compact" ? "rounded-xl" : "rounded-t-3xl")}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col gap-4 p-7", variant === "compact" && "gap-3 p-0")}
      >
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.35em] text-primary-500">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.readingTime ? <span>{post.readingTime}分</span> : null}
        </div>
        <div className="space-y-3">
          <Link
            href={`/blog/${post.slug}`}
            className="block text-2xl font-display font-semibold text-primary-900 transition-colors duration-300 group-hover:text-primary-600"
          >
            {post.title}
          </Link>
          <p className="line-clamp-3 text-sm text-neutral-600">
            {post.excerpt}
          </p>
        </div>
        <div className="mt-auto flex items-center gap-4 text-sm text-neutral-500">
          {post.author?.name && <span className="font-medium text-primary-600">{post.author.name}</span>}
          {post.categories?.[0]?.title && (
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-neutral-500">
              {post.categories[0].title}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
