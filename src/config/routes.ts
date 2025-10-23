export const ROUTES = {
  home: "/",
  historie: "/historie",
  ubytovani: "/ubytovani",
  okoli: "/okoli",
  vylety: "/vylety",
  cenik: "/cenik",
  fotogalerie: "/fotogalerie",
  kontakty: "/kontakty",
  regata: "/regata-rut-classic",
} as const;

export const NAV_ITEMS = [
  { href: ROUTES.home, label: "Pension RUT" },
  { href: ROUTES.historie, label: "Historie" },
  { href: ROUTES.ubytovani, label: "Ubytování" },
  { href: ROUTES.okoli, label: "Okolí" },
  { href: ROUTES.vylety, label: "Výlety" },
  { href: ROUTES.cenik, label: "Ceník" },
  { href: ROUTES.fotogalerie, label: "Fotogalerie" },
  { href: ROUTES.kontakty, label: "Kontakty" },
  { href: ROUTES.regata, label: "Regata RUT Classic" },
] as const;

