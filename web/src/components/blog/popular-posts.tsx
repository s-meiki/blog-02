import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

export const PopularPosts = ({ posts }: { posts: PostListItem[] }) => (
  <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-neutral-900">人気記事</h2>
    <ul className="mt-4 space-y-4">
      {posts.map((post) => (
        <li key={post._id} className="group flex flex-col gap-1">
          <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-neutral-800 transition-colors group-hover:text-primary-600">
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
