import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

const siteRedirects = {
  "/pricing": "/magistrala/pricing/",
  "/products/s0": "/products/a0",
  "/products/s1": "/products/a1",
  "/products/hardware": "/products/?focus=hardware",
  "/synth": "/products/synth/",
  "/projects": "/research/",
  "/projects/elastic": "/research/elastic/",
  "/projects/confidential6g": "/research/confidential6g/",
  "/preview/ai": "/",
  "/preview/ai/company": "/company/",
  "/preview/ai/contact": "/contact/",
  "/preview/ai/work": "/products/",
  ...Object.fromEntries(
    [
      "atomic",
      "parallax",
      "motif",
      "synth",
      "atom",
      "fluxmq",
      "magistrala",
      "propeller",
      "a0",
      "a1",
      "quarc",
    ].map((slug) => [`/preview/ai/work/${slug}`, `/products/${slug}/`]),
  ),
  "/preview/ai/research": "/research/",
  ...Object.fromEntries(
    ["elastic", "confidential6g"].map((slug) => [
      `/preview/ai/research/${slug}`,
      `/research/${slug}/`,
    ]),
  ),
  ...Object.fromEntries(
    ["nokia", "intel", "ericsson", "target"].map((slug) => [
      `/preview/ai/stories/${slug}`,
      `/stories/${slug}/`,
    ]),
  ),
};

export default defineConfig({
  site: "https://www.absmach.eu",
  output: "static",
  devToolbar: { enabled: false },

  redirects: siteRedirects,

  integrations: [
    tailwind(),
    sitemap({
      filenameBase: "sitemap-pages",
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, "");
        return (
          !path.startsWith("/preview/") &&
          ![
            "/pricing",
            "/synth",
            "/products/s0",
            "/products/s1",
            "/products/hardware",
            "/projects",
            "/projects/elastic",
            "/projects/confidential6g",
          ].includes(path)
        );
      },
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
