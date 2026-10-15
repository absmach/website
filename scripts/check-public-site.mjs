import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import config from "../astro.config.mjs";

// Guard the public launch against accidentally restoring preview-only routes.
const products = [
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
];
const routes = [
  "/",
  "/company/",
  "/contact/",
  "/products/",
  "/research/",
  ...products.map((slug) => `/products/${slug}/`),
  ...["elastic", "confidential6g"].map((slug) => `/research/${slug}/`),
  ...["nokia", "intel", "ericsson", "target"].map(
    (slug) => `/stories/${slug}/`,
  ),
];
const readBuild = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");
const sitemap = await readBuild("sitemap-pages-0.xml");
for (const route of routes) {
  const html = await readBuild(`${route.slice(1)}index.html`);
  const canonical = `https://www.absmach.eu${route}`;
  assert.ok(
    html.includes(`rel="canonical" href="${canonical}"`),
    `Missing public canonical: ${route}`,
  );
  assert.ok(
    sitemap.includes(`<loc>${canonical}</loc>`),
    `Missing sitemap entry: ${route}`,
  );
  assert.ok(
    !/noindex|WEBSITE PREVIEW|View current website/.test(html),
    `Preview marker on ${route}`,
  );
  assert.ok(
    !/href="\/preview\/ai\/(?!media\/|fonts\/)/.test(html),
    `Preview navigation on ${route}`,
  );
}
const home = await readBuild("index.html");
assert.ok(
  home.includes('id="hero-video"'),
  "The redesigned homepage must be public",
);
assert.ok(
  home.includes('href="/products/propeller/"'),
  "Propeller must appear in the catalogue",
);
const contact = await readBuild("contact/index.html");
assert.ok(
  contact.includes('action="/api/contact"'),
  "Contact must submit to the existing API",
);
assert.ok(
  !contact.includes('id="contact-draft"'),
  "Contact must not use the preview draft workflow",
);
assert.ok(
  contact.includes('name="company"'),
  "Contact must retain the spam honeypot",
);

const redirects = (await readBuild("_redirects"))
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.trim().split(/\s+/));
for (const [from, to] of Object.entries(config.redirects)) {
  for (const alias of [from, `${from}/`]) {
    assert.ok(
      redirects.some(
        ([source, target, code]) =>
          source === alias && target === to && code === "301",
      ),
      `Missing permanent redirect: ${alias}`,
    );
    assert.ok(
      !sitemap.includes(`<loc>https://www.absmach.eu${alias}</loc>`),
      `Redirect in sitemap: ${alias}`,
    );
  }
}
console.log(
  `Public launch checks passed: ${routes.length} pages and ${Object.keys(config.redirects).length * 2} redirect variants.`,
);
