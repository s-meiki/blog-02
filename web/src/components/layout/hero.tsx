import Link from "next/link";

import { Container } from "./container";

export const Hero = ({ title, description }: { title: string; description: string }) => (
  <section className="relative overflow-hidden py-20 sm:py-24">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-900/8 via-transparent to-accent-200/30" />
    <Container className="relative flex flex-col gap-14 lg:flex-row lg:items-center">
      <div className="max-w-2xl space-y-8">
        <span className="inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary-600">
          <span className="h-px w-12 bg-accent-400" />
          Journal
        </span>
        <h1 className="text-4xl font-display font-semibold text-primary-900 sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-lg text-neutral-600">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-primary-800 px-7 py-3 text-sm font-semibold text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-700"
          >
            記事一覧へ
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-primary-800/20 px-7 py-3 text-sm font-semibold text-primary-700 transition-colors duration-200 hover:border-primary-700 hover:text-primary-700"
          >
            このサイトについて
          </Link>
        </div>
      </div>

      <div className="grid w-full gap-6 sm:grid-cols-3 lg:w-auto">
        {[
          { label: "公開記事", value: "120+" },
          { label: "購読者", value: "8,500" },
          { label: "更新頻度", value: "Weekly" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-primary-900/5 bg-white/70 px-6 py-5 shadow-soft backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-500">{item.label}</p>
            <p className="mt-3 font-display text-2xl text-primary-800">{item.value}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
);
