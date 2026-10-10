import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3333;

// 1. Permanent redirect from /demo to root /
app.use('/demo', (req, res) => {
  res.redirect(301, '/');
});

// 2. Serve static images directory
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  maxAge: '30d',
  immutable: true
}));

// Backwards-compatible image paths
app.use('/dress-code', express.static(path.join(__dirname, 'public', 'images', 'dress-code'), { maxAge: '30d' }));
app.use('/story', express.static(path.join(__dirname, 'public', 'images', 'story'), { maxAge: '30d' }));
app.use('/_next/static', express.static(path.join(__dirname, 'public', '_next', 'static'), { maxAge: '30d' }));

// Backwards-compatible direct image files at root
app.get('/cover.webp', (req, res) => res.sendFile(path.join(__dirname, 'public', 'images', 'cover.webp')));
app.get('/venue.webp', (req, res) => res.sendFile(path.join(__dirname, 'public', 'images', 'venue.webp')));
app.get('/footer.webp', (req, res) => res.sendFile(path.join(__dirname, 'public', 'images', 'footer.webp')));

// General public static assets
app.use(express.static(path.join(__dirname, 'public')));

// Next.js image endpoint fallback if anything calls /_next/image
app.get('/_next/image', (req, res) => {
  const imageUrl = req.query.url || '';
  if (imageUrl.includes('hero') || imageUrl.includes('cover')) {
    return res.sendFile(path.join(__dirname, 'public', 'images', 'hero.webp'));
  }
  if (imageUrl.includes('venue')) {
    return res.sendFile(path.join(__dirname, 'public', 'images', 'venue.webp'));
  }
  if (imageUrl.includes('footer')) {
    return res.sendFile(path.join(__dirname, 'public', 'images', 'footer.webp'));
  }
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
      if (imageUrl.includes(`story-${i}-${j}`)) {
        return res.sendFile(path.join(__dirname, 'public', 'images', 'story', `story-${i}-${j}.webp`));
      }
    }
  }
  res.redirect(imageUrl);
});

// Serve wedding website directly at root '/'
app.get(['/', '/index.html'], (req, res) => {
  const candidate1 = path.join(__dirname, 'public', 'index.html');
  const candidate2 = path.join(process.cwd(), 'public', 'index.html');
  const candidate3 = path.join(process.cwd(), 'index.html');
  const target = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : (fs.existsSync(candidate3) ? candidate3 : null));
  if (target) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return fs.createReadStream(target).pipe(res);
  }
  res.status(500).send('Website index.html not found');
});

// Catch-all route to serve the single page app
app.use((req, res) => {
  const target = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return fs.createReadStream(target).pipe(res);
  }
  res.status(404).send('Not Found');
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
