import type { PostDetail } from "@/lib/sanity/types";
import { PostMeta } from "./post-meta";

export const PostHeader = ({ post }: { post: PostDetail }) => (
  <header className="flex flex-col gap-6">
    <div className="space-y-4">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
        Blog
        <span className="h-[1px] w-8 bg-primary-200" aria-hidden="true" />
      </p>
      <h1 className="text-4xl font-display font-semibold leading-tight text-primary-900 sm:text-[2.75rem]">
        {post.title}
      </h1>
    </div>
    <p className="max-w-3xl text-lg leading-relaxed text-neutral-600">{post.excerpt}</p>
    <PostMeta post={post} />
  </header>
);
