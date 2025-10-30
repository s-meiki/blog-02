import { notFound } from "next/navigation";
import Script from "next/script";

import Image from "next/image";
import { draftMode } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { PostHeader } from "@/components/blog/post-header";
import { RichTextContent } from "@/components/blog/RichTextContent";
import { RelatedPosts } from "@/components/blog/post-related";
import { ShareButtons } from "@/components/blog/share/ShareButtons";
import { Container } from "@/components/layout/container";
import { getSiteSettings } from "@/lib/sanity/api";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  postSlugsQuery,
  relatedPostsQuery,
  singlePostQuery,
} from "@/lib/sanity/queries";
import type { PostDetail, PostListItem } from "@/lib/sanity/types";
import { extractHeadingsFromMarkdown, extractHeadings } from "@/lib/utils/headings";
import { cn } from "@/lib/utils/cn";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(postSlugsQuery, {}, { revalidate: 3600, tags: ["post"] });
  return slugs?.map((entry) => ({ slug: entry.slug })) ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    noStore();
  }
  const post = await sanityFetch<PostDetail | null>(singlePostQuery, { slug }, { revalidate: 60, tags: ["post", `post:${slug}`] });
  if (!post) {
    return {
      title: "記事が見つかりません",
    };
  }
  const settings = await getSiteSettings();
  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.excerpt;
  const siteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const url = siteUrl ? `${siteUrl}/blog/${post.slug}` : undefined;
  const ogImage = post.seo?.ogImage?.asset?._ref ? undefined : post.coverImage?.url;

  return {
    title,
    description,
    alternates: {
      canonical: post.seo?.canonicalUrl ?? url,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: post.seo?.ogImage?.asset?._ref
        ? [{ url: `/api/og?slug=${post.slug}` }]
        : ogImage
        ? [{ url: ogImage }]
        : settings?.defaultOgImage
        ? [{ url: settings.defaultOgImage }]
        : undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.seo?.ogImage?.asset?._ref
        ? [`/api/og?slug=${post.slug}`]
        : ogImage
        ? [ogImage]
        : settings?.defaultOgImage
        ? [settings.defaultOgImage]
        : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    noStore();
  }
  const [post, settings] = await Promise.all([
    sanityFetch<PostDetail | null>(singlePostQuery, { slug }, { revalidate: 60, tags: ["post", `post:${slug}`] }),
    getSiteSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = await sanityFetch<PostListItem[]>(
    relatedPostsQuery,
    { slug, category: post.categories?.[0]?.slug },
    { revalidate: 300, tags: ["post"] },
  );

  const headings = post.bodyMarkdown
    ? extractHeadingsFromMarkdown(post.bodyMarkdown)
    : extractHeadings(post.body ?? undefined);
  const siteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = post.seo?.canonicalUrl ?? (siteUrl ? `${siteUrl}/blog/${post.slug}` : "");
  const structuredData = buildBlogPostingJsonLd(post, settings);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: settings?.siteTitle ?? "ホーム", url: siteUrl ?? "" },
    { name: "ブログ", url: siteUrl ? `${siteUrl}/blog` : "" },
    { name: post.title, url: canonical },
  ]);

  return (
    <>
      <Script id="post-ld-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-ld-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <div className="bg-gradient-to-b from-neutral-100/70 via-neutral-50 to-neutral-100/60 py-16">
        <Container className="flex flex-col items-center">
          <article className="w-full">
            <div className="mx-auto flex w-full max-w-[900px] flex-col gap-10">
              <Breadcrumbs
                items={[
                  { label: "ホーム", href: "/" },
                  { label: "ブログ", href: "/blog" },
                  { label: post.title },
                ]}
              />
              <div className="flex flex-col gap-10 rounded-[32px] border border-neutral-200/80 bg-white/95 p-8 shadow-[0_45px_100px_-50px_rgba(30,41,59,0.35)] backdrop-blur-sm sm:p-12 lg:p-14">
                <PostHeader post={post} />
                {post.coverImage?.url && (
                  <figure className="overflow-hidden rounded-[24px]">
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt ?? post.title}
                      width={1600}
                      height={900}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </figure>
                )}
                {headings.length > 0 && (
                  <div className="rounded-[24px] border border-neutral-200/80 bg-neutral-50/60 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">目次</p>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                      {headings.map((heading) => {
                        const indentClass =
                          heading.level === 3 ? "ml-4" : heading.level >= 4 ? "ml-8" : "";
                        return (
                          <li key={heading.id}>
                            <a
                              href={`#${heading.id}`}
                              className={cn(
                                "block rounded-lg px-2 py-1 transition hover:bg-primary-50/80 hover:text-primary-700",
                                indentClass,
                              )}
                            >
                              {heading.text}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <RichTextContent markdown={post.bodyMarkdown} portable={post.body ?? undefined} />
                <div className="border-t border-dashed border-neutral-200 pt-8">
                  <ShareButtons post={post} />
                </div>
              </div>
              <RelatedPosts posts={relatedPosts ?? []} />
            </div>
          </article>
        </Container>
      </div>
    </>
  );
}
