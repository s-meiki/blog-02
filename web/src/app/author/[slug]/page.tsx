import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";

import { ArticleCard } from "@/components/blog/article-card";
import { BlogSearchForm } from "@/components/blog/blog-search-form";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/ui/pagination";
import {
  getAuthorBySlug,
  getPaginatedPosts,
  getPopularPosts,
  getSiteSettings,
} from "@/lib/sanity/api";
import { sanityFetch } from "@/lib/sanity/fetch";
import { authorSlugsQuery } from "@/lib/sanity/queries";

export const revalidate = 120;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(authorSlugsQuery, {}, { revalidate: 3600, tags: ["author"] });
  return slugs?.map((entry) => ({ slug: entry.slug })) ?? [];
}

const portableTextToPlainText = (blocks?: PortableTextBlock[]) =>
  blocks
    ?.map((block) =>
      block.children?.map((child) => (child as PortableTextSpan).text ?? "").join("") ?? "",
    )
    .join("\n")
    .trim();

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [author, settings] = await Promise.all([
    getAuthorBySlug(slug),
    getSiteSettings(),
  ]);

  if (!author) {
    return {
      title: "著者が見つかりません",
    };
  }

  const siteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const url = siteUrl ? `${siteUrl}/author/${author.slug}` : undefined;
  const description = portableTextToPlainText(author.bio) ?? `${author.name} の記事一覧`;

  return {
    title: `${author.name} の記事一覧`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${author.name} の記事一覧`,
      description,
      type: "profile",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} の記事一覧`,
      description,
    },
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const { slug } = await params;
  const queryParams = Object.fromEntries(
    Object.entries(resolvedParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  ) as Record<string, string | undefined>;

  const query = queryParams.q?.trim() || undefined;
  const page = toNumber(queryParams.page, 1);

  const [author, popularPosts, postsResult] = await Promise.all([
    getAuthorBySlug(slug),
    getPopularPosts(),
    getPaginatedPosts({ author: slug, query, page }),
  ]);

  if (!author) {
    notFound();
  }

  const searchParamsObj = new URLSearchParams();
  if (query) searchParamsObj.set("q", query);

  const buildHref = (pageNumber: number) => {
    const paramsClone = new URLSearchParams(searchParamsObj.toString());
    if (pageNumber <= 1) {
      paramsClone.delete("page");
    } else {
      paramsClone.set("page", String(pageNumber));
    }
    const queryString = paramsClone.toString();
    return queryString ? `/author/${slug}?${queryString}` : `/author/${slug}`;
  };

  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "著者", href: "/blog" },
            { label: author.name },
          ]}
        />
        <section className="flex flex-col gap-6 rounded-3xl border border-primary-900/10 bg-white/90 p-8 shadow-soft lg:flex-row lg:items-center">
          {author.avatar && (
            <Image
              src={author.avatar}
              alt={author.name}
              width={120}
              height={120}
              className="h-24 w-24 rounded-full object-cover"
            />
          )}
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-semibold text-primary-900">{author.name}</h1>
            {author.role && <p className="text-neutral-600">{author.role}</p>}
            {author.bio && author.bio.length > 0 && (
              <div className="prose prose-neutral max-w-none text-sm text-neutral-600">
                <PortableText value={author.bio} />
              </div>
            )}
            {author.socialLinks && author.socialLinks.length > 0 && (
              <ul className="flex flex-wrap gap-3 text-sm text-primary-600">
                {author.socialLinks.map((social) => (
                  <li key={social.platform}>
                    <a href={social.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <Suspense fallback={null}>
            <BlogSearchForm actionPath={`/author/${slug}`} />
          </Suspense>
          {postsResult.items.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {postsResult.items.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-primary-900/20 p-12 text-center text-neutral-500">
              この著者の記事はまだありません。
            </div>
          )}
          <Pagination
            currentPage={postsResult.page}
            totalPages={postsResult.pageCount}
            hrefBuilder={buildHref}
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-display text-primary-900">人気記事</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {(popularPosts ?? []).map((post) => (
              <li
                key={post._id}
                className="rounded-3xl border border-primary-900/10 bg-white/90 p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_22px_40px_-30px_rgba(26,38,49,0.35)]"
              >
                <Link href={`/blog/${post.slug}`} className="text-base font-medium text-primary-800 hover:text-primary-600">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </div>
  );
}
