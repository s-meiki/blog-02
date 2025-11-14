import Link from "next/link";

import { Container } from "@/components/layout/container";

type CategoryNavProps = {
  categories: {
    title: string;
    slug: string;
  }[];
};

export const CategoryNav = ({ categories }: CategoryNavProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="border-b border-neutral-200 bg-white/80 backdrop-blur">
      <Container className="flex flex-wrap items-center gap-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
          Categories
        </span>
        <nav className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-primary-900/10 bg-white px-3 py-1 text-sm font-semibold text-primary-700 shadow-[0_6px_20px_-12px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-primary-600/30 hover:text-primary-600"
            >
              {category.title}
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  );
};
