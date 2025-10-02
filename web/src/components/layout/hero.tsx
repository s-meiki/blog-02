import Link from "next/link";

import { Container } from "./container";

export const Hero = ({ title, description }: { title: string; description: string }) => (
  <section className="bg-gradient-to-br from-primary-50 via-white to-accent-100/40 py-16 sm:py-20 lg:py-24">
    <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Sanity Blog</p>
        <h1 className="text-4xl font-display font-bold text-neutral-900 sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-lg text-neutral-600">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-500"
          >
            記事一覧へ
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary-400 hover:text-primary-600"
          >
            このサイトについて
          </Link>
        </div>
      </div>
    </Container>
  </section>
);
