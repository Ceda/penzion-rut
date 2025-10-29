# Cloudflare Pages Deployment

## Co se změnilo

Instagram feed z Behold.so je nyní cachlovaný pomocí Cloudflare Cache API.

- **Cache doba**: 24 hodin (86400 sekund)
- **Žádná databáze**: Využívá built-in Cloudflare edge cache
- **Statický site**: Všechny stránky jsou předgenerované HTML
- **API jako Function**: `/api/instagram.json` běží jako Cloudflare Pages Function

## Deployment na Cloudflare Pages

### 1. V Cloudflare Pages Dashboard

**Build Settings:**

- Build command: `yarn build`
- Build output directory: `dist`
- Framework preset: `Astro`

### 2. Environment Variables (volitelné)

Žádné speciální env vars nejsou potřeba pro cache funkčnost.

### 3. Deploy

Push do Git repo a Cloudflare Pages automaticky buildne a deployne.

## Lokální vývoj

```bash
# Instalace
yarn install

# Dev server (standardní SSR)
yarn dev

# Production build
yarn build

# Preview production buildu
yarn preview
```

## Cache Management

### Jak funguje cache?

1. První request na homepage stáhne Instagram feed z Behold.so
2. Response se uloží do Cloudflare Cache API s `Cache-Control: public, max-age=86400`
3. Další requesty v rámci 24h používají cache
4. Po 24h se cache automaticky invaliduje a stáhne se fresh data

### Manuální invalidace

Pro vyčištění cache:

1. V Cloudflare Dashboard → Caching → Configuration
2. Purge Everything nebo Purge by URL (`https://pensionrut.cz/`)

### Změna cache duration

V souboru `src/components/InstagramFeed.astro`:

```typescript
const response = await cachedFetch(BEHOLD_URL, 86400); // změň 86400 na jiný počet sekund
```

## Monitoring

Instagram feed má fallback:

- Pokud fetch selže, zobrazí se "Instagram feed není momentálně k dispozici"
- Error se loguje do Cloudflare Workers console

## Troubleshooting

### Instagram posts se nezobrazují

1. Zkontroluj Cloudflare Workers logs
2. Ověř že Behold feed URL je dostupný: `https://feeds.behold.so/DjdBpJzYGtk9JQjmybl6`
3. Zkontroluj že homepage má `prerender = false`

### Build failuje

- Ujisti se že `@astrojs/cloudflare` a `@cloudflare/workers-types` jsou nainstalované
- Ověř `output: "server"` v `astro.config.mjs`
