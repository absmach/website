# Publishing images and video (maintainers only)

Images and video are no longer committed to this repo. They're stored in a shared
Cloudflare R2 bucket (`websites-images`) and served at their usual URLs by two
near-identical routes that read the object from R2 and stream it back:

- [`src/pages/img/[...path].ts`](../src/pages/img/%5B...path%5D.ts) — everything under
  `/img/...`
- [`src/pages/video/[...path].ts`](../src/pages/video/%5B...path%5D.ts) — everything under
  `/video/...`

Both share the same lookup logic via
[`src/lib/r2-proxy.ts`](../src/lib/r2-proxy.ts); only the R2 key prefix differs. Nothing in
components, blog frontmatter, or `src/data/*.ts` changes — they keep referencing
`/img/blogs/<slug>/hero.webp` or `/video/hero-background.mp4` exactly as before.

Only maintainers publish images, using [`publish-image.mjs`](./publish-image.mjs). The
script is safe to have in a public repo because it's inert without a token — nobody can
upload to the bucket just by reading this file. See "Why maintainer-only" below for the
reasoning.

## One-time setup

1. Create `scripts/.env.publish-image` from the template:

   ```bash
   cp scripts/.env.publish-image.example scripts/.env.publish-image
   ```

2. Create a Cloudflare API token: dashboard -> **My Profile -> API Tokens -> Create Token
   -> Custom Token**, with both permissions on the same token:
   - `Workers R2 Storage: Edit`
   - `Zone -> Cache Purge -> Purge`, **Zone Resources** scoped to the `absmach.eu` zone

3. Paste the token into `CLOUDFLARE_API_TOKEN` in `scripts/.env.publish-image`. The zone
   ID is already filled in (it's not secret, safe to share/commit — it can't authenticate
   anything by itself).

4. Sanity-check the token before first use:

   ```bash
   curl -s https://api.cloudflare.com/client/v4/user/tokens/verify \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
   ```

   Should return `"status":"active"`. If it doesn't, the token value itself is wrong
   (bad copy/paste, expired, revoked) — fix that before troubleshooting anything else.

`scripts/.env.publish-image` is gitignored (`.env*` pattern in `.gitignore`). Never commit
it, never paste the token value into a PR, issue, or chat.

## Publishing an image or video

```bash
pnpm run publish-image <local-file> <public-path>
```

`<public-path>` is everything after the domain in the final URL — it must start with
`img/` or `video/` so the script knows which route (and R2 key prefix) it belongs to.
Examples:

```bash
pnpm run publish-image ./hero.webp img/blogs/atom-announcement/hero.webp
# -> https://www.absmach.eu/img/blogs/atom-announcement/hero.webp

pnpm run publish-image ./hero-background.mp4 video/hero-background.mp4
# -> https://www.absmach.eu/video/hero-background.mp4
```

