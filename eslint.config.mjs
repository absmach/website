import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";

const nodeGlobals = {
  URL: "readonly",
  URLSearchParams: "readonly",
  process: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  Buffer: "readonly",
  console: "readonly",
  fetch: "readonly",
};

const cjsGlobals = {
  module: "readonly",
  require: "readonly",
  exports: "writable",
  __dirname: "readonly",
  __filename: "readonly",
};

const workersGlobals = {
  Request: "readonly",
  Response: "readonly",
  Headers: "readonly",
  fetch: "readonly",
  console: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  crypto: "readonly",
  atob: "readonly",
  btoa: "readonly",
};

export default tseslint.config(
  {
    ignores: ["dist/", ".astro/", "node_modules/", ".wrangler/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    files: ["*.mjs", "*.config.mjs", "astro.config.mjs", "scripts/**/*.mjs"],
    languageOptions: { globals: nodeGlobals },
  },
  {
    files: ["*.cjs", "*.config.cjs"],
    languageOptions: { globals: cjsGlobals },
  },
  {
    files: ["src/pages/api/**"],
    languageOptions: { globals: workersGlobals },
  },
);
