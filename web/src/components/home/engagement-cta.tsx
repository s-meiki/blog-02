"use client";

import Link from "next/link";

import type { EngagementCtaSettings } from "@/lib/sanity/types";
import { trackInteraction } from "@/lib/utils/analytics";

export const EngagementCta = ({ settings }: { settings?: EngagementCtaSettings }) => {
  if (!settings?.title) return null;

  const primary = settings.primaryCta;
  const secondary = settings.secondaryCta;

  return (
    <section className="overflow-hidden rounded-[40px] bg-gradient-to-br from-primary-900 via-primary-800 to-accent-500 text-white shadow-[0_40px_100px_-60px_rgba(5,8,30,0.9)]">
      <div className="grid gap-8 px-8 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div className="space-y-5">
          {settings.badge ? (
            <span className="inline-flex items-center rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              {settings.badge}
            </span>
          ) : null}
          <h2 className="text-3xl font-display font-semibold leading-tight">
            {settings.title}
          </h2>
          {settings.description && (
            <p className="text-white/80">
              {settings.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            {primary?.href && (
              <Link
                href={primary.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-primary-900 transition hover:-translate-y-0.5"
                data-analytics-id="engagement-primary-cta"
                onClick={() => trackInteraction({ id: "engagement-primary-cta", data: { href: primary.href } })}
              >
                {primary.label ?? "参加する"}
              </Link>
            )}
            {secondary?.href && (
              <Link
                href={secondary.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:border-white"
                data-analytics-id="engagement-secondary-cta"
                onClick={() => trackInteraction({ id: "engagement-secondary-cta", data: { href: secondary.href } })}
              >
                {secondary.label ?? "詳細を見る"}
              </Link>
            )}
          </div>
        </div>
        {settings.socialProof && settings.socialProof.length > 0 && (
          <div className="space-y-4 rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Social Proof
            </p>
            <dl className="space-y-3">
              {settings.socialProof.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex items-center justify-between text-sm text-white/80">
                  <dt>{item.label}</dt>
                  <dd className="text-base font-semibold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
};
