import type { APIRoute } from "astro";

export const prerender = true;

const DEFAULT_SITE = "https://www.absmach.eu";

export const GET: APIRoute = ({ site }) => {
  const base = site ? new URL(site) : new URL(DEFAULT_SITE);
  const sitemapURL = new URL("/sitemap-index.xml", base).href;

  const body = `# General rules
User-agent: *
Allow: /

# AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Sitemap
Sitemap: ${sitemapURL}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
