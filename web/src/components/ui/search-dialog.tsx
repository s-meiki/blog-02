"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  categories: { title: string; slug: string }[];
};

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, prefersReducedMotion ? 0 : 50);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, prefersReducedMotion]);

  useEffect(() => {
    if (!open || !query) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results ?? []);
        setLoading(false);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") return;
        setLoading(false);
        setError("検索結果の取得に失敗しました。しばらくしてから再度お試しください。");
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        )).filter((element) => element.offsetParent !== null);

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query) return;
    onClose();
    router.push(`/blog?q=${encodeURIComponent(query)}`);
  };

  const dialog = (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-start justify-center bg-neutral-900/40 p-6 lg:items-center",
        prefersReducedMotion ? "" : "backdrop-blur-sm transition-opacity duration-200",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内検索"
        className={cn(
          "relative w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-2xl",
          prefersReducedMotion ? "" : "duration-200",
        )}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-neutral-100 px-6 py-4">
          <Search className="h-5 w-5 text-neutral-500" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="キーワードで検索"
            className="flex-1 bg-transparent text-base outline-none"
            aria-label="検索キーワード"
          />
          <button
            type="submit"
            className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            disabled={!query}
          >
            検索
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="検索モーダルを閉じる"
            className="rounded-full border border-transparent p-2 text-neutral-400 transition hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </form>
        <section className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {query.length === 0 && (
            <p className="text-sm text-neutral-500">検索キーワードを入力すると結果が表示されます。</p>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              検索中...
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && query && results.length === 0 && (
            <p className="text-sm text-neutral-500">
              「{query}」に一致する記事は見つかりませんでした。別のキーワードをお試しください。
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul className="space-y-4">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={`/blog/${result.slug}`}
                    onClick={onClose}
                    className="block rounded-2xl border border-neutral-200 p-4 transition hover:border-primary-200 hover:bg-primary-50/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-semibold text-neutral-900">{result.title}</h3>
                      <time className="text-xs text-neutral-500" dateTime={result.publishedAt}>
                        {formatDate(result.publishedAt)}
                      </time>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{result.excerpt}</p>
                    {result.categories && result.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.categories.map((category) => (
                          <span
                            key={category.slug}
                            className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600"
                          >
                            #{category.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        {query && (
          <div className="border-t border-neutral-100 px-6 py-3 text-right">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/blog?q=${encodeURIComponent(query)}`);
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              すべての検索結果を見る →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(dialog, document.body);
};
