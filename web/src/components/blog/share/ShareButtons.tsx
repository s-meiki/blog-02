"use client";

import { useEffect, useMemo, useState } from "react";
import { Facebook, LinkIcon, Share2, Twitter } from "lucide-react";

import type { PostDetail } from "@/lib/sanity/types";
const shareBase = {
  twitter: "https://twitter.com/intent/tweet",
  facebook: "https://www.facebook.com/sharer/sharer.php",
};

const openWindow = (url: string) => {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
};

const legacyCopyToClipboard = (text: string) => {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch (error) {
    console.error("Legacy copy failed", error);
    return false;
  }
};

export const ShareButtons = ({ post }: { post: PostDetail }) => {
  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
  const shareUrl = useMemo(() => `${origin ?? ""}/blog/${post.slug}`, [origin, post.slug]);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    const fallback = () => {
      if (legacyCopyToClipboard(shareUrl)) {
        alert("リンクをコピーしました");
      } else {
        alert("この環境ではコピーできません。手動で URL をコピーしてください。");
      }
    };

    if (!window.isSecureContext || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      fallback();
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("リンクをコピーしました");
    } catch (error) {
      console.warn("Clipboard API not available, fallback to legacy copy.", error);
      fallback();
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
    <div className="flex flex-wrap items-center gap-3 text-sm text-primary-800">
      <span className="font-medium text-neutral-600">この記事をシェアする</span>
      <button
        type="button"
        onClick={() => handleShare("twitter")}
        className="inline-flex items-center gap-2 rounded-full border border-primary-900/15 px-4 py-2 transition hover:border-primary-700 hover:text-primary-700"
        aria-label="X (Twitter) でシェア"
      >
        <Twitter className="h-4 w-4" />
        X
      </button>
      <button
        type="button"
        onClick={() => handleShare("facebook")}
        className="inline-flex items-center gap-2 rounded-full border border-primary-900/15 px-4 py-2 transition hover:border-primary-700 hover:text-primary-700"
        aria-label="Facebook でシェア"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-primary-900/15 px-4 py-2 transition hover:border-primary-700 hover:text-primary-700"
        aria-label="リンクをコピー"
      >
        <LinkIcon className="h-4 w-4" />
        コピー
      </button>
      {canShare ? (
        <button
          type="button"
          onClick={() => navigator.share({ title: post.title, url: shareUrl })}
          className="inline-flex items-center gap-2 rounded-full border border-primary-900/15 px-4 py-2 transition hover:border-primary-700 hover:text-primary-700"
          aria-label="共有メニューを開く"
        >
          <Share2 className="h-4 w-4" />
          共有
        </button>
      ) : null}
    </div>
  );
};
