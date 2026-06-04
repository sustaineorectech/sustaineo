# Sustaineo Website

Static website for Sustaineo Recycling Technologies Private Limited.

## Architecture

- **Single-page application** — all sections live in one `index.html`; `script.js` routes URLs like `/technology` to sections
- **GitHub Pages SPA fallback** — `404.html` catches unknown routes and redirects to `/?route=/path`; the SPA restores the clean URL via `replaceState`
- **Service worker** — `sw.js` caches key assets for offline support
- **No build step required** — files are served as-is; minification is optional

## Quick Start

```bash
npm install        # install minification tools
npm run build      # minify CSS, JS, HTML
```

Deploy `index.html`, `style.css`, `script.js`, `sw.js`, `404.html`, `assets/`, and config files.

## GitHub Pages Deployment

1. Push all files to the repository root
2. Settings → Pages → select `main` branch, root folder
3. Configure custom domain `sustaineotech.com` with DNS records
4. `.nojekyll` is present to prevent Jekyll processing

## Image Optimization (recommended before deploy)

```bash
npx pngquant --quality=70-90 --skip-if-larger assets/**/*.png logo-transparent.png
npx jpegoptim --quality=60 assets/social/*.jpg
```

## Social Preview Assets

- `assets/social/og-image.jpg` — Open Graph preview, 1200x630
- `assets/social/whatsapp-preview.jpg` — WhatsApp-friendly preview, 1200x630
- `assets/social/twitter-card.jpg` — X/Twitter large card, 1200x675
- `assets/social/og-square.jpg` — Square preview, 1200x1200

## Site Support Files

- `robots.txt` — crawler instructions
- `sitemap.xml` — search engine sitemap
- `site.webmanifest` — install/browser metadata
- `favicon.ico` and `assets/icons/*` — browser and mobile icons
