import Image from "next/image";
import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

export const PopularPosts = ({ posts }: { posts: PostListItem[] }) => (
  <section className="rounded-3xl border border-primary-900/10 bg-white/90 p-6 shadow-soft">
    <h2 className="text-lg font-display text-primary-900">人気の記事</h2>
    <ol className="mt-5 space-y-4">
      {posts.map((post, index) => (
        <li key={post._id}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-transparent px-3 py-2 transition hover:border-primary-900/10 hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label={`${post.title}の記事を読む`}
          >
            <span className="text-2xl font-display font-semibold text-primary-200">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            {post.coverImage?.url ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt ?? post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="56px"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900/5 text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
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
          </Link>
        </li>
      ))}
    </ol>
  </section>
);
