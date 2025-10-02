import Link from "next/link";

import type { SiteSettings } from "@/lib/sanity/types";

export const Footer = ({ settings }: { settings?: SiteSettings | null }) => {
  const year = new Date().getFullYear();
  const navigation = settings?.footerLinks ?? [];
  const socials = settings?.socialLinks ?? [];

  return (
    <footer className="bg-neutral-900 text-neutral-100">
      <div className="mx-auto grid max-w-container gap-12 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <p className="text-lg font-semibold">{settings?.siteTitle ?? "Sanity Blog"}</p>
          <p className="text-sm text-neutral-300">{settings?.siteDescription}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">ナビゲーション</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-200">
            {navigation.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">SNS</h2>
          <ul className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-200">
            {socials.map((social) => (
              <li key={social.platform}>
                <a href={social.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                  {social.platform.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-400">
        © {year} {settings?.siteTitle ?? "Sanity Blog"}. All rights reserved.
      </div>
    </footer>
  );
};
