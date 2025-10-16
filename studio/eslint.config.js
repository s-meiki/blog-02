import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const baseConfig = js.configs.recommended;

export default [
  {
    files: ["**/*.{ts,tsx,js}"],
    ignores: ["node_modules/**", "dist/**", ".sanity/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...baseConfig.languageOptions?.globals,
        process: "readonly",
        window: "readonly",
        document: "readonly",
        URL: "readonly",
        console: "readonly",
        HTMLFormElement: "readonly",
        fetch: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...baseConfig.rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },
];
