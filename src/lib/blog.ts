import type { CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blogs">;

/** Product filters offered on the blog index, matched against post tags. */
export const PRODUCT_CATEGORIES = [
  { key: "MG", label: "Magistrala", matchTags: ["mg", "magistrala"] },
  { key: "ATOM", label: "Atom", matchTags: ["atom"] },
  { key: "FLUXMQ", label: "FluxMQ", matchTags: ["fluxmq"] },
  {
    key: "PROPELLER",
    label: "Propeller",
    matchTags: ["propeller", "properller"],
  },
  { key: "SYNTH", label: "Synth", matchTags: ["synth", "synth-ee"] },
  { key: "A0", label: "A0", matchTags: ["a0", "a0 gateway"] },
  { key: "A1", label: "A1", matchTags: ["a1", "a1 gateway"] },
];

export interface BlogSummary {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  dateISO: string;
  dateLabel: string;
  tags: string[];
  category: string;
  categoryLabel: string;
  featured: boolean;
  author: string;
  authorPicture: string | null;
  coverImage: string | null;
  readingMinutes: number;
}

const stripMarkdown = (content = "") =>
  String(content)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const estimateReadingMinutes = (content = "") => {
  const plain = stripMarkdown(content);
  const words = plain ? plain.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
};

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const categoryLabel = (category?: string) => {
  const normalized = (category ?? "").toLowerCase().trim();
  if (!normalized || normalized === "blog") return "Article";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const postSlug = (entry: BlogEntry) => entry.data.slug ?? entry.slug;

export const postHref = (entry: BlogEntry) => `/blog/${postSlug(entry)}/`;

export const isRasterImage = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext ?? "");
};

export function summarizePost(entry: BlogEntry): BlogSummary {
  const date =
    entry.data.date instanceof Date
      ? entry.data.date
      : new Date(entry.data.date);
  return {
    slug: postSlug(entry),
    href: postHref(entry),
    title: entry.data.title,
    description: entry.data.description,
    date,
    dateISO: date.toISOString(),
    dateLabel: formatDate(date),
    tags: entry.data.tags ?? [],
    category: (entry.data.category ?? "").toLowerCase().trim(),
    categoryLabel: categoryLabel(entry.data.category),
    featured: entry.data.featured ?? false,
    author: entry.data.author?.name ?? "Abstract Machines",
    authorPicture: entry.data.author?.picture ?? null,
    coverImage: entry.data.coverImage ?? entry.data.heroImage ?? null,
    readingMinutes: estimateReadingMinutes(entry.body ?? ""),
  };
}

/** Featured posts first, then newest first. */
export const sortPosts = (posts: BlogSummary[]) =>
  [...posts].sort((a, b) => {
    if (a.featured !== b.featured)
      return Number(b.featured) - Number(a.featured);
    return b.date.getTime() - a.date.getTime();
  });
