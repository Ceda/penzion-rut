# Build Process

Tento projekt používá LESS pro styly a spojuje JavaScript soubory bez minifikovaných verzí.

## Struktura

```
src/
├── styles/        - LESS zdrojové soubory
│   ├── style.less    - hlavní soubor (importuje default.less)
│   ├── default.less  - všechny styly (bez nivo-lightbox)
│   └── lesshat.less  - reference (nepoužívá se)
│
└── scripts/       - JavaScript zdrojové soubory (v pořadí načítání)
    ├── 0-jquery-1.8.2.min.js  - jQuery core
    ├── jquery.easing-1.3.js   - Easing animace
    ├── jquery.iosslider.js    - iOS Slider pro carousel
    └── bootstrap.min.js       - Bootstrap (vyžaduje jQuery)

public/theme/pensionrut/
├── css/
│   ├── style.css       - zkompilovaný LESS
│   └── style.min.css   - minifikovaná verze (7.6K)
└── js/
    ├── scripts.js      - spojené JS soubory (228K)
    └── scripts.min.js  - minifikovaná verze (149K)

dist/              - Astro build výstup (gitignored)
```

## Build příkazy

```bash
# Zkompiluje CSS + JS
npm run build:theme

# Pouze CSS (LESS → CSS → minifikace)
npm run build:css

# Pouze JS (spojení → minifikace)
npm run build:js

# Celý build včetně Astro
npm run build
```

## Co bylo odstraněno

Z původního buildu byly odstraněny tyto soubory:

- **nivo-lightbox.less** - nahrazeno GLightbox (CSS z CDN)
- **nivo-default.less** - téma pro nivo lightbox
- **nivo-lightbox.js** - nahrazeno GLightbox (JS z CDN)
- **lesshat.less** - mixin knihovna (nativní CSS mixiny: `.border-radius()` → `border-radius`)

## Galerie

Galerie nyní používá **GLightbox** místo Nivo Lightbox:

- Funguje s Astro optimalizovanými obrázky
- Žádné iframe problémy
- Načítá se z CDN (není součástí build procesu)
- Podobný vzhled jako původní Nivo Lightbox

## Development

Při úpravách stylů:

1. Uprav `src/styles/default.less` nebo `src/styles/style.less`
2. Spusť `npm run build:css`
3. Styly se zkompilují do `public/theme/pensionrut/css/`

Při úpravách JS:

1. Uprav soubory ve složce `src/scripts/`
2. Spusť `npm run build:js`
3. JS se spojí a minifikuje do `public/theme/pensionrut/js/`

**Poznámka:** Originální nekompilované soubory jsou uloženy ve složce `originals/` pro referenci.

## Pořadí načítání JS (důležité!)

JS soubory se spojují v tomto pořadí (NELZE měnit!):

1. **jQuery** - základ pro všechny další pluginy
2. **jQuery pluginy** - easing, iosslider (vyžadují jQuery)
3. **Bootstrap** - vyžaduje jQuery, MUSÍ být na konci!

Pokud změníš pořadí, Bootstrap nebude fungovat (chyba: "a is not a function").
