/**
 * Cloudflare Pages Function for image proxy with resize
 *
 * Používá wsrv.nl (images.weserv.nl) - image cache & resize service postavený na Cloudflare CDN.
 * Dokumentace: https://wsrv.nl/
 *
 * Sharp nefunguje v Cloudflare Workers runtime, proto používáme tuto službu.
 * Využívá Cloudflare CDN s 300+ datacentry pro rychlé doručení obrázků.
 */

export async function onRequest(context: {
  request: Request;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const imageUrl = url.searchParams.get("url");
  const width = url.searchParams.get("width") || "800";
  const quality = url.searchParams.get("quality") || "80";

  if (!imageUrl) {
    return new Response(
      JSON.stringify({
        error: "Missing url parameter",
        receivedUrl: url.toString(),
        searchParams: Array.from(url.searchParams.entries())
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Použij wsrv.nl pro resize (funguje v Cloudflare Workers)
    // Format podle dokumentace: https://wsrv.nl/?url=<encoded-url>&w=<width>&q=<quality>&output=webp
    // encodeURIComponent správně encoduje i query string parametry (? → %3F, & → %26)
    const resizeServiceUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=${width}&q=${quality}&output=webp&fit=cover`;

    const cache = caches.default;
    const cacheKey = new Request(resizeServiceUrl);

    // Try to get from cache first
    let response = await cache.match(cacheKey);

    if (!response) {
      // Cache miss - fetch resized image
      const imageResponse = await fetch(resizeServiceUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
        },
      });

      if (!imageResponse.ok) {
        return new Response(
          JSON.stringify({
            error: "Failed to fetch resized image",
            status: imageResponse.status,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Clone and cache the response
      const clonedResponse = imageResponse.clone();
      const newHeaders = new Headers(clonedResponse.headers);
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      newHeaders.set("Access-Control-Allow-Origin", "*");

      response = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: newHeaders,
      });

      // Store in cache
      context.waitUntil?.(cache.put(cacheKey, response.clone()));
    }

    // Return cached or fresh response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing image",
        message: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
