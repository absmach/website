import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://www.absmach.eu",
  output: "static",
  devToolbar: { enabled: false },

  redirects: {
    "/pricing": "/magistrala/pricing/",
    "/products/s0": "/products/a0",
    "/products/s1": "/products/a1",
  },

  integrations: [
    tailwind(),
    sitemap({
      filenameBase: "sitemap-pages",
      serialize(item) {
        const path = new URL(item.url).pathname;

        if (/^\/(privacy|imprint|terms)\/?$/.test(path)) {
          item.priority = 0.3;
          item.changefreq = "yearly";
        } else if (/^\/blog\/[^/]+\/?$/.test(path)) {
          item.priority = 0.8;
          item.changefreq = "monthly";
        } else if (/^\/blog\/?$/.test(path)) {
          item.priority = 0.8;
          item.changefreq = "daily";
        } else if (/^\/solutions\/[^/]+\/?$/.test(path)) {
          item.priority = 0.8;
          item.changefreq = "weekly";
        } else if (/^\/products\/[^/]+\/?$/.test(path)) {
          item.priority = 0.9;
          item.changefreq = "weekly";
        } else if (path === "/" || path === "") {
          item.priority = 1.0;
          item.changefreq = "daily";
        } else {
          item.priority = 0.7;
          item.changefreq = "weekly";
        }

        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],

  adapter: cloudflare(),
});
