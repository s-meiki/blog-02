import { visionTool } from "@sanity/vision";
import { deskTool } from "sanity/desk";
import { defineConfig } from "sanity";

import { structure, canUseAction, defaultDocumentNode } from "./structure";
import schemaTypes from "./schemaTypes";

const projectId = process.env.SANITY_PROJECT_ID || "uxywiuqh";
const dataset = process.env.SANITY_DATASET || "production";

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
  ],
  document: {
    actions: (prev, context) =>
      prev.filter((actionItem) =>
        canUseAction({
          schemaType: context.schemaType,
          action: actionItem.action || actionItem.name || "",
        })
      ),
  },
});
