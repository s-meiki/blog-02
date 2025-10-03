import { notFound } from "next/navigation";
import Script from "next/script";

import Image from "next/image";

import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { TableOfContents } from "@/components/blog/toc";
import { PostHeader } from "@/components/blog/post-header";
import { PostPortableText } from "@/components/blog/portable-text/PostPortableText";
import { RelatedPosts } from "@/components/blog/post-related";
import { PostSidebar } from "@/components/blog/post-sidebar";
import { ShareButtons } from "@/components/blog/share/ShareButtons";
import { Container } from "@/components/layout/container";
import { getPopularPosts, getSiteSettings } from "@/lib/sanity/api";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  postSlugsQuery,
  relatedPostsQuery,
  singlePostQuery,
} from "@/lib/sanity/queries";
import type { PostDetail, PostListItem } from "@/lib/sanity/types";
import { extractHeadings } from "@/lib/utils/headings";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(postSlugsQuery, {}, { revalidate: 3600, tags: ["post"] });
  return slugs?.map((entry) => ({ slug: entry.slug })) ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
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
  const [post, settings, popularPosts] = await Promise.all([
    sanityFetch<PostDetail | null>(singlePostQuery, { slug }, { revalidate: 60, tags: ["post", `post:${slug}`] }),
    getSiteSettings(),
    getPopularPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = await sanityFetch<PostListItem[]>(
    relatedPostsQuery,
    { slug, category: post.categories?.[0]?.slug },
    { revalidate: 300, tags: ["post"] },
  );

  const headings = extractHeadings(post.body as PortableTextBlock[] | undefined);
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
      <div className="py-16">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-12">
            <Breadcrumbs
              items={[
                { label: "ホーム", href: "/" },
                { label: "ブログ", href: "/blog" },
                { label: post.title },
              ]}
            />
            <PostHeader post={post} />
            {post.coverImage?.url && (
              <div className="overflow-hidden rounded-3xl">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt ?? post.title}
                  width={1600}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            )}
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-8">
                <PostPortableText value={post.body} />
                <ShareButtons post={post} />
              </div>
              <div className="sticky top-24 hidden lg:block">
                <TableOfContents headings={headings} />
              </div>
            </div>
            <RelatedPosts posts={relatedPosts ?? []} />
          </article>
          <div className="space-y-6">
            <TableOfContents headings={headings} />
            <PostSidebar post={post} popularPosts={popularPosts ?? []} />
          </div>
        </Container>
      </div>
    </>
  );
}
