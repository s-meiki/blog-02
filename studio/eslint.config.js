import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const baseConfig = js.configs.recommended;

export default [
  {
    files: ["**/*.{ts,tsx,js}"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...baseConfig.languageOptions?.globals,
        process: "readonly",
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
