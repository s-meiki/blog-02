import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefBuilder: (page: number) => string;
};

export const Pagination = ({ currentPage, totalPages, hrefBuilder }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - currentPage) <= 2;
  });

  return (
    <nav className="flex justify-center">
      <ul className="flex items-center gap-2">
        {pages.map((page, index) => {
          const isGap = index > 0 && page !== pages[index - 1] + 1;
          return (
            <li key={page}>
              {isGap ? (
                <span className="px-2 text-sm text-neutral-400">…</span>
              ) : (
                <Link
                  href={hrefBuilder(page)}
                  className={cn(
                    "inline-flex min-w-[40px] items-center justify-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    page === currentPage
                      ? "border-primary-800 bg-primary-800 text-white shadow-soft"
                      : "border-primary-900/15 text-neutral-600 hover:border-primary-700 hover:text-primary-700",
                  )}
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
