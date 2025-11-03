import type { APIRoute } from "astro";
import sharp from "sharp";

export const GET: APIRoute = async ({ url }) => {
  // Parsuj URL parametry
  const imageUrl = url.searchParams.get("url");
  const width = parseInt(url.searchParams.get("width") || "800");
  const quality = parseInt(url.searchParams.get("quality") || "80");

  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: "Missing url parameter", received: url.toString() }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Stáhni obrázek s timeout a user-agent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const imageResponse = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      },
    });

    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch image", status: imageResponse.status }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    if (imageBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ error: "Empty image response" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Resize a optimalizuj pomocí sharp
    const resizedImageBuffer = await sharp(Buffer.from(imageBuffer))
      .resize(width, null, {
        withoutEnlargement: true,
        fit: "cover",
      })
      .webp({ quality })
      .toBuffer();

    // Konvertuj Buffer na Uint8Array pro Response
    return new Response(new Uint8Array(resizedImageBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing image",
        message: error?.message || String(error),
        imageUrl: imageUrl.substring(0, 100) // Log first 100 chars
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
