import { createClient } from "@sanity/client";
import type { QueryParams } from "@sanity/client";

import { mockSanityFetch } from "./mock-data";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2023-10-01";

type RealSanityClient = ReturnType<typeof createClient>;

const mockConfig = {
  projectId: "mock-project",
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published" as const,
};

const createMockClient = (): RealSanityClient => {
  const client = {
    fetch: <T>(query: string, params: QueryParams = {}) => mockSanityFetch<T>(query, params),
    withConfig: () => client,
    config: () => mockConfig,
    clientConfig: mockConfig,
  };
  return client as unknown as RealSanityClient;
};

if (!projectId) {
  console.warn("SANITY_PROJECT_ID が設定されていないため、スタブデータで動作しています。");
}

export const sanityClient: RealSanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
      perspective: "published",
    })
  : createMockClient();

export type SanityClient = RealSanityClient;
export const usingMockSanityClient = !projectId;
