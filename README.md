# Abstract Machines Website

Astro + Tailwind source for the [Abstract Machines](https://absmach.eu) website and blog.

## Stack

- Astro (v4)
- Tailwind CSS

## Project Structure

- `src/pages/`: Routes (Astro pages).
- `src/components/`: Shared UI components.
- `src/layouts/`: Page layouts.
- `src/styles/`: Global CSS (design tokens + utilities).
- `src/content/blogs/`: Blog posts (Markdown).
- `src/content.config.ts`: Blog frontmatter schema.
- `public/`: Static assets (images, favicons, etc).

## Development

```bash
npm install
npm run dev
```

Astro runs on `http://localhost:4321` by default.

## Build & Preview

```bash
npm run build
npm run preview
```

## Blog

See [WRITING.md](WRITING.md) for frontmatter and writing guidelines.

## Sitemap / robots.txt

- `@astrojs/sitemap` generates `dist/sitemap-index.xml` (and chunk files like `dist/sitemap-0.xml`) during `npm run build`.
- `src/pages/robots.txt.ts` is prerendered as `/robots.txt` and points to `/sitemap-index.xml`.

## RSS

- `src/pages/rss.xml.ts` is prerendered as `/rss.xml` (blog feed).

## Documentation

- [How to Write a Blog Post](WRITING.md)
