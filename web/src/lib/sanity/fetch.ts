import { cache } from "react";
import type { QueryParams } from "@sanity/client";

import { sanityClient } from "./client";

export type SanityFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

export const sanityFetch = cache(
  async <T>(query: string, params: QueryParams = {}, options: SanityFetchOptions = {}) => {
    return sanityClient.fetch<T>(query, params, {
      next: {
        revalidate: options.revalidate ?? 60,
        tags: options.tags,
      },
    });
  },
);
