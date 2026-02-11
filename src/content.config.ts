import { defineCollection, z } from "astro:content";

const blogs = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),

        author: z.object({
            name: z.string(),
            picture: z.union([z.string().url(), z.string()]).optional(), // URL or local path
        }),

        tags: z.array(z.string()).default([]),
        category: z.string().optional(),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),

        coverImage: z.union([z.string().url(), z.string()]).optional(), // URL or local path
        heroImage: z.union([z.string().url(), z.string()]).optional(), // URL or local path
        canonical: z.string().url().optional(),

        // keep only if you really need overriding
        slug: z.string().optional(),
    }),
});

export const collections = { blogs };
