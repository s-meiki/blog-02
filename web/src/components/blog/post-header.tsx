import type { PostDetail } from "@/lib/sanity/types";
import { PostMeta } from "./post-meta";

export const PostHeader = ({ post }: { post: PostDetail }) => (
  <header className="space-y-6 border-b border-primary-900/10 pb-10">
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Blog</p>
      <h1 className="text-4xl font-display font-semibold text-primary-900 sm:text-5xl">{post.title}</h1>
    </div>
    <p className="max-w-2xl text-lg text-neutral-600">{post.excerpt}</p>
    <PostMeta post={post} />
  </header>
);
