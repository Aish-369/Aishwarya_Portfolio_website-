# Aishwarya Pawar: Portfolio (deploy-ready)

Static site. Same design as your original; Tailwind is now built locally instead of loaded from the CDN,
fonts are self-hosted, and security headers + privacy page are included.

## 1. Build (once, on your computer)

Requires Node.js 18+.

```bash
npm install
# put your 5 images in src/images/ first (see below)
SITE_URL=https://your-domain.com npm run build      # Windows PowerShell: $env:SITE_URL="https://your-domain.com"; npm run build
```

`SITE_URL` is optional. With it you also get canonical/og:url tags and `sitemap.xml`.
The result is the `dist/` folder: **that folder is the website**.

### Images (required)

Copy these into `src/images/` before building (names must match exactly):

`aishhh.png`, `soultlk_app.png`, `trophy.png`, `wolfie.png`, `wolfie2.png`

Tip: compress them (e.g. squoosh.app) so the page loads fast.

## 2. Contact form

Open `src/js/main.js`, set `FORM_ENDPOINT` to your Formspree URL (free at formspree.io), then rebuild.
Left empty, the form opens the visitor's email app with a prefilled message.
If you use a different provider, add its origin to `connect-src` / `form-action` in the CSP
(`src/index.html`, `src/privacy.html`, `src/static/_headers`, `src/static/vercel.json`).

## 3. Deploy `dist/`

- **Netlify**: drag-and-drop the `dist/` folder (the `_headers` file is applied automatically).
- **Vercel**: `cd dist && npx vercel --prod` (the `vercel.json` is applied automatically).
- **GitHub Pages / Cloudflare Pages**: publish `dist/`. GitHub Pages can't set response headers, so only the CSP
  `<meta>` tag applies there; Netlify, Vercel or Cloudflare Pages give the full header set.

## What was added (UI unchanged)

- Tailwind CDN -> locally built, minified CSS (no runtime compile, no external scripts)
- Google Fonts -> self-hosted woff2 (no visitor IP sent to Google)
- Strict Content-Security-Policy, HSTS, nosniff, frame denial, referrer/permissions policies
- `rel="noopener noreferrer"` on every external link
- Contact form: validation, sanitising, length limits, honeypot, 30s cooldown, https-only endpoint, no storage/cookies
- Email address assembled by JavaScript (not visible in the HTML source to scrapers)
- `privacy.html`, `404.html`, favicon, robots.txt, meta description / Open Graph

## Optional

`privacy.html` is not linked from the page (to leave your design untouched). To link it, add this inside the
footer's bottom row in `src/index.html`: `<a href="privacy.html" class="hover:text-white">Privacy</a>`.
