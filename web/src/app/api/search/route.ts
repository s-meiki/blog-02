import { NextResponse } from "next/server";

import { getPaginatedPosts } from "@/lib/sanity/api";

const MAX_RESULTS = 8;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ query: "", results: [] });
  }

  try {
    const { items } = await getPaginatedPosts({ query, limit: MAX_RESULTS, page: 1 });
    const results = items.map((item) => ({
      id: item._id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      publishedAt: item.publishedAt,
      categories: item.categories ?? [],
    }));

    return NextResponse.json({ query, results });
  } catch {
    return NextResponse.json({ query, results: [], error: "Failed to fetch search results" }, { status: 500 });
  }
}
