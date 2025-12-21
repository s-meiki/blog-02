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
  const nav = [...(settings?.navigation ?? []), { label: "Blog", href: "/blog" }, { label: "Profile", href: "/profile" }, { label: "Newsletter", href: "/newsletter" }];

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
    <header className="sticky top-0 z-40 border-b border-primary-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-display font-semibold text-primary-800">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-200/70 text-xs font-semibold text-primary-700">
            {settings?.siteTitle?.[0] ?? "B"}
          </span>
          <span>{settings?.siteTitle ?? "Journal"}</span>
        </Link>
        <nav className="ml-auto mr-6 hidden items-center gap-7 text-sm font-medium text-primary-700 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative pb-1 transition-colors hover:text-accent-500"
            >
              <span className="relative inline-flex">
                {item.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent-400 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="検索"
            className="hidden rounded-full border border-primary-900/10 px-3 py-1.5 text-sm text-primary-700 transition-colors hover:border-primary-700 hover:text-primary-700 lg:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            検索
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-primary-900/15 p-2 text-primary-700 transition-colors hover:border-primary-700 hover:text-primary-700 lg:hidden"
            aria-label="検索モーダルを開く"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-primary-900/15 p-2 text-primary-700 transition-colors hover:border-primary-700 hover:text-primary-700 lg:hidden"
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
          "fixed inset-0 z-50 bg-neutral-50/95 backdrop-blur transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-display font-semibold text-primary-800" onClick={() => setOpen(false)}>
            {settings?.siteTitle ?? "Journal"}
          </Link>
          <button
            type="button"
            className="rounded-full border border-primary-900/10 p-2"
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-4 pb-8">
          <ul className="space-y-4 text-base font-medium text-primary-800">
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-full border border-primary-900/15 px-4 py-2 text-sm text-primary-700 transition hover:border-primary-700 hover:text-primary-700"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  検索する
                </span>
                <span className="text-xs text-neutral-400">Cmd / Ctrl + K</span>
              </button>
            </li>
            <li className="border-b border-primary-900/10" />
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
