// Builds the deploy-ready folder: dist/
// Usage:  npm run build            (no canonical/sitemap)
//         SITE_URL=https://your-domain.com npm run build   (adds canonical, og:url, sitemap.xml)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const SITE = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');

if (SITE && !/^https:\/\/[^\s/]+(\/[^\s]*)?$/.test(SITE)) {
  console.error('SITE_URL must start with https:// (example: https://aishwarya.dev)');
  process.exit(1);
}

const MARK = '%SITE_URL%';
const fill = (text) =>
  SITE
    ? text.split(MARK).join(SITE)
    : text
        .split('\n')
        .filter((line) => !line.includes(MARK))
        .join('\n');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'assets', 'css'), { recursive: true });
fs.mkdirSync(path.join(dist, 'assets', 'js'), { recursive: true });
fs.mkdirSync(path.join(dist, 'assets', 'fonts'), { recursive: true });
fs.mkdirSync(path.join(dist, 'images'), { recursive: true });

// HTML pages
for (const page of ['index.html', 'privacy.html', '404.html']) {
  const text = fs.readFileSync(path.join(src, page), 'utf8');
  fs.writeFileSync(path.join(dist, page), fill(text));
}

// JS
fs.copyFileSync(path.join(src, 'js', 'main.js'), path.join(dist, 'assets', 'js', 'main.js'));

// Images (put aishhh.png, soultlk_app.png, trophy.png, wolfie.png, wolfie2.png in src/images)
const imgDir = path.join(src, 'images');
for (const f of fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : []) {
  fs.copyFileSync(path.join(imgDir, f), path.join(dist, 'images', f));
}

// Static files (favicon, robots.txt, _headers, vercel.json)
const staticDir = path.join(src, 'static');
for (const f of fs.readdirSync(staticDir)) {
  const from = path.join(staticDir, f);
  const to = path.join(dist, f);
  if (/\.(txt|svg|json|xml)$/.test(f)) fs.writeFileSync(to, fill(fs.readFileSync(from, 'utf8')));
  else fs.copyFileSync(from, to);
}

// Self-hosted fonts from npm packages
const fonts = [
  ['@fontsource-variable/caveat', 'caveat-latin-wght-normal.woff2'],
  ['@fontsource-variable/dm-sans', 'dm-sans-latin-wght-normal.woff2'],
];
for (const [pkg, file] of fonts) {
  const from = path.join(root, 'node_modules', pkg, 'files', file);
  if (!fs.existsSync(from)) {
    console.error(`Missing font ${file}. Run "npm install" first.`);
    process.exit(1);
  }
  fs.copyFileSync(from, path.join(dist, 'assets', 'fonts', file));
}

// sitemap only when the real domain is known
if (SITE) {
  const lastmod = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${lastmod}</lastmod></url>\n  <url><loc>${SITE}/privacy.html</loc><lastmod>${lastmod}</lastmod></url>\n</urlset>\n`
  );
}

console.log('dist/ ready' + (SITE ? ` for ${SITE}` : ' (no SITE_URL set: canonical/sitemap skipped)'));
