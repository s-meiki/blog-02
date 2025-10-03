"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

export type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

export const TableOfContents = ({ headings }: { headings: HeadingItem[] }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const headingIds = useMemo(() => headings.map((heading) => heading.id), [headings]);

  useEffect(() => {
    const observers = headingIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        {
          rootMargin: "-40% 0px -40% 0px",
          threshold: 0,
        },
      );
      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [headingIds]);

  if (!headings.length) return null;

  return (
    <nav className="rounded-3xl border border-primary-900/10 bg-white/90 p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">目次</p>
      <ul className="mt-4 space-y-2 text-sm text-neutral-600">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block rounded-lg px-2 py-1 transition hover:bg-primary-50/80 hover:text-primary-700",
                activeId === heading.id && "bg-primary-50 text-primary-700 shadow-inset",
                heading.level === 3 && "ml-4",
                heading.level >= 4 && "ml-8",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
