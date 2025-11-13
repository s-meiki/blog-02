"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

import type { AnalyticsPayload } from "@/lib/utils/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;

    window.dataLayer = window.dataLayer || [];
    const handleInteraction = (event: Event) => {
      if (typeof window.gtag !== "function") return;
      const customEvent = event as CustomEvent<AnalyticsPayload>;
      const detail = customEvent.detail;
      if (!detail) return;
      window.gtag("event", detail.id, detail.data ?? {});
    };

    window.addEventListener("analytics:interaction", handleInteraction);

    return () => window.removeEventListener("analytics:interaction", handleInteraction);
  }, []);

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: pathname || "/",
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
};
