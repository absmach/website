export interface Announcement {
  text: string;
  linkText: string;
  href: string;
}

// Keyed by product slug (matches the filename under src/pages/products/).
// Remove or replace an entry once the news is no longer current.
export const announcements: Partial<Record<string, Announcement>> = {
  atom: {
    text: "Atom v0.40.0 is here — scoped access tokens, soft-delete & restore, and gRPC AuthN over TLS.",
    linkText: "Read the announcement",
    href: "/blog/atom-v0-40-0-release/",
  },
  magistrala: {
    text: "Magistrala v1.0.0 is here: stable APIs, Atom for identity, FluxMQ for messaging.",
    linkText: "Read the announcement",
    href: "/blog/magistrala-v1-0-0-release/",
  },
};
