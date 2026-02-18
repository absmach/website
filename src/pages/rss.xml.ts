import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

const DEFAULT_SITE = "https://absmach.eu";

export async function GET(context: APIContext) {
  const posts = await getCollection("blogs", ({ data }) => !data.draft);

  return rss({
    title: "Abstract Machines Blog",
    description:
      "Technical articles, product updates, and engineering deep dives from the Abstract Machines team.",
    site: context.site ?? DEFAULT_SITE,
    customData: `<language>en-us</language>`,
    items: posts
      .map((post) => {
        const slug = post.data.slug ?? post.slug;
        return {
          title: post.data.title,
          pubDate: post.data.date,
          description: post.data.description,
          link: `/blog/${slug}/`,
          categories: post.data.tags ?? [],
          author: post.data.author?.name,
        };
      })
      .sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)),
  });
}
