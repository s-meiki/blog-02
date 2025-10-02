import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { PostPortableText } from "@/components/blog/portable-text/PostPortableText";
import { Container } from "@/components/layout/container";
import { getAllPages, getPageBySlug, getSiteSettings } from "@/lib/sanity/api";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { urlForImage } from "@/lib/image";

export const revalidate = 3600;

type PageParams = {
  slug: string;
};

type PageProps = {
  params: PageParams;
};

const stripTrailingSlash = (url?: string | null) => (url ? url.replace(/\/$/, "") : undefined);

const buildOgImage = (page: Awaited<ReturnType<typeof getPageBySlug>>, defaultOg?: string) => {
  const imageSource = page?.seo?.ogImage;
  if (imageSource?.asset?._ref) {
    return urlForImage(imageSource).width(1200).height(630).fit("crop").url();
  }
  return defaultOg;
};

export async function generateStaticParams() {
  const pages = await getAllPages();
  return (pages ?? [])
    .filter((entry): entry is { slug: string } => typeof entry?.slug === "string" && entry.slug.length > 0)
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(params.slug), getSiteSettings()]);

  if (!page) {
    return {
      title: "ページが見つかりません",
    };
  }

  const siteUrl = stripTrailingSlash(settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL);
  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? settings?.siteDescription;
  const canonical = page.seo?.canonicalUrl ?? (siteUrl ? `${siteUrl}/${page.slug}` : undefined);
  const ogImage = buildOgImage(page, settings?.defaultOgImage);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function StaticPage({ params }: PageProps) {
  const [page, settings] = await Promise.all([getPageBySlug(params.slug), getSiteSettings()]);

  if (!page) {
    notFound();
  }

  const siteUrl = stripTrailingSlash(settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL) ?? "";
  const canonical = page.seo?.canonicalUrl ?? (siteUrl ? `${siteUrl}/${page.slug}` : undefined);
  const homeUrl = siteUrl || "/";
  const pageUrl = canonical ?? (siteUrl ? `${siteUrl}/${page.slug}` : `/${page.slug}`);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: settings?.siteTitle ?? "ホーム", url: homeUrl },
    { name: page.title, url: pageUrl },
  ]);

  return (
    <>
      <Script id={`page-${page.slug}-breadcrumb`} type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <div className="py-16">
        <Container className="space-y-10">
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: page.title },
            ]}
          />
          <header className="space-y-3">
            <h1 className="text-4xl font-display font-bold text-neutral-900">{page.title}</h1>
            {page.seo?.description && <p className="max-w-2xl text-neutral-600">{page.seo.description}</p>}
          </header>
          <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <PostPortableText value={page.body} />
          </section>
        </Container>
      </div>
    </>
  );
}
