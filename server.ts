import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CATALOG_DATA } from './src/data/meuerpwebSeed';
import type { CatalogData } from './src/types/helpCenter';
import { deduplicateVideos, summarizeDescription } from './src/utils/catalogLogic';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'catalog.json');

function ensureStore(): CatalogData {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const initial: CatalogData = {
      ...INITIAL_CATALOG_DATA,
      youtubeIntegration: {
        ...INITIAL_CATALOG_DATA.youtubeIntegration,
        apiConfigured: true,
      },
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as CatalogData;
    parsed.videos = deduplicateVideos(parsed.videos || []);
    parsed.youtubeIntegration = {
      ...INITIAL_CATALOG_DATA.youtubeIntegration,
      apiConfigured: true,
    };
    return parsed;
  } catch {
    const fallback = { ...INITIAL_CATALOG_DATA };
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveStore(data: CatalogData): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, STORE_PATH);
}

function resolveBaseUrl(req: Request): string {
  const envUrl = process.env.APP_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl) && !envUrl.includes('MY_APP_URL')) {
    return envUrl.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || 'ajuda.cs22.com.br';
  return `${proto}://${host}`;
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectSeoMeta(html: string, req: Request, store: CatalogData): string {
  const baseUrl = resolveBaseUrl(req);
  const rawUrl = req.originalUrl || req.url || '/';
  const reqPath = rawUrl.split('?')[0] || '/';
  let title = 'Central de Ajuda CS22 | Tutoriais e Treinamentos';
  let description =
    'Encontre tutoriais, vídeos e orientações para utilizar os sistemas e soluções de gestão da CS22.';
  let ogImage = `${baseUrl}/og-cs22.jpg`;
  let ogWidth = '1200';
  let ogHeight = '630';
  let ogUrl = `${baseUrl}${reqPath}`;
  let ogType = 'website';
  let extraJsonLd = '';

  const match = reqPath.match(/^\/ajuda\/([^/]+)\/?$/);
  if (match) {
    const slug = decodeURIComponent(match[1]);
    const video = store.videos.find((v) => v.slug === slug && v.status === 'published');
    if (video) {
      title = `${video.title} | Central de Ajuda CS22`;
      description =
        summarizeDescription(video.description, 155) ||
        `Tutorial oficial sobre ${video.title} na Central de Ajuda CS22.`;
      ogImage = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
      ogWidth = '1280';
      ogHeight = '720';
      ogType = 'video.other';
      const videoJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.title,
        description,
        thumbnailUrl: [ogImage, video.thumbnail],
        uploadDate: video.publishedAt || undefined,
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
        publisher: {
          '@type': 'Organization',
          name: 'CS22',
        },
      };
      extraJsonLd = `<script type="application/ld+json">${JSON.stringify(videoJsonLd)}</script>`;
    }
  }

  let updated = html
    .replace(/<title>.*?<\/title>/is, `<title>${escapeHtmlAttr(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtmlAttr(description)}" />`
    )
    .replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:type" content="${escapeHtmlAttr(ogType)}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtmlAttr(title)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtmlAttr(description)}" />`
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtmlAttr(ogImage)}" />`
    )
    .replace(
      /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:secure_url" content="${escapeHtmlAttr(ogImage)}" />`
    )
    .replace(
      /<meta\s+property="og:image:width"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:width" content="${ogWidth}" />`
    )
    .replace(
      /<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:height" content="${ogHeight}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtmlAttr(title)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtmlAttr(description)}" />`
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtmlAttr(ogImage)}" />`
    );

  const headInject = `<link rel="canonical" href="${escapeHtmlAttr(ogUrl)}" />\n    <meta property="og:url" content="${escapeHtmlAttr(ogUrl)}" />\n    ${extraJsonLd}`;
  updated = updated.replace('</head>', `    ${headInject}\n  </head>`);
  return updated;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));

  // Ensure initial persistent store exists
  ensureStore();

  // --- Public SEO endpoints ---
  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const store = ensureStore();
    const published = store.videos.filter((v) => v.status === 'published');
    const urls = [
      `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
      ...published.map(
        (v) =>
          `  <url>\n    <loc>${baseUrl}/ajuda/${encodeURIComponent(v.slug)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      ),
    ];
    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
      );
  });

  // --- Public Catalog API ---
  app.get('/api/catalog', (_req, res) => {
    const store = ensureStore();
    const publishedVideos = store.videos.filter((v) => v.status === 'published');
    res.json({
      categories: [...store.categories].sort((a, b) => a.order - b.order),
      videos: publishedVideos,
      trails: [...store.trails].sort((a, b) => a.order - b.order),
      youtubeIntegration: store.youtubeIntegration,
    });
  });

  app.get('/api/videos/:slug', (req, res) => {
    const store = ensureStore();
    const video = store.videos.find(
      (v) => v.slug === req.params.slug && v.status === 'published'
    );
    if (!video) {
      res.status(404).json({ error: 'Tutorial não encontrado ou indisponível.' });
      return;
    }
    res.json({ video });
  });

  app.post('/api/videos/:id/view', (req, res) => {
    const store = ensureStore();
    const video = store.videos.find((v) => v.id === req.params.id && v.status === 'published');
    if (!video) {
      res.status(404).json({ error: 'Vídeo não encontrado.' });
      return;
    }
    video.views = (video.views || 0) + 1;
    saveStore(store);
    res.json({ id: video.id, views: video.views });
  });

  // --- Static public assets & Vite/Dist SPA fallback with dynamic SEO injection ---
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ error: 'Rota não encontrada.' });
        return;
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        const store = ensureStore();
        html = injectSeoMeta(html, req, store);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));
    app.use('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ error: 'Rota não encontrada.' });
        return;
      }
      const distHtmlPath = path.join(distDir, 'index.html');
      let html = fs.readFileSync(distHtmlPath, 'utf8');
      const store = ensureStore();
      html = injectSeoMeta(html, req, store);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Central de Ajuda CS22 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
