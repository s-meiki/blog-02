"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";

import type { SiteSettings } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";
import { SearchDialog } from "@/components/ui/search-dialog";

type HeaderProps = {
  settings?: SiteSettings | null;
};

export const Header = ({ settings }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = settings?.navigation ?? [];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isK = event.key === "k" || event.key === "K";
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
          <span>{settings?.siteTitle ?? "Blog"}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative transition-colors hover:text-primary-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="検索"
            className="hidden rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:border-primary-400 hover:text-primary-600 lg:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            検索
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-primary-400 hover:text-primary-600 lg:hidden"
            aria-label="検索モーダルを開く"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-primary-400 hover:text-primary-600 lg:hidden"
            aria-label="メニューを開く"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden",
          "fixed inset-0 z-50 bg-white/95 backdrop-blur transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-primary-700" onClick={() => setOpen(false)}>
            {settings?.siteTitle ?? "Blog"}
          </Link>
          <button
            type="button"
            className="rounded-full border border-neutral-200 p-2"
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-4 pb-8">
          <ul className="space-y-4 text-base font-medium text-neutral-700">
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition hover:border-primary-300 hover:text-primary-600"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  検索する
                </span>
                <span className="text-xs text-neutral-400">Cmd / Ctrl + K</span>
              </button>
            </li>
            <li className="border-b border-neutral-200" />
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};
