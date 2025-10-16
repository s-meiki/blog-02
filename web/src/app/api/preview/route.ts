import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PREVIEW_SECRET = process.env.SANITY_PREVIEW_SECRET;

const sanitizeSlug = (slug: string) => slug.replace(/^\/+/, "").replace(/\/+$/, "");

const resolveRedirectPath = (type: string, slug?: string | null, explicitPath?: string | null) => {
  if (explicitPath) {
    return explicitPath.startsWith("/") ? explicitPath : `/${explicitPath}`;
  }

  if (!slug) return null;

  const normalizedSlug = sanitizeSlug(slug);

  if (type === "post") {
    return `/blog/${normalizedSlug}`;
  }

  if (type === "page") {
    if (normalizedSlug === "home" || normalizedSlug === "index") {
      return "/";
    }
    return `/${normalizedSlug}`;
  }

  return `/${normalizedSlug}`;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  const type = searchParams.get("type") ?? "post";
  const path = searchParams.get("path");

  if (PREVIEW_SECRET && secret !== PREVIEW_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const redirectPath = resolveRedirectPath(type, slug, path);

  if (!redirectPath) {
    return new NextResponse("Missing slug for preview", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  const redirectUrl = new URL(redirectPath, request.url);
  return NextResponse.redirect(redirectUrl);
}
