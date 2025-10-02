import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "edge";

const secret = process.env.REVALIDATE_SECRET;

export async function POST(request: Request) {
  if (!secret) {
    return NextResponse.json({ message: "Secret is not configured" }, { status: 500 });
  }

  const headerList = await headers();
  const providedSecret = headerList.get("x-vercel-signature") ?? headerList.get("authorization") ?? "";
  if (providedSecret !== secret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const slug = payload?.slug ?? payload?.body?.slug;

  if (typeof slug !== "string") {
    return NextResponse.json({ message: "Slug not provided" }, { status: 400 });
  }

  try {
    revalidateTag("post");
    revalidateTag(`post:${slug}`);
    return NextResponse.json({ revalidated: true, slug });
  } catch (error) {
    return NextResponse.json({ message: "Failed to revalidate", error }, { status: 500 });
  }
}
