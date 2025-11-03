import type { APIRoute } from "astro";
import sharp from "sharp";

export const GET: APIRoute = async ({ url }) => {
  const imageUrl = url.searchParams.get("url");
  const width = parseInt(url.searchParams.get("width") || "800");
  const quality = parseInt(url.searchParams.get("quality") || "80");

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    // Stáhni obrázek
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return new Response("Failed to fetch image", { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Resize a optimalizuj pomocí sharp
    const resizedImage = await sharp(Buffer.from(imageBuffer))
      .resize(width, null, {
        withoutEnlargement: true,
        fit: "cover",
      })
      .webp({ quality })
      .toBuffer();

    return new Response(resizedImage, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response("Error processing image", { status: 500 });
  }
};
