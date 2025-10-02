import Image from "next/image";
import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const ArticleCard = ({ post, variant = "default" }: { post: PostListItem; variant?: "default" | "compact" }) => {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-soft",
        variant === "compact" && "flex-row items-center gap-4 border-none bg-transparent shadow-none hover:translate-y-0",
      )}
    >
      {post.coverImage?.url && (
        <div className={cn("relative aspect-[16/9] w-full", variant === "compact" && "h-24 w-32 flex-shrink-0")}>
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            fill
            className={cn("object-cover", variant === "compact" ? "rounded-xl" : "rounded-t-2xl")}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col gap-3 p-6", variant === "compact" && "p-0")}>
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-600">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.readingTime ? <span>{post.readingTime}分</span> : null}
        </div>
        <div className="space-y-3">
          <Link href={`/blog/${post.slug}`} className="block text-xl font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
            {post.title}
          </Link>
          <p className="line-clamp-3 text-sm text-neutral-600">{post.excerpt}</p>
        </div>
        <div className="mt-auto flex items-center gap-4 text-sm text-neutral-500">
          {post.author?.name && <span>{post.author.name}</span>}
          {post.categories?.[0]?.title && <span>{post.categories[0].title}</span>}
        </div>
      </div>
    </article>
  );
};
