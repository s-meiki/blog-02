import Image from "next/image";
import Link from "next/link";

import type { PostDetail, PostListItem } from "@/lib/sanity/types";

type PostSidebarProps = {
  post: PostDetail;
  popularPosts: PostListItem[];
};

export const PostSidebar = ({ post, popularPosts }: PostSidebarProps) => (
  <aside className="space-y-8">
    {post.author && (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">著者について</h2>
        <div className="mt-4 flex items-center gap-4">
          {post.author.avatar && (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-base font-semibold text-neutral-900">{post.author.name}</p>
            {post.author.role && <p className="text-sm text-neutral-500">{post.author.role}</p>}
            <Link href={`/author/${post.author.slug}`} className="mt-2 inline-flex text-sm text-primary-600 hover:text-primary-500">
              プロフィールを見る →
            </Link>
          </div>
        </div>
      </section>
    )}

    {popularPosts.length > 0 && (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">人気記事</h2>
        <ul className="mt-4 space-y-4">
          {popularPosts.map((item) => (
            <li key={item._id}>
              <Link href={`/blog/${item.slug}`} className="text-sm text-neutral-700 transition-colors hover:text-primary-600">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )}
  </aside>
);
