import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID ?? "",
    dataset: process.env.SANITY_DATASET ?? "production",
  },
  vite: {
    server: {
      port: Number(process.env.SANITY_STUDIO_PORT ?? 3333),
      open: false,
    },
  },
});
