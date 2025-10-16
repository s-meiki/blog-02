import { createClient } from "@sanity/client";
import type { QueryParams, ClientConfig } from "@sanity/client";

import { mockSanityFetch } from "./mock-data";

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2023-10-01";
const token = process.env.SANITY_READ_TOKEN;

type RealSanityClient = ReturnType<typeof createClient>;

const mockConfig = {
  projectId: "mock-project",
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published" as const,
};

const createMockClient = (overrides: Partial<ClientConfig> = {}): RealSanityClient => {
  const client = {
    fetch: <T>(query: string, params: QueryParams = {}) => mockSanityFetch<T>(query, params),
    withConfig: () => client,
    config: () => ({ ...mockConfig, ...overrides }),
    clientConfig: { ...mockConfig, ...overrides },
  };
  return client as unknown as RealSanityClient;
};

if (!projectId) {
  console.warn("SANITY_PROJECT_ID が設定されていないため、スタブデータで動作しています。");
}

const baseConfig: ClientConfig | null = projectId
  ? {
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: !token && process.env.NODE_ENV === "production",
      perspective: "published",
    }
  : null;

const previewConfig: ClientConfig | null = baseConfig
  ? {
      ...baseConfig,
      useCdn: false,
      perspective: "previewDrafts",
    }
  : null;

export const sanityClient: RealSanityClient = baseConfig
  ? createClient(baseConfig)
  : createMockClient();

export const previewSanityClient: RealSanityClient = previewConfig
  ? createClient(previewConfig)
  : createMockClient({ perspective: "previewDrafts" });

export type SanityClient = RealSanityClient;
export const usingMockSanityClient = !baseConfig;
export const hasSanityToken = Boolean(token);
