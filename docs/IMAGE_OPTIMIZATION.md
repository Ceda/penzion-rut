# Astro Image Optimization

## Co se změnilo

Místo hardcodovaných obrázků v `public/` a manuálně vytvořených thumbnail verzí (small, medium, large) používáme Astro built-in image optimization.

## Výhody

1. **Automatická optimalizace** - Astro automaticky generuje optimalizované verze
2. **WebP format** - Moderní formát s lepší kompresí
3. **Responsive images** - Automatický srcset pro různé rozlišení
4. **Lazy loading** - Zabudovaný lazy loading
5. **Jen originály** - Nepotřebuješ mít 3 verze každého obrázku (small, medium, large)

## Struktura

```
src/
  images/
    homepage/      # Obrázky pro úvodní stránku
    historie/      # Historické fotografie
    [další-sekce]/ # Další kategorie podle potřeby
```

## Jak používat

### Import a základní použití

```astro
---
import { Image } from 'astro:assets';
import myImage from '../images/homepage/photo.jpg';
---

<Image
  src={myImage}
  alt="Popis obrázku"
  width={250}
  format="webp"
/>
```

### Responsive images s více velikostmi

```astro
<Image
  src={myImage}
  alt="Popis"
  width={250}
  widths={[250, 500, 750]}
  sizes="(max-width: 768px) 100vw, 250px"
  format="webp"
/>
```

### Pro lightbox (velké + malé verze)

```astro
---
import { getImage } from 'astro:assets';
import photo from '../images/photo.jpg';

// Vygeneruj velkou verzi pro lightbox
const photoLarge = await getImage({
  src: photo,
  width: 1200,
  format: 'webp'
});
---

<a href={photoLarge.src} class="lightbox">
  <Image
    src={photo}
    alt="Náhled"
    width={250}
    format="webp"
  />
</a>
```

## Příklad galerie

```astro
---
const images = [photo1, photo2, photo3];

// Vygeneruj velké verze
const largeImages = await Promise.all(
  images.map(img => getImage({ src: img, width: 1200, format: 'webp' }))
);

const gallery = images.map((src, i) => ({
  src,
  large: largeImages[i]
}));
---

<div class="gallery">
  {gallery.map((img) => (
    <a href={img.large.src} class="lightbox">
      <Image
        src={img.src}
        alt="Fotografie"
        width={150}
        widths={[150, 300]}
        format="webp"
      />
    </a>
  ))}
</div>
```

## Migrace existujících stránek

1. Zkopíruj originální obrázky do `src/images/[kategorie]/`
2. Naimportuj Image komponent: `import { Image } from 'astro:assets';`
3. Naimportuj obrázky: `import photo from '../images/photo.jpg';`
4. Nahraď `<img src="/path/...">` za `<Image src={photo} ... />`
5. Pro lightbox použij `getImage()` k vygenerování velké verze

## Poznámky

- Obrázky v `src/images/` jsou zpracovány při buildu
- Astro automaticky cachuje a optimalizuje
- WebP poskytuje ~30% lepší kompresi než JPEG
- Responsive widths zajišťují, že mobilní zařízení stahují menší soubory
