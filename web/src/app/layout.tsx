import "./globals.css";

import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Poppins } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/ui/skip-link";
import { getSiteSettings } from "@/lib/sanity/api";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-noto" });
const display = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.siteTitle ?? "Sanity Blog";
  const description = settings?.siteDescription ?? "SanityとNext.jsで構築されたブログ";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: settings?.siteUrl ? new URL(settings.siteUrl) : undefined,
    openGraph: {
      title,
      description,
      siteName: title,
      type: "website",
      url: settings?.siteUrl,
      images: settings?.defaultOgImage ? [{ url: settings.defaultOgImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SkipLink />
        <Header settings={settings ?? undefined} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings ?? undefined} />
      </body>
    </html>
  );
}
