# Writing Blog Posts

Blog posts live in `src/content/blogs/` and are rendered by Astro using the content schema in `src/content.config.ts`.

## 1) Create a new post

Create a new Markdown file:

- `src/content/blogs/my-new-post.md`

The filename becomes the URL slug by default (you can override it with `slug` in frontmatter).

## 2) Add frontmatter

Each post must start with YAML frontmatter:

```yaml
---
title: "Getting Started with FluxMQ"
description: "A short summary used for SEO and the blog listing."
date: "2026-02-10"
updatedAt: "2026-02-11" # optional
author:
  name: "Your Name"
  picture: "https://example.com/avatar.png" # optional (URL or local path)
tags:
  - fluxmq
  - mqtt
featured: false # optional (featured posts are pinned above non-featured posts on /blog/)
draft: false # optional (set true to hide from /blog/)
coverImage: "/img/blogs/my-new-post/cover.png" # optional (URL or local path)
canonical: "https://absmach.eu/blog/my-new-post/" # optional
slug: "my-new-post" # optional override
---
```

Notes:

- `date` / `updatedAt` accept `YYYY-MM-DD` (they are coerced into real dates by the schema).
- Tags are case-sensitive on the blog filter UI. Pick one convention and stick to it.
- `featured: true` should be temporary. Featured posts are always shown before non-featured posts, regardless of publish date.
- Writers/editors must remove old `featured: true` flags after a campaign/release window. If many posts stay featured, newer non-featured posts will not appear near the top of `/blog/`.

## 3) Add images

Put blog images under `public/img/blogs/<slug>/` and reference them with a relative path:

- File: `public/img/blogs/my-new-post/diagram.png`
- Markdown: `![Diagram](/img/blogs/my-new-post/diagram.png)`

## 4) Preview locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:4321/blog/` (listing + search + tags)
- `http://localhost:4321/blog/<slug>/` (your post)

## 5) Publish

Commit the Markdown file + any images you added under `public/`:

```bash
git add src/content/blogs/my-new-post.md public/img/blogs/my-new-post/
git commit -m "Add blog post: Getting Started with FluxMQ"
```
