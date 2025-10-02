import type { PostDetail, SiteSettings } from "@/lib/sanity/types";

export const buildBlogPostingJsonLd = (post: PostDetail, settings?: SiteSettings | null) => {
  const siteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = post.seo?.canonicalUrl ?? (siteUrl ? `${siteUrl}/blog/${post.slug}` : undefined);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    image: post.coverImage?.url ? [post.coverImage.url] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
          url: post.author.slug && siteUrl ? `${siteUrl}/author/${post.author.slug}` : undefined,
        }
      : undefined,
    publisher: settings?.siteTitle
      ? {
          "@type": "Organization",
          name: settings.siteTitle,
          logo: settings.defaultOgImage ? {
            "@type": "ImageObject",
            url: settings.defaultOgImage,
          } : undefined,
        }
      : undefined,
    mainEntityOfPage: canonical,
    articleSection: post.categories?.[0]?.title,
    keywords: post.tags?.join(", "),
  };
};

export const buildBreadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
