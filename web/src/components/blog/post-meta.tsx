import Link from "next/link";

import type { PostDetail } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

export const PostMeta = ({ post }: { post: PostDetail }) => (
  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
    {post.readingTime && <span>{post.readingTime}分で読めます</span>}
    {post.author?.name && (
      <Link href={`/author/${post.author.slug}`} className="text-primary-700 hover:text-primary-600">
        {post.author.name}
      </Link>
    )}
    {post.categories?.map((category) => (
      <Link
        key={category.slug}
        href={`/category/${category.slug}`}
        className="rounded-full border border-primary-900/15 px-3 py-1 text-xs font-medium text-primary-700"
      >
        {category.title}
      </Link>
    ))}
  </div>
);
