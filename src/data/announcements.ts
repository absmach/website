export interface Announcement {
  text: string;
  linkText: string;
  href: string;
}

// Keyed by product slug (matches the filename under src/pages/products/).
// Remove or replace an entry once the news is no longer current.
export const announcements: Partial<Record<string, Announcement>> = {
  atom: {
    text: "Atom v0.50.0 is here — runtime-configurable email templates, external event publishing, and certificate hardening.",
    linkText: "Read the announcement",
    href: "/blog/atom-v0-50-0-release/",
  },
  magistrala: {
    text: "Magistrala v0.50.0 is here — messaging hooks, Rules Engine loop prevention, and gRPC auth hardening.",
    linkText: "Read the announcement",
    href: "/blog/magistrala-v0-50-0-release/",
  },
  fluxmq: {
    text: "FluxMQ v0.50.0 is here — cluster reliability fixes, event hooks, and deterministic retained-message matching.",
    linkText: "Read the announcement",
    href: "/blog/fluxmq-v0-50-0-release/",
  },
};