Keep the public path identical to the site's existing `/img/...` or `/video/...`
convention so frontmatter/component references don't need to change — check `public/img/`
or `public/video/` (before they're removed) or an existing reference in `src/` for the
pattern to match.

The script does two things, in order:

1. `wrangler r2 object put ... --remote` — uploads to the **real** bucket. `--remote` is
   required; without it, `wrangler` silently writes to a local simulated bucket and prints
   a normal-looking "Upload complete" with no error, and the object is never actually live.
2. Purges that exact URL from Cloudflare's edge cache (`POST /zones/{id}/purge_cache`), so
   the update is visible within seconds instead of waiting out the cache TTL.

If you re-run the same command for an existing path, it overwrites the object in place and
purges again — that's the intended way to update an image without changing its URL.

## Bulk-uploading via the R2 dashboard (initial migration)

For migrating the existing `public/img/` and `public/video/` trees in bulk instead of one
file at a time, you can drag-and-drop folders into the bucket in the Cloudflare dashboard.
**The keys have to land under the exact prefix each route expects:**

| Site URL                                           | Required R2 key                             |
| -------------------------------------------------- | ------------------------------------------- |
| `https://www.absmach.eu/img/logos/foo.png`         | `absmach-website/logos/foo.png`             |
| `https://www.absmach.eu/video/hero-background.mp4` | `absmach-website/video/hero-background.mp4` |

So in the R2 dashboard, in the `websites-images` bucket:

- Create/open a folder named `absmach-website`, and drag in the **contents** of
  `public/img/` (the `atom-ui/`, `blogs/`, `logos/`, `products/`, etc. subfolders) — not
  the `img` folder itself as one more nested level. Dragging `img/` in as a folder would
  produce `absmach-website/img/logos/foo.png`, which the proxy route never looks up (it
  strips the leading `/img/` from the request and prepends `absmach-website/`, nothing
  else) — every image would silently 404.
- Inside that same `absmach-website` folder, create a `video` folder and drag in the
  **contents** of `public/video/` (the `.mp4`, `.webm`, and poster `.webp` files) directly
  into it — same reasoning, don't nest an extra `video/` folder inside itself.

Only drag in what's actually referenced somewhere in the site. `public/img/` was audited
and pruned to exactly that set before this migration — every file remaining under it, at
the time of that cleanup, was confirmed referenced from `src/` (components, page files,
blog frontmatter/content, or `src/data/*.ts`). If you add new images or video later, upload
them the same way before merging so the tree doesn't silently reaccumulate orphaned files.

## Why maintainer-only

This repo is public. The risk isn't the script being visible — it's inert without a
credential. The risk is _credential distribution_: whoever holds `CLOUDFLARE_API_TOKEN`
can write to the shared bucket. So nobody, internal or external, gets a personal R2 token.
Only a maintainer, holding this one scoped token, runs `publish-image`.

Practical flow for a PR that adds an image (contributor is internal or external, doesn't
matter): the contributor attaches the image to the PR the normal GitHub way (drag-and-drop
into the description or a comment). A maintainer reviewing the PR runs
`pnpm run publish-image` locally before merging, then approves. If this becomes a frequent
bottleneck, the natural next step is a label- or comment-triggered GitHub Action that runs
the same script with the token stored as a repo secret — but that automation must only ever
read the attachment URL/destination path from the PR, never execute code from the PR
branch while the token is in scope (the standard `pull_request_target` secret-exfiltration
pitfall).

## Troubleshooting

- **`Local file not found: --`** — you ran `pnpm run publish-image -- <file> <dest>`. pnpm
  forwards a leading `--` to the script literally instead of stripping it like npm does.
  The script strips it defensively now, but plain `pnpm run publish-image <file> <dest>`
  (no `--`) is the form to use.
- **`Destination must start with "img/" or "video/"`** — the second argument changed from
  a path relative to `/img/` to the full public path including the route. Use
  `img/logos/foo.png`, not `logos/foo.png`.
- **`Resource location: local` in the upload output** — means `--remote` didn't get
  applied for some reason (e.g. running the underlying `wrangler` command by hand without
  copying the full flag list from the script). The object was never written to the real
  bucket even though the CLI reports success. Always use `pnpm run publish-image`, or add
  `--remote` yourself if invoking wrangler directly.
- **`Cache purge failed` / `Authentication error` (code 10000)** — Cloudflare reuses this
  code for both "bad token" and "token valid but missing this permission." Run the token
  verify curl command above first to rule out a bad token. If that succeeds, the token is
  missing `Zone -> Cache Purge -> Purge` for the `absmach.eu` zone, or that permission's
  Zone Resources selector doesn't include it — edit the token in the dashboard and add it.
- To confirm an object actually made it into the bucket after a `--remote` upload:

  ```bash
  # image
  wrangler r2 object get websites-images/absmach-website/<path-after-img/> --remote --file=/tmp/check
  # video
  wrangler r2 object get websites-images/absmach-website/video/<path-after-video/> --remote --file=/tmp/check
  ```
