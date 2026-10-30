// server.js - Production Server Entry Point for Hostinger Node.js
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV === 'development';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

function getPersistentUploadsDir() {
  if (process.env.MEDIA_UPLOADS_DIR && process.env.MEDIA_UPLOADS_DIR.trim()) {
    return path.resolve(process.env.MEDIA_UPLOADS_DIR.trim());
  }
  if (process.platform === 'linux') {
    const homeMatch = process.cwd().match(/^(\/home\/[^/]+)/);
    if (homeMatch) {
      return path.join(homeMatch[1], 'shirin_shila_persistent_data', 'uploads');
    }
  }
  return path.join(process.cwd(), 'public', 'uploads');
}

app.prepare().then(() => {
  const uploadsDir = getPersistentUploadsDir();

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Explicit robots.txt handler with Content-Signal & Sitemap directives
      if (pathname === '/robots.txt') {
        const robotsContent = `# Robots.txt for Shirin Shila Portfolio
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Content-Signal: search=yes, ai-train=no
Sitemap: https://cornflowerblue-wildcat-675604.hostingersite.com/sitemap.xml
Sitemap: https://shirinshila.com/sitemap.xml
`;
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
        });
        res.end(robotsContent);
        return;
      }

      // Fast streaming static uploads handler
      if (pathname && pathname.startsWith('/uploads/')) {
        const rel = decodeURIComponent(pathname.replace(/^\/uploads\//, ''));
        const safeRel = path.normalize(rel).replace(/^(\.\.[\/\\])+/, '');
        const targetPath = path.resolve(uploadsDir, safeRel);

        if (targetPath.startsWith(uploadsDir) && fs.existsSync(targetPath)) {
          const stat = fs.statSync(targetPath);
          if (stat.isFile()) {
            const ext = path.extname(targetPath).toLowerCase();
            res.writeHead(200, {
              'Content-Type': MIME_MAP[ext] || 'application/octet-stream',
              'Content-Length': stat.size,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Content-Type-Options': 'nosniff',
            });
            fs.createReadStream(targetPath).pipe(res);
            return;
          }
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, () => {
    console.log(`> Shirin Shila Portfolio production server ready on http://${hostname}:${port}`);
  });
});
