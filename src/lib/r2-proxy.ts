import type { APIRoute } from "astro";

interface R2ObjectBody {
  body: ReadableStream;
  size: number;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
}

// Minimal structural types for the Workers Cache API -- avoids depending on
// the gitignored, wrangler-generated worker-configuration.d.ts (pnpm run
// build never regenerates it, only the separate types:check script does).
interface Cache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}
interface CacheStorage {
  readonly default: Cache;
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store" },
  });

// Shared bucket ("websites-images") holds assets for multiple properties;
// keyPrefix keeps this site's objects from colliding with the docs sites',
// and separates images from video within this site.
export function createR2ProxyRoute(keyPrefix: string): APIRoute {
  return async ({ params, locals, request }) => {
    const path = params.path;
    if (!path) return notFound();

    const runtime = (
      locals as {
        runtime?: {
          env?: { IMAGES_BUCKET?: R2Bucket };
          caches?: CacheStorage;
          ctx?: ExecutionContext;
        };
      }
    ).runtime;
    const bucket = runtime?.env?.IMAGES_BUCKET;
    if (!bucket || !runtime?.caches || !runtime?.ctx) return notFound();

    // R2 binding reads (bucket.get()) never touch Cloudflare's HTTP cache --
    // they're a direct storage call, not a subrequest. Without explicitly
    // writing the response into the Cache API, every single request (from
    // every visitor, at every edge location) would re-read from R2, no
    // matter what Cache-Control header gets set on the returned Response.
    // Using the request's own URL (unmodified) as the cache key keeps this
    // purgeable by the existing purge-by-URL call in publish-image.mjs --
    // a *custom* cache key would not be.
    const cache = runtime.caches.default;
    const cacheKey = new Request(request.url, request);

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const object = await bucket.get(`${keyPrefix}/${path}`);
    if (!object) return notFound();

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("content-length", String(object.size));
    // Browser TTL long enough to skip most repeat-visit requests, short
    // enough to self-heal within the hour if a purge is ever missed. Edge
    // TTL is effectively unbounded -- publish-image.mjs purges it
    // explicitly and immediately on every upload, so there's no benefit to
    // a shorter one, and every edge location that has ever served an image
    // now actually caches it (see the Cache API use above).
    headers.set("cache-control", "public, max-age=3600, s-maxage=31536000");

    const response = new Response(object.body, { headers });
    runtime.ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  };
}
