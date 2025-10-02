import { NextResponse } from "next/server";

import { getSiteSettings } from "@/lib/sanity/api";

export async function GET() {
  const settings = await getSiteSettings();
  const siteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const content = [
    "User-agent: *",
    "Allow: /",
    siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
