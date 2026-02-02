import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

import type { PostListItem } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/format";

/**
 * Large hero-style card for the featured/latest post.
 */
export function FeaturedArticleCard({ post }: { post: PostListItem }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group relative block overflow-hidden rounded-[2rem] border border-primary-900/10 bg-gradient-to-br from-white via-white to-primary-50/60 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_100px_-50px_rgba(15,23,42,0.35)]"
            aria-label={`${post.title}の記事を読む`}
        >
            <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                {post.coverImage?.url && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-auto lg:h-auto lg:w-1/2">
                        <Image
                            src={post.coverImage.url}
                            alt={post.coverImage.alt ?? post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />
                    </div>
                )}

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-center gap-6 p-8 lg:p-12">
                    {/* Badge and Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-accent-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
                            Featured
                        </span>
                        {post.categories?.[0]?.title && (
                            <span className="inline-flex items-center rounded-full border border-primary-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary-600">
                                {post.categories[0].title}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-display font-bold leading-tight text-primary-900 transition-colors group-hover:text-primary-700 lg:text-4xl">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="line-clamp-3 text-base leading-relaxed text-neutral-600 lg:text-lg">
                        {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                        <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                            {formatDate(post.publishedAt)}
                        </time>
                        {post.readingTime && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {post.readingTime}分で読めます
                            </span>
                        )}
                        {post.author?.name && (
                            <span className="font-medium text-primary-600">{post.author.name}</span>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors group-hover:text-accent-600">
                        記事を読む
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
