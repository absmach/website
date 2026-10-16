# Abstract Machines Website

Astro + Tailwind source for the [Abstract Machines](https://www.absmach.eu/) website and blog.

## Stack

- Astro (v5)
- Tailwind CSS

## Project Structure

- `src/pages/`: Routes (Astro pages).
- `src/components/`: Shared UI components.
- `src/layouts/`: Page layouts.
- `src/styles/`: Identity stylesheets (`identity-*.css`) shared by the layout and pages.
- `src/content/blogs/`: Blog posts (Markdown).
- `src/content.config.ts`: Blog frontmatter schema.
- `public/`: Static assets (images, favicons, etc).

## Development

```bash
npm install
npm run dev
```

Astro runs on `http://localhost:4321` by default.

During development, images and videos missing from `public/` are fetched from
`https://www.absmach.eu`, so the logo and background animations work without local
R2 credentials. An internet connection is required for these assets.

## Build & Preview

### Public website

The applied AI design is the public website at `http://localhost:4321/`.
It uses AM blue, self-hosted typography, a full-screen architecture film,
and editorial photography.

- `/`: homepage, selected work, and product catalogue.
- `/products/`: searchable AI, Infrastructure, and Hardware categories.
- `/products/{slug}/`: eleven product pages, including Propeller.
- `/research/` and `/research/{elastic,confidential6g}/`: research programmes.
- `/company/`: company background and engineering approach.
- `/stories/{nokia,intel,ericsson,target}/`: sourced engineering stories.
- `/contact/`: enquiry form with product and topic preselection.

The contact form submits to the existing `/api/contact` endpoint. SMTP settings
and delivery requirements are described below. Local browser checks should
intercept submissions rather than sending real mail.

The former `/preview/ai/` page routes redirect permanently to the public pages.
Existing product URLs continue to resolve; `/synth`, `/projects`, and the two
project detail URLs redirect to their new counterparts. Redirects cover both trailing-slash forms and are excluded
from the sitemap. Public pages have canonical URLs, social metadata, and no
preview-only indexing restriction. Blog posts, guides, solutions, pricing,
legal pages, RSS, and documentation remain available at their existing URLs.

`IdentityLayout.astro` owns the main navigation, footer, and public metadata.
The product catalogue lives in `src/data/identity-products.ts`; product pages
and portfolio cards share `ProductVisual.astro`. The homepage and portfolio
show four AI products, four Infrastructure products, and three Hardware products.

Product tabs, category search, mobile navigation, video controls, and media
credits work across the public pages. The silent video pauses offscreen and
when the tab is hidden. Reduced-motion and Save-Data preferences keep the still
poster until the visitor chooses to play.

Existing media URLs remain at `public/preview/ai/media/` to preserve asset
caching. The optimized Mixkit film is approximately 4.2 MB; editorial photos are
WebP. `src/data/identity-photos.ts` supplies image attributes from the manifest
used by the footer credits. Attribution and source/license records are in
`video-source.json` and `photos-sources.json`. Product imagery and artwork are
recorded in `media/products/sources.json`; project, story, and membership
provenance is stored in their respective media folders. Font licenses and
source records remain in `public/preview/ai/fonts/`.

### Production build

```bash
npm run build
npm run check:site
npm run preview
```

## Cloudflare Scripts

Use the package scripts for Pages Functions workflows:

```bash
npm run cf:dev
npm run cf:deploy
```

- `cf:dev`: Builds the site and starts local Pages dev server from `dist/` using `wrangler.jsonc`.
- `cf:deploy`: Builds and deploys `dist/` to the `absmach` Cloudflare Pages project using `wrangler.jsonc`.

Note: `wrangler pages deploy` does not accept compatibility flags as CLI arguments. Keep them in `wrangler.jsonc` and in Cloudflare Pages project settings.

`wrangler.jsonc` (project config):

- `name`: Cloudflare Pages project name (the `*.pages.dev` subdomain).
- `pages_build_output_dir`: deploy output directory (`./dist`).
- `compatibility_date` and `compatibility_flags` (for example `nodejs_compat`) for Functions runtime.
- `vars`: non-secret defaults for Functions (for contact form, use `TEAM_CONTACT_EMAIL` and `MAIL_FROM_EMAIL`).

Wrangler automatically reads `wrangler.jsonc` when commands are run from the project root.

## Contact Form API (Cloudflare Pages Function)

The contact page submits to `POST /api/contact` via `src/pages/api/contact.js`.
The endpoint uses `nodemailer` over SMTP (Google SMTP supported).
Each successful submission sends:

- one email to your team inbox (`TEAM_CONTACT_EMAIL`)
- one confirmation copy to the user who submitted the form email

Request payload fields:

- `name`
- `email`
- `message`

Required environment variables:

- `SMTP_HOST`: SMTP server host (for Google: `smtp.gmail.com`).
- `SMTP_PORT`: SMTP server port (`465` for SSL, `587` for STARTTLS).
- `SMTP_SECURE`: `true` when using SSL port (usually `465`), otherwise `false`.
- `SMTP_USER`: SMTP username (for Google: full Gmail/Workspace email).
- `SMTP_PASS`: SMTP password (for Google: app password).
- `MAIL_FROM_EMAIL`: From address used when sending both emails.
- `TEAM_CONTACT_EMAIL`: Team inbox that receives contact requests.

For local `smtp4dev` testing (Docker `-p 2525:25`), use:

```bash
SMTP_HOST=127.0.0.1
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM_EMAIL=info@absmach.eu
TEAM_CONTACT_EMAIL=info@absmach.eu
```

`SMTP_USER` and `SMTP_PASS` are optional for local test servers.

For Cloudflare Pages production:

- Non-secret values are already in `wrangler.jsonc` under `vars`:
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `MAIL_FROM_EMAIL`, `TEAM_CONTACT_EMAIL`.
- Set only SMTP credentials as secrets on the project:

```bash
wrangler pages secret put SMTP_USER
wrangler pages secret put SMTP_PASS
```

Backward compatibility: `NO_REPLY_EMAIL`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` are still accepted, but new projects should use `MAIL_FROM_EMAIL` and `TEAM_CONTACT_EMAIL`.

Production does not use `.dev.vars`.

- `.dev.vars` is local-only for `wrangler pages dev`.
- For production, configure values in Cloudflare Pages:
  Dashboard -> Pages -> your project -> Settings -> Variables and Secrets -> Production.
- No separate production env file is required in the repo.

For local Cloudflare Pages function testing, copy `.dev.vars.example` to `.dev.vars` and fill the values.

`nodemailer` requires Node compatibility in Cloudflare Workers. Enable `nodejs_compat`:

- In Cloudflare Pages project settings: Workers runtime compatibility flags.
- Or in local dev: `wrangler pages dev dist --compatibility-flag=nodejs_compat`.

## Images

Images are served from Cloudflare R2 (not committed to this repo) via
`src/pages/img/[...path].ts`, which keeps existing `/img/...` URLs working unchanged.
Maintainers publishing new/updated images: see [scripts/README.md](scripts/README.md).

## Blog

See [WRITING.md](WRITING.md) for frontmatter and writing guidelines.

## Sitemap / robots.txt

- `@astrojs/sitemap` generates `dist/sitemap-index.xml` (and chunk files like `dist/sitemap-0.xml`) during `npm run build`.
- `src/pages/robots.txt.ts` is prerendered as `/robots.txt` and points to `/sitemap-index.xml`.

## RSS

- `src/pages/rss.xml.ts` is prerendered as `/rss.xml` (blog feed).

## Documentation

- [How to Write a Blog Post](WRITING.md)
- [Publishing Images (maintainers)](scripts/README.md)
