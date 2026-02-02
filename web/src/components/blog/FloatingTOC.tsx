"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Heading = {
    id: string;
    text: string;
    level: number;
};

/**
 * Floating table of contents that sticks to the side on desktop.
 * Uses Intersection Observer for scroll-spy highlighting.
 */
export function FloatingTOC({ headings }: { headings: Heading[] }) {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                        break;
                    }
                }
            },
            {
                rootMargin: "-80px 0% -60% 0%",
                threshold: 0.1,
            }
        );

        const headingElements = headings
            .map((h) => document.getElementById(h.id))
            .filter(Boolean) as HTMLElement[];

        headingElements.forEach((el) => observer.observe(el));

        return () => {
            headingElements.forEach((el) => observer.unobserve(el));
        };
    }, [headings]);

    if (headings.length === 0) return null;

    const handleClick = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <nav
            className="sticky top-24 hidden max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-primary-900/10 bg-white/90 p-5 shadow-soft backdrop-blur-sm xl:block"
            aria-label="目次"
        >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
                目次
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-neutral-600">
                {headings.map((heading) => {
                    const isActive = activeId === heading.id;
                    const indentClass =
                        heading.level === 3 ? "ml-3" : heading.level >= 4 ? "ml-6" : "";

                    return (
                        <li key={heading.id}>
                            <button
                                type="button"
                                onClick={() => handleClick(heading.id)}
                                className={cn(
                                    "block w-full rounded-lg px-3 py-1.5 text-left transition-all duration-200",
                                    indentClass,
                                    isActive
                                        ? "bg-primary-50 font-medium text-primary-700"
                                        : "hover:bg-neutral-50 hover:text-primary-600"
                                )}
                            >
                                {heading.text}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
