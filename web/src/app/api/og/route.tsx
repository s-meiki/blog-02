import React from "react";
import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/sanity/api";
import { sanityFetch } from "@/lib/sanity/fetch";
import { singlePostQuery } from "@/lib/sanity/queries";
import type { PostDetail } from "@/lib/sanity/types";

export const runtime = "edge";

const loadPost = async (slug: string) =>
  sanityFetch<PostDetail | null>(singlePostQuery, { slug }, { revalidate: 60, tags: ["post", `post:${slug}`] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const post = slug ? await loadPost(slug) : null;
  const settings = await getSiteSettings();

  const title = post?.title ?? settings?.siteTitle ?? "Sanity Blog";
  const subtitle = post?.excerpt ?? settings?.siteDescription ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: "Noto Sans JP, sans-serif",
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 500, opacity: 0.8 }}>{settings?.siteTitle ?? "Sanity Blog"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{subtitle}</div>
          )}
        </div>
        <div style={{ fontSize: 20, opacity: 0.7 }}>{settings?.siteUrl ?? ""}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
