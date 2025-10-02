import { NextResponse } from "next/server";

import { getLatestPosts, getSiteSettings } from "@/lib/sanity/api";

export const revalidate = 1800;

export async function GET() {
  const [settings, posts] = await Promise.all([getSiteSettings(), getLatestPosts()]);
  const configuredUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = configuredUrl ? configuredUrl.replace(/\/$/, "") : undefined;

  if (!siteUrl) {
    return NextResponse.json({ error: "Site URL is not configured" }, { status: 500 });
  }

  const feedItems = (posts ?? []).map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>
  `);

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[${settings?.siteTitle ?? "Sanity Blog"}]]></title>
      <link>${siteUrl}</link>
      <description><![CDATA[${settings?.siteDescription ?? "Sanity Blog feed"}]]></description>
      <language>ja</language>
      ${feedItems.join("\n")}
    </channel>
  </rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate",
    },
  });
}
