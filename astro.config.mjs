import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://www.absmach.eu",
  output: "static",

  integrations: [
    tailwind(),
    sitemap({
      filenameBase: "sitemap", // This will output sitemap.xml
      changefreq: "hourly",
      priority: 1.0,
      serialize(item) {
        // Example: Get last modified date from frontmatter for content collections
        // let modifiedTime = item.frontmatter?.lastModified;

        // Example: If you have a custom function to get the date
        // const urlPath = new URL(item.url).pathname;
        // let modifiedTime = getLastModDate(urlPath);

        // If a valid date is found, add it to the sitemap item
        // The value should be an ISO formatted date string
        // if (modifiedTime) {
        //   item.lastmod = new Date(modifiedTime).toISOString();
        // }

        // For a simple, site-wide lastmod (less ideal for fresh content, but works)
        item.lastmod = new Date().toISOString(); // Sets all pages to the build time

        return item;
      },
    }),
  ],

  adapter: cloudflare(),
});