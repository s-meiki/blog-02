import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

export const PopularPosts = ({ posts }: { posts: PostListItem[] }) => (
  <section className="rounded-3xl border border-primary-900/10 bg-white/90 p-6 shadow-soft">
    <h2 className="text-lg font-display text-primary-900">人気の記事</h2>
    <ul className="mt-5 space-y-4">
      {posts.map((post) => (
        <li key={post._id} className="group flex flex-col gap-1">
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-primary-800 transition-colors duration-200 group-hover:text-primary-600"
          >
            {post.title}
          </Link>
          <time className="text-xs text-neutral-500" dateTime={post.publishedAt}>
            {formatDate(post.publishedAt, "yyyy/MM/dd")}
          </time>
        </li>
      ))}
    </ul>
  </section>
);
