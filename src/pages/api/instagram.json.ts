import type { APIRoute } from "astro";
import { cachedFetch } from "../../utils/cached-fetch";

export const prerender = false; // Force SSR for this endpoint

const BEHOLD_URL = "https://feeds.behold.so/DjdBpJzYGtk9JQjmybl6";

export const GET: APIRoute = async () => {
  try {
    const response = await cachedFetch(BEHOLD_URL, 86400); // 24 hours cache
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Browser cache 24h
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
};
