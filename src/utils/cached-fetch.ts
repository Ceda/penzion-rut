/**
 * Cached fetch with Cloudflare Cache API
 * @param url - URL to fetch
 * @param cacheDuration - Cache duration in seconds (default: 24 hours)
 */
export async function cachedFetch(
  url: string,
  cacheDuration: number = 86400,
): Promise<Response> {
  // Check if we're in a Workers environment (not during build)
  if (typeof caches === "undefined") {
    // Fallback to regular fetch during SSG build
    return fetch(url);
  }

  const cacheKey = new Request(url);
  // @ts-ignore - caches.default is available in Cloudflare Workers
  const cache = caches.default as Cache;

  // Try to get from cache
  let response = await cache.match(cacheKey);

  if (!response) {
    // Cache miss - fetch fresh data
    response = await fetch(url);

    // Clone the response before caching
    const clonedResponse = response.clone();

    // Set cache headers
    const newHeaders = new Headers(clonedResponse.headers);
    newHeaders.set("Cache-Control", `public, max-age=${cacheDuration}`);

    const cachedResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: newHeaders,
    });

    // Store in cache (no await - fire and forget)
    cache.put(cacheKey, cachedResponse);

    return response;
  }

  return response;
}
