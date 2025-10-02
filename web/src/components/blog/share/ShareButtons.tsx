"use client";

import { useMemo } from "react";
import { Facebook, LinkIcon, Share2, Twitter } from "lucide-react";

import type { PostDetail } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";

const shareBase = {
  twitter: "https://twitter.com/intent/tweet",
  facebook: "https://www.facebook.com/sharer/sharer.php",
};

const openWindow = (url: string) => {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
};

export const ShareButtons = ({ post }: { post: PostDetail }) => {
  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
  const shareUrl = useMemo(() => `${origin ?? ""}/blog/${post.slug}`, [origin, post.slug]);

  const handleCopy = async () => {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("リンクをコピーしました");
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  const handleShare = (network: "twitter" | "facebook") => {
    const params = new URLSearchParams();
    params.set("url", shareUrl);
    if (network === "twitter") {
      params.set("text", post.title);
    }
    openWindow(`${shareBase[network]}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="font-medium text-neutral-600">この記事をシェアする</span>
      <button
        type="button"
        onClick={() => handleShare("twitter")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 transition hover:border-primary-400 hover:text-primary-600",
        )}
        aria-label="X (Twitter) でシェア"
      >
        <Twitter className="h-4 w-4" />
        X
      </button>
      <button
        type="button"
        onClick={() => handleShare("facebook")}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 transition hover:border-primary-400 hover:text-primary-600"
        aria-label="Facebook でシェア"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 transition hover:border-primary-400 hover:text-primary-600"
        aria-label="リンクをコピー"
      >
        <LinkIcon className="h-4 w-4" />
        コピー
      </button>
      {typeof navigator !== "undefined" && navigator.share ? (
        <button
          type="button"
          onClick={() => navigator.share({ title: post.title, url: shareUrl })}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 transition hover:border-primary-400 hover:text-primary-600"
          aria-label="共有メニューを開く"
        >
          <Share2 className="h-4 w-4" />
          共有
        </button>
      ) : null}
    </div>
  );
};
