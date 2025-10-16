import { cache } from "react";
import { draftMode } from "next/headers";
import type { QueryParams } from "@sanity/client";

import { previewSanityClient, sanityClient, usingMockSanityClient } from "./client";

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

const fetchPublished = cache(
  async <T>(query: string, params: QueryParams = {}, options: SanityFetchOptions = {}) => {
    if (Object.values(params).some((value) => value === undefined)) {
      console.warn("[sanityFetch] params contained undefined", params);
    }

    const normalizedParams = normalize(params) as QueryParams;

    return sanityClient.fetch<T>(query, normalizedParams, {
      next: { revalidate: options.revalidate ?? 60, tags: options.tags },
    });
  },
);

const fetchPreview = async <T>(query: string, params: QueryParams = {}) => {
  if (Object.values(params).some((value) => value === undefined)) {
    console.warn("[sanityFetch][preview] params contained undefined", params);
  }

  const normalizedParams = normalize(params) as QueryParams;

  return previewSanityClient.fetch<T>(query, normalizedParams);
};

const isDraftModeEnabled = () => {
  try {
    return draftMode().isEnabled;
  } catch {
    return false;
  }
};

export const sanityFetch = async <T>(
  query: string,
  params: QueryParams = {},
  options: SanityFetchOptions = {},
) => {
  if (isDraftModeEnabled() && !usingMockSanityClient) {
    return fetchPreview<T>(query, params);
  }

  return fetchPublished<T>(query, params, options);
};
