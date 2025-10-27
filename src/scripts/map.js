let mapInstance = null;

const loadLeaflet = () => {
  return new Promise((resolve) => {
    // Pokud už je Leaflet načtený
    if (typeof L !== "undefined") {
      resolve();
      return;
    }

    // Načti CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Načti JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity =
      "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

const initMap = async () => {
  const mapEl = document.getElementById("map3");
  if (!mapEl) return;

  // Počkej na Leaflet
  await loadLeaflet();

  // Zničit starou mapu pokud existuje
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // Vytvoř novou mapu
  mapInstance = L.map("map3", {
    scrollWheelZoom: false,
  }).setView([50.58707513286003, 14.638432025909424], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapInstance);

  L.marker([50.58707513286003, 14.638432025909424])
    .addTo(mapInstance)
    .bindPopup("<b>Pension RUT</b><br>Lázeňský Vrch 97<br>Staré Splavy");
};

// Inicializuj při načtení stránky přes router
document.addEventListener("astro:page-load", initMap);
