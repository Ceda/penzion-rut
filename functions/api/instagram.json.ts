/**
 * Cloudflare Pages Function for Instagram feed
 * Caches data for 24 hours using Cloudflare Cache API
 */

const BEHOLD_URL = "https://feeds.behold.so/DjdBpJzYGtk9JQjmybl6";
const CACHE_DURATION = 86400; // 24 hours

export async function onRequest(context: {
  request: Request;
}): Promise<Response> {
  try {
    const cache = caches.default;
    const cacheKey = new Request(BEHOLD_URL);

    // Try to get from cache
    let response = await cache.match(cacheKey);

    if (!response) {
      // Cache miss - fetch fresh data
      response = await fetch(BEHOLD_URL);

      if (!response.ok) {
        throw new Error(`Behold API error: ${response.status}`);
      }

      // Clone and cache the response
      const clonedResponse = response.clone();
      const newHeaders = new Headers(clonedResponse.headers);
      newHeaders.set("Cache-Control", `public, max-age=${CACHE_DURATION}`);

      const cachedResponse = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: newHeaders,
      });

      // Store in cache (fire and forget)
      context.waitUntil?.(cache.put(cacheKey, cachedResponse));
    }

    // Clone response to add CORS headers
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_DURATION}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Failed to fetch Instagram feed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Instagram feed" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
