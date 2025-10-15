import { cache } from "react";
import type { QueryParams } from "@sanity/client";

import { sanityClient } from "./client";

export type SanityFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

function normalize(value: unknown): unknown {
  if (value === undefined) return null;
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entry]) => [key, normalize(entry)])
        .filter(([, entry]) => entry !== undefined),
    );
  }
  return value;
}

export const sanityFetch = cache(
  async <T>(query: string, params: QueryParams = {}, options: SanityFetchOptions = {}) => {
    // 監視用：undefined があればログで気づけるように
    if (Object.values(params).some((value) => value === undefined)) {
      console.warn("[sanityFetch] params contained undefined", params);
    }

    const normalizedParams = normalize(params) as QueryParams;

    return sanityClient.fetch<T>(query, normalizedParams, {
      next: { revalidate: options.revalidate ?? 60, tags: options.tags },
    });
  }
);
