import Link from "next/link";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

export const RelatedPosts = ({ posts }: { posts: PostListItem[] }) => {
  if (!posts?.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-900">関連記事</h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post._id} className="rounded-2xl border border-neutral-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
            <Link href={`/blog/${post.slug}`} className="text-lg font-medium text-neutral-900 hover:text-primary-600">
              {post.title}
            </Link>
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{post.excerpt}</p>
            <time dateTime={post.publishedAt} className="mt-3 block text-xs text-neutral-500">
              {formatDate(post.publishedAt)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
};
