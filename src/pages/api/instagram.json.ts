import type { APIRoute } from "astro";

// Mock data for development ONLY
const MOCK_DATA = {
  username: "penzion_rut",
  posts: [
    {
      id: "1",
      permalink: "https://www.instagram.com/p/DMdtaWsMgI8/",
      prunedCaption: "Odpoledne pimprdlovy divadlo...",
      sizes: {
        large: {
          mediaUrl:
            "https://behold.pictures/ZjUuJMF9gnd1Sa94acSXoLdkfd62/DjdBpJzYGtk9JQjmybl6/18061710212255763/large.jpg",
        },
      },
    },
    {
      id: "2",
      permalink: "https://www.instagram.com/p/DMX6AgPC6-3/",
      prunedCaption: "Celá rodina šmirgluje...",
      sizes: {
        large: {
          mediaUrl:
            "https://behold.pictures/ZjUuJMF9gnd1Sa94acSXoLdkfd62/DjdBpJzYGtk9JQjmybl6/17948753795996056/large.jpg",
        },
      },
    },
    {
      id: "3",
      permalink: "https://www.instagram.com/p/DMQXUoLMMuR/",
      prunedCaption: "První filmový večer 2025...",
      sizes: {
        large: {
          mediaUrl:
            "https://behold.pictures/ZjUuJMF9gnd1Sa94acSXoLdkfd62/DjdBpJzYGtk9JQjmybl6/18174266923338550/large.jpg",
        },
      },
    },
    {
      id: "4",
      permalink: "https://www.instagram.com/p/DMLZXWZspxj/",
      prunedCaption: "Tak zejtra👍🏽👍🏽👍🏽😎",
      sizes: {
        large: {
          mediaUrl:
            "https://behold.pictures/ZjUuJMF9gnd1Sa94acSXoLdkfd62/DjdBpJzYGtk9JQjmybl6/17964607022790805/large.jpg",
        },
      },
    },
    {
      id: "5",
      permalink: "https://www.instagram.com/p/DMLKv1_MMXk/",
      prunedCaption: "Kdo najde rainbow...",
      sizes: {
        large: {
          mediaUrl:
            "https://behold.pictures/ZjUuJMF9gnd1Sa94acSXoLdkfd62/DjdBpJzYGtk9JQjmybl6/18075241480940160/large.jpg",
        },
      },
    },
    {
      id: "6",
      permalink: "https://www.instagram.com/p/DL-5gF2Mdpl/",
      prunedCaption: "Svet je v poradku...",
      sizes: {
        large: {
          mediaUrl:
            "https://behold.pictures/ZjUuJMF9gnd1Sa94acSXoLdkfd62/DjdBpJzYGtk9JQjmybl6/17853094338481155/large.jpg",
        },
      },
    },
  ],
};

// This endpoint is ONLY used in development
// In production, Cloudflare Pages Function takes over (/functions/api/instagram.json.ts)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(MOCK_DATA), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
};
