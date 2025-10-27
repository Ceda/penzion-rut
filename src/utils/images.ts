import type { ImageMetadata } from "astro";

type ImageModule = { default: ImageMetadata };
type ImageGlob = Record<string, ImageModule>;

/**
 * Get a single image by name from a folder
 */
export const getImageByName = (
  allImages: ImageGlob,
  folder: string,
  name: string
) => {
  const path = `../images/${folder}/${name}`;
  return allImages[path]?.default;
};

/**
 * Get all images from a glob import, sorted by filename
 */
export const getAllImages = (allImages: ImageGlob) => {
  return Object.values(allImages)
    .map((img) => img.default)
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by filename if available
      const aName = a.src.split("/").pop() || "";
      const bName = b.src.split("/").pop() || "";
      return aName.localeCompare(bName);
    });
};

/**
 * Filter images by excluding specific filenames
 */
export const excludeImages = (
  images: ImageMetadata[],
  excludeNames: string[]
) => {
  return images.filter((img) => {
    // Extract filename, removing query params if present
    const srcPath = img.src.split("?")[0];
    const filename = srcPath.split("/").pop() || "";
    return !excludeNames.some((excludeName) => filename.includes(excludeName));
  });
};
