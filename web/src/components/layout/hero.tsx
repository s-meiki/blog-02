"use client";

import Image from "next/image";
import Link from "next/link";

import { Container } from "./container";
import type { PostListItem } from "@/lib/sanity/types";
import { trackInteraction } from "@/lib/utils/analytics";

type Cta = {
  label: string;
  href: string;
};

type Metric = {
  label: string;
  value: string;
};

export type HeroProps = {
  title: string;
  description: string;
  featuredPost?: PostListItem | null;
  eyebrow?: string;
  primaryCta?: Cta | null;
  secondaryCta?: Cta | null;
  metrics?: Metric[] | null;
  backgroundPreset?: "none" | "glow" | "vibrant";
};

const FALLBACK_PRIMARY_CTA: Cta = { label: "記事一覧へ", href: "/blog" };
const FALLBACK_SECONDARY_CTA: Cta = { label: "このサイトについて", href: "/about" };
const FALLBACK_METRICS: Metric[] = [
  { label: "公開記事", value: "120+" },
  { label: "購読者", value: "8,500" },
  { label: "更新頻度", value: "Weekly" },
];

export const Hero = ({
  title,
  description,
  featuredPost,
  eyebrow,
  primaryCta,
  secondaryCta,
  metrics,
  backgroundPreset,
}: HeroProps) => {
  const resolvedPrimary = primaryCta ?? FALLBACK_PRIMARY_CTA;
  const resolvedSecondary = secondaryCta ?? FALLBACK_SECONDARY_CTA;
  const displayMetrics = metrics && metrics.length > 0 ? metrics : FALLBACK_METRICS;
  const preset = backgroundPreset ?? "glow";

  const renderBackgroundEffects = () => {
    if (preset === "none") return null;

    if (preset === "glow") {
      return (
        <>
          <div className="absolute left-1/2 top-[-160px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,#55c1ff,#7c6cf4,#f3a6ff,#55c1ff)] opacity-30 blur-[150px] animate-slow-spin" />
          <div className="absolute right-6 bottom-0 h-48 w-48 rounded-full bg-accent-200/40 blur-3xl animate-drift" />
        </>
      );
    }

    return (
      <>
        <div className="absolute left-1/2 top-[-160px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_45deg_at_50%_50%,#93c5fd,#a78bfa,#f0abfc,#93c5fd)] opacity-40 blur-[140px] animate-slow-spin" />
        <div className="absolute inset-x-10 top-0 h-40 rounded-full bg-[radial-gradient(circle,_rgba(147,197,253,0.35),_transparent_65%)] blur-2xl" />
        <div className="absolute left-10 top-1/2 hidden h-32 w-32 rounded-full border border-white/30 sm:block" />
        <div className="absolute right-16 top-12 h-24 w-24 rounded-full border border-accent-200/80 blur-sm animate-drift" />
        <div className="absolute right-6 bottom-0 h-48 w-48 rounded-full bg-accent-200/40 blur-3xl animate-drift" />
      </>
    );
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-900/8 via-transparent to-accent-200/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,54,85,0.18),_transparent_55%)]" />
        {renderBackgroundEffects()}
      </div>
      <Container className="relative flex flex-col gap-14 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-8">
          <span className="inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary-600">
            <span className="h-px w-12 bg-accent-400" />
            {eyebrow ?? "Journal"}
          </span>
        <h1 className="text-4xl font-display font-semibold leading-tight text-primary-900 sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-lg text-neutral-600">{description}</p>
        <div className="flex flex-wrap gap-3">
          {resolvedPrimary && resolvedPrimary.href && (
            <Link
              href={resolvedPrimary.href}
              className="inline-flex items-center gap-2 rounded-full bg-primary-800 px-7 py-3 text-sm font-semibold text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-700"
              data-analytics-id="hero-primary-cta"
              onClick={() =>
                trackInteraction({
                  id: "hero-primary-cta",
                  data: { href: resolvedPrimary.href },
                })}
            >
              {resolvedPrimary.label}
            </Link>
          )}
          {resolvedSecondary && resolvedSecondary.href && (
            <Link
              href={resolvedSecondary.href}
              className="inline-flex items-center gap-2 rounded-full border border-primary-800/20 px-7 py-3 text-sm font-semibold text-primary-700 transition-colors duration-200 hover:border-primary-700 hover:text-primary-700"
              data-analytics-id="hero-secondary-cta"
              onClick={() =>
                trackInteraction({
                  id: "hero-secondary-cta",
                  data: { href: resolvedSecondary.href },
                })}
            >
              {resolvedSecondary.label}
            </Link>
          )}
        </div>
      </div>

      {featuredPost ? (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group w-full max-w-xl rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur-lg transition-transform duration-300 hover:-translate-y-1"
          data-analytics-id="hero-featured"
          onClick={() =>
            trackInteraction({
              id: "hero-featured",
              data: { slug: featuredPost.slug },
            })}
        >
          {featuredPost.coverImage?.url && (
            <div className="relative h-56 w-full overflow-hidden rounded-3xl">
              <Image
                src={featuredPost.coverImage.url}
                alt={featuredPost.coverImage.alt ?? featuredPost.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          )}
          <div className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              {featuredPost.categories?.[0]?.title ?? "Featured"}
            </p>
            <h3 className="text-2xl font-display font-semibold text-primary-900">
              {featuredPost.title}
            </h3>
            <p className="text-sm text-neutral-600 line-clamp-3">{featuredPost.excerpt}</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
              記事を読む
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </Link>
      ) : (
        <div className="grid w-full gap-6 sm:grid-cols-3 lg:w-auto">
          {displayMetrics.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-primary-900/5 bg-white/70 px-6 py-5 shadow-soft backdrop-blur"
            >
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-500">{item.label}</p>
              <p className="mt-3 font-display text-2xl text-primary-800">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </Container>
  </section>
);
};
