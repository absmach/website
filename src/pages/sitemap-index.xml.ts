import type { APIRoute } from "astro";

export const prerender = true;

const DEFAULT_SITE = "https://www.absmach.eu";

const DOCS_PRODUCTS = ["magistrala", "propeller", "hardware", "fluxmq", "atom"];

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.href.replace(/\/$/, "") : DEFAULT_SITE;

  const sitemaps = [
    `${base}/sitemap-pages-0.xml`,
    ...DOCS_PRODUCTS.map((p) => `${base}/docs/${p}/sitemap.xml`),
  ];

  const entries = sitemaps
    .map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
