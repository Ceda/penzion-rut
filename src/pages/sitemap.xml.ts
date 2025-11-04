import type { APIRoute } from "astro";

const site = "https://www.pensionrut.cz";

// Seznam všech stránek s jejich prioritami a změnami
const pages = [
  { url: "", priority: "1.0", changefreq: "weekly" }, // homepage
  { url: "/historie", priority: "0.9", changefreq: "monthly" },
  { url: "/ubytovani", priority: "1.0", changefreq: "monthly" },
  { url: "/okoli", priority: "0.8", changefreq: "monthly" },
  { url: "/vylety", priority: "0.8", changefreq: "monthly" },
  { url: "/cenik", priority: "0.9", changefreq: "monthly" },
  { url: "/fotogalerie", priority: "0.7", changefreq: "weekly" },
  { url: "/kontakty", priority: "0.9", changefreq: "monthly" },
  { url: "/regata-rut-classic", priority: "0.7", changefreq: "yearly" },
];

export const GET: APIRoute = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${site}${page.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // Cache na 1 hodinu
    },
  });
};
