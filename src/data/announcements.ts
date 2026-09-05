export interface Announcement {
  text: string;
  linkText: string;
  href: string;
}

// Keyed by product slug (matches the filename under src/pages/products/).
// Remove or replace an entry once the news is no longer current.
export const announcements: Partial<Record<string, Announcement>> = {
  atom: {
    text: "Atom V1.0.0 LTS is here.",
    linkText: "View product",
    href: "/products/atom/",
  },
  fluxmq: {
    text: "FluxMQ V1.0.0 LTS is here.",
    linkText: "Read the announcement",
    href: "/blog/fluxmq-v1-0-0-release/",
  },
  magistrala: {
    text: "Magistrala V1.0.0 LTS is here.",
    linkText: "Read the announcement",
    href: "/blog/magistrala-v1-0-0-release/",
  },
};
