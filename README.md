# Abstract Machines Website

Astro + Tailwind source for the [Abstract Machines](https://absmach.eu) website and blog.

## Stack

- Astro (v5)
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

- `name`: Cloudflare Pages project name (`absmach`).
- `pages_build_output_dir`: deploy output directory (`./dist`).
- `compatibility_date` and `compatibility_flags` (for example `nodejs_compat`) for Functions runtime.
- `vars`: non-secret defaults for Functions (for contact form, use `TEAM_CONTACT_EMAIL` and `MAIL_FROM_EMAIL`).

Wrangler automatically reads `wrangler.jsonc` when commands are run from the project root.

## Contact Form API (Cloudflare Pages Function)

The contact page submits to `POST /api/contact` via `functions/api/contact.js`.
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

## Blog

See [WRITING.md](WRITING.md) for frontmatter and writing guidelines.

## Sitemap / robots.txt

- `@astrojs/sitemap` generates `dist/sitemap-index.xml` (and chunk files like `dist/sitemap-0.xml`) during `npm run build`.
- `src/pages/robots.txt.ts` is prerendered as `/robots.txt` and points to `/sitemap-index.xml`.

## RSS

- `src/pages/rss.xml.ts` is prerendered as `/rss.xml` (blog feed).

## Documentation

- [How to Write a Blog Post](WRITING.md)
