import Link from "next/link";

import type { SiteSettings } from "@/lib/sanity/types";

export const Footer = ({ settings }: { settings?: SiteSettings | null }) => {
  const year = new Date().getFullYear();
  const navigation = settings?.footerLinks ?? [];
  const socials = settings?.socialLinks ?? [];

  return (
    <footer className="border-t border-primary-900/15 bg-primary-900 text-neutral-100">
      <div className="mx-auto grid max-w-container gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16 lg:px-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-400/30 text-sm font-semibold text-accent-100">
              {settings?.siteTitle?.[0] ?? "B"}
            </span>
            <p className="text-xl font-display tracking-wide">{settings?.siteTitle ?? "Sanity Journal"}</p>
          </div>
          <p className="max-w-lg text-sm leading-7 text-neutral-200/90">{settings?.siteDescription}</p>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm uppercase tracking-[0.3em] text-neutral-300 transition-colors hover:text-accent-200"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">ナビゲーション</h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-200/90">
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-accent-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">お問い合わせ</h2>
            <p className="mt-4 text-sm text-neutral-200/80">
              {settings?.contactEmail ?? "hello@example.com"}
            </p>
            {settings?.siteUrl && (
              <p className="mt-2 text-sm text-neutral-200/60">{settings.siteUrl}</p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-primary-800/40 py-6 text-center text-xs text-neutral-300/80">
        © {year} {settings?.siteTitle ?? "Sanity Journal"}. All rights reserved.
      </div>
    </footer>
  );
};
