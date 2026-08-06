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

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store" },
  });

// Shared bucket ("websites-images") holds assets for multiple properties;
// keyPrefix keeps this site's objects from colliding with the docs sites',
// and separates images from video within this site.
export function createR2ProxyRoute(keyPrefix: string): APIRoute {
  return async ({ params, locals }) => {
    const path = params.path;
    if (!path) return notFound();

    const bucket = (
      locals as { runtime?: { env?: { IMAGES_BUCKET?: R2Bucket } } }
    ).runtime?.env?.IMAGES_BUCKET;
    if (!bucket) return notFound();

    const object = await bucket.get(`${keyPrefix}/${path}`);
    if (!object) return notFound();

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("content-length", String(object.size));
    // Short browser TTL (revalidates quickly) + long edge TTL (until purged
    // explicitly by the publish-image script on upload).
    headers.set("cache-control", "public, max-age=300, s-maxage=31536000");

    return new Response(object.body, { headers });
  };
}
