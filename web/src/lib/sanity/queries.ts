import groq from "groq";

export const siteSettingsQuery = groq`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  siteTitle,
  siteDescription,
  siteUrl,
  contactEmail,
  "logo": logo.asset->url,
  "defaultOgImage": defaultOGImage.asset->url,
  navigation[]{label, href, external},
  footerLinks[]{label, href},
  socialLinks[]{platform, url}
}`;

export const latestPostsQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && publishedAt <= now()]
  | order(publishedAt desc)[0...6]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    readingTime,
    "coverImage": coverImage{
      "url": asset->url,
      alt
    },
    "author": author->{
      name,
      "slug": slug.current,
      "avatar": avatar.asset->url
    },
    "categories": categories[]->{title, "slug": slug.current},
    tags,
    popularScore
  }`;

export const popularPostsQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && publishedAt <= now()]
  | order(popularScore desc, publishedAt desc)[0...5]{
    _id,
    title,
    "slug": slug.current,
    publishedAt
  }`;

export const paginatedPostsQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && publishedAt <= now()
    && (!defined($search) || title match $pattern || excerpt match $pattern || $search in tags)
    && (!defined($category) || $category in categories[]->slug.current)
    && (!defined($tagSlug) || $tagSlug in tags)
    && (!defined($author) || $author == author->slug.current)
  ] | order(publishedAt desc)[$offset...$offset + $limit - 1]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    readingTime,
    "coverImage": coverImage{
      "url": asset->url,
      alt
    },
    "author": author->{
      name,
      "slug": slug.current,
      "avatar": avatar.asset->url
    },
    "categories": categories[]->{title, "slug": slug.current},
    tags,
    popularScore
  }`;

export const paginatedPostsCountQuery = groq`count(*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && publishedAt <= now()
    && (!defined($search) || title match $pattern || excerpt match $pattern || $search in tags)
    && (!defined($category) || $category in categories[]->slug.current)
    && (!defined($tagSlug) || $tagSlug in tags)
    && (!defined($author) || $author == author->slug.current)
  ])`;

export const singlePostQuery = groq`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body,
  publishedAt,
  updatedAt,
  readingTime,
  "coverImage": coverImage{
    "url": asset->url,
    alt
  },
  "author": author->{
    name,
    "slug": slug.current,
    role,
    "avatar": avatar.asset->url,
    bio
  },
  "categories": categories[]->{title, "slug": slug.current},
  tags,
  featured,
  popularScore,
  seo,
}`;

export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current }`;

export const relatedPostsQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && publishedAt <= now() && (!defined($category) || $category in categories[]->slug.current) && slug.current != $slug]
  | order(publishedAt desc)[0...3]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "coverImage": coverImage{
      "url": asset->url,
      alt
    }
  }`;

export const categorySlugsQuery = groq`*[_type == "category" && defined(slug.current)]{ "slug": slug.current }`;

export const categoryDetailQuery = groq`*[_type == "category" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  description,
  seo
}`;

export const tagSlugsQuery = groq`*[_type == "tag" && defined(slug.current)]{ "slug": slug.current }`;

export const tagDetailQuery = groq`*[_type == "tag" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  description,
}`;

export const authorSlugsQuery = groq`*[_type == "author" && defined(slug.current)]{ "slug": slug.current }`;

export const authorDetailQuery = groq`*[_type == "author" && slug.current == $slug][0]{
  name,
  "slug": slug.current,
  role,
  bio,
  "avatar": avatar.asset->url,
  socialLinks[]{platform, url}
}`;

export const allPublishedPostsForSitemapQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && publishedAt <= now()]{
  "slug": slug.current,
  publishedAt,
  updatedAt
}`;

export const allCategoriesForSitemapQuery = groq`*[_type == "category" && defined(slug.current)]{ "slug": slug.current }`;

export const allTagsForSitemapQuery = groq`*[_type == "tag" && defined(slug.current)]{ "slug": slug.current }`;

export const allAuthorsForSitemapQuery = groq`*[_type == "author" && defined(slug.current)]{ "slug": slug.current }`;

export const pageSlugsQuery = groq`*[_type == "page" && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current }`;

export const singlePageQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  body,
  seo,
}`;

export const allPagesForSitemapQuery = groq`*[_type == "page" && defined(slug.current) && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  "updatedAt": coalesce(_updatedAt, _createdAt)
}`;
