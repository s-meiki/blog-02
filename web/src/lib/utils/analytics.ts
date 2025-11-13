export type AnalyticsPayload = {
  id: string;
  data?: Record<string, unknown>;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackInteraction = (payload: AnalyticsPayload) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("analytics:interaction", { detail: payload }));

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "interaction",
      ...payload,
    });
  }
};
