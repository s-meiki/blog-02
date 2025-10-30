import { deskTool } from "sanity/desk";
import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { markdownSchema } from "sanity-plugin-markdown";

import { structure, canUseAction, defaultDocumentNode } from "./structure";
import schemaTypes from "./schemaTypes";

const importMetaEnv =
  (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env ?? {};

const projectId =
  process.env.SANITY_PROJECT_ID ??
  importMetaEnv.SANITY_STUDIO_PROJECT_ID ??
  importMetaEnv.SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_DATASET ??
  importMetaEnv.SANITY_STUDIO_DATASET ??
  importMetaEnv.SANITY_DATASET;

if (!projectId) throw new Error("Missing SANITY_PROJECT_ID for Studio");
if (!dataset) throw new Error("Missing SANITY_DATASET for Studio");

export default defineConfig({
  name: "blog-studio",
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? "Sanity Blog Studio",
  projectId,
  dataset,
  basePath: "/",
  schema: {
    types: schemaTypes,
  },
  plugins: [
    deskTool({
      structure,
      defaultDocumentNode,
    }),
    visionTool(),
    markdownSchema(),
  ],
  document: {
    actions: (prev, context) =>
      prev.filter((actionItem) =>
        canUseAction({
          schemaType: context.schemaType,
          action: actionItem.action || actionItem.name || "",
        }),
      ),
  },
});
