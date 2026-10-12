import express from 'express';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { rsvpHtml } from './rsvp-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveFilePath(...segments) {
  const candidates = [
    path.join(__dirname, ...segments),
    path.join(process.cwd(), ...segments),
    path.join(__dirname, 'public', ...segments),
    path.join(process.cwd(), 'public', ...segments),
    path.join(__dirname, 'public', 'demo', 'kevin-wedding', ...segments),
    path.join(process.cwd(), 'public', 'demo', 'kevin-wedding', ...segments),
    path.join(__dirname, 'public', 'templates', 'kevin-wedding', ...segments),
    path.join(process.cwd(), 'public', 'templates', 'kevin-wedding', ...segments),
    path.join(__dirname, 'public', 'images', ...segments),
    path.join(process.cwd(), 'public', 'images', ...segments),
    path.join(__dirname, 'public', 'story', ...segments),
    path.join(process.cwd(), 'public', 'story', ...segments),
    path.join(__dirname, 'public', 'collage', ...segments),
    path.join(process.cwd(), 'public', 'collage', ...segments),
    path.join(__dirname, 'public', 'dress-code', ...segments),
    path.join(process.cwd(), 'public', 'dress-code', ...segments)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const COVER_PATH = resolveFilePath('cover.webp');
const FOOTER_PATH = resolveFilePath('footer.webp');
const VENUE_PATH = resolveFilePath('venue.webp');
const STORY_DIR = resolveFilePath('story');
const COLLAGE_DIR = resolveFilePath('collage');
const FAVICON_PATH = resolveFilePath('favicon.png');
const FAVICON_ICO_PATH = resolveFilePath('favicon.ico');
const ICON_SVG_PATH = resolveFilePath('icon.svg');
const APPLE_TOUCH_ICON_PATH = resolveFilePath('apple-touch-icon.png');

const app = express();
const PORT = 3333;

// Helper to serve local images
const serveFile = (filePath, res) => {
  const resolved = fs.existsSync(filePath) ? filePath : resolveFilePath(path.basename(filePath));
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return res.status(404).send('Not found');
  }
  const ext = path.extname(resolved).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  res.setHeader('Content-Type', mimeTypes[ext] || 'image/webp');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  fs.createReadStream(resolved).pipe(res);
};

// 1. Universal image interceptor (handles _next/image, direct image URLs, and query URLs regardless of path)
app.use((req, res, next) => {
  let targetUrl = req.query.url;
  if (!targetUrl && req.url.includes('?')) {
    try {
      const u = new URL(req.url, 'http://localhost');
      targetUrl = u.searchParams.get('url');
    } catch (e) {}
  }

  if (targetUrl) {
    const cleanName = path.basename(decodeURIComponent(targetUrl).split('?')[0]);
    let resolved = resolveFilePath(cleanName);
    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
      const dot = cleanName.lastIndexOf('.');
      if (dot !== -1) {
        resolved = resolveFilePath(cleanName.substring(0, dot) + '.webp');
      }
    }
    if (fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory()) {
      return serveFile(resolved, res);
    }
  }

  const cleanPath = req.url.split('?')[0];
  if (/\.(webp|png|jpe?g|svg)$/i.test(cleanPath)) {
    const filename = path.basename(cleanPath);
    let resolved = resolveFilePath(filename);
    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
      const dot = filename.lastIndexOf('.');
      if (dot !== -1) {
        resolved = resolveFilePath(filename.substring(0, dot) + '.webp');
      }
    }
    if (fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory()) {
      return serveFile(resolved, res);
    }
  }

  next();
});

// Google Sheets RSVP Integration
const DEFAULT_GCONFIG_B64 = 'eyJjbGllbnRJZCI6IjEwNzEwMDYwNjA1OTEtdG1oc3NpbjJoMjFsY3JlMjM1dnRvbG9qaDRnNDAzZXAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJjbGllbnRTZWNyZXQiOiJHT0NTUFgtSzU4RldSNDg2TGRMSjFtTEI4c1hDNHo2cURBZiIsInJlZnJlc2hUb2tlbiI6IjEvLzBlVHEteU1ULVhtYkVDZ1lJQVJBQUdBNFNOd0YtTDlJcnVLSElUN1k5Zi1Nc0w0T2Z4VWRkUlRwWXNFcm1GTDRpNGI4SGF4RW80cEZBWXpvRFdDQ3pTUHh6Z2NscmRpNkNfZ00iLCJzcHJlYWRzaGVldElkIjoiMVpwenRBdHVfYWgwQ1N2QXVIdzRWMnJXQTlkVERLMEY5Rl9HU0ZTWElRZ0EiLCJzaGVldE5hbWUiOiJSU1ZQIFJlc3BvbnNlcyJ9';

function getGoogleConfig() {
  try {
    const raw = process.env.GOOGLE_CONFIG_B64 || DEFAULT_GCONFIG_B64;
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch (e) {
    return {};
  }
}

async function appendRsvpToGoogleSheet(data) {
  const gcfg = getGoogleConfig();
  const tokenParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || gcfg.clientId,
    client_secret: process.env.GOOGLE_CLIENT_SECRET || gcfg.clientSecret,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN || gcfg.refreshToken,
    grant_type: 'refresh_token'
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString()
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Could not refresh Google OAuth token: ' + JSON.stringify(tokenData));
  }

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || gcfg.spreadsheetId || '1ZpztAtu_ah0CSvAuHw4V2rWA9dTDK0F9F_GSFSXIQgA';
  const sheetName = gcfg.sheetName || 'RSVP Responses';

  // Check for duplicate name in Column B (Full Name)
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!B:B`;
  const getRes = await fetch(getUrl, {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
  });
  const getData = await getRes.json();

  if (getData.values && getData.values.length > 1) {
    const inputNormalized = (data.fullName || '').trim().toLowerCase();
    const isDuplicate = getData.values.slice(1).some(row => {
      const existingName = (row[0] || '').toString().trim().toLowerCase();
      return existingName === inputNormalized;
    });

    if (isDuplicate) {
      const err = new Error(`An RSVP under the name "${data.fullName}" has already been submitted.`);
      err.code = 'DUPLICATE_NAME';
      throw err;
    }
  }

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const row = [
    timestamp,
    data.fullName || '',
    data.attendance || '',
    String(data.guestCount !== undefined ? data.guestCount : 1),
    data.dietary || 'None',
    data.message || ''
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:F:append?valueInputOption=USER_ENTERED`;

  const appendRes = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  });

  const appendData = await appendRes.json();
  if (appendData.error) {
    throw new Error('Google Sheets API error: ' + JSON.stringify(appendData.error));
  }
  return appendData;
}

// 2. Parse JSON & normalize request URL for Vercel Serverless environment
app.use(express.json());

app.use((req, res, next) => {
  const isRsvp = req.url.includes('action=rsvp') || req.url === '/api/rsvp' || req.headers['x-matched-path'] === '/api/rsvp';
  if (isRsvp) {
    req.url = '/api/rsvp';
    return next();
  }
  const matched = req.headers['x-matched-path'];
  if (matched && !matched.startsWith('/api') && matched !== '/index.js' && !matched.includes('[...catchAll]')) {
    const qIndex = req.url.indexOf('?');
    const qs = qIndex !== -1 ? req.url.slice(qIndex) : '';
    req.url = matched.includes('?') ? matched : (matched + qs);
  } else if (req.url === '/api/index.js' || req.url === '/api/index' || req.url === '/api' || req.url === '/index.js' || (matched && matched.includes('[...catchAll]'))) {
    req.url = '/';
  }
  next();
});

// RSVP submission endpoint
app.post('/api/rsvp', async (req, res) => {
  try {
    const { fullName, attendance, guestCount, dietary, message } = req.body || {};
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }

    const payload = {
      fullName: fullName.trim(),
      attendance: attendance || 'Joyfully Accepts',
      guestCount: attendance === 'Regretfully Declines' ? 0 : (parseInt(guestCount, 10) || 1),
      dietary: (dietary || '').trim() || 'None',
      message: (message || '').trim()
    };

    await appendRsvpToGoogleSheet(payload);

    return res.status(200).json({
      success: true,
      message: 'RSVP confirmed successfully!'
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_NAME') {
      return res.status(409).json({
        error: err.message,
        duplicate: true
      });
    }
    console.error('Error recording RSVP:', err);
    return res.status(500).json({
      error: 'An error occurred while saving your RSVP. Please try again.'
    });
  }
});

// Story images mapping
const storyImageMap = {
  // Chapter 1: Where it all began
  'story-1-1.webp': path.join(STORY_DIR, 'story-1-1.webp'),
  'story-1-2.webp': path.join(STORY_DIR, 'story-1-2.webp'),
  'story-1-3.webp': path.join(STORY_DIR, 'story-1-3.webp'),
  // Chapter 2: When it became intentional
  'story-2-1.webp': path.join(STORY_DIR, 'story-2-1.webp'),
  'story-2-2.webp': path.join(STORY_DIR, 'story-2-2.webp'),
  'story-toronto-3.webp': path.join(STORY_DIR, 'story-toronto-3.webp'),
  // Chapter 3: When we said yes to a lifetime
  'story-3-1.webp': path.join(STORY_DIR, 'story-3-1.webp'),
  'story-3-2.webp': path.join(STORY_DIR, 'story-3-2.webp'),
  'story-engagement-3.webp': path.join(STORY_DIR, 'story-engagement-3.webp')
};

// Collage images mapping
const collageImageMap = {
  'hero-portugal.webp': path.join(COLLAGE_DIR, 'hero-portugal.webp'),
  'gallery-2.webp': path.join(COLLAGE_DIR, 'gallery-2.webp'),
  'hero-thunderbay.webp': path.join(COLLAGE_DIR, 'hero-thunderbay.webp'),
  'hero-shoes.webp': path.join(COLLAGE_DIR, 'hero-shoes.webp')
};

// Route root '/' to '/demo' so the wedding website serves as the homepage
app.get('/', (req, res, next) => {
  req.url = '/demo';
  next();
});

// Favicon and tab logo routes
app.get('/favicon.ico', (req, res) => serveFile(FAVICON_ICO_PATH, res));
app.get('/favicon.png', (req, res) => serveFile(FAVICON_PATH, res));
app.get('/icon.svg', (req, res) => serveFile(ICON_SVG_PATH, res));
app.get('/apple-touch-icon.png', (req, res) => serveFile(APPLE_TOUCH_ICON_PATH, res));
app.get('/apple-touch-icon-precomposed.png', (req, res) => serveFile(APPLE_TOUCH_ICON_PATH, res));

// Intercept cover, footer, and venue image requests
app.get('/demo/kevin-wedding/hero.webp', (req, res) => serveFile(COVER_PATH, res));
app.get('/demo/kevin-wedding/footer.webp', (req, res) => serveFile(FOOTER_PATH, res));
app.get('/demo/kevin-wedding/venue.webp', (req, res) => serveFile(VENUE_PATH, res));
app.get('/templates/kevin-wedding/venue.webp', (req, res) => serveFile(VENUE_PATH, res));

// Intercept story image direct requests
for (const [filename, filePath] of Object.entries(storyImageMap)) {
  app.get(`/demo/kevin-wedding/${filename}`, (req, res) => serveFile(filePath, res));
  app.get(`/templates/kevin-wedding/${filename}`, (req, res) => serveFile(filePath, res));
}

// Intercept collage image direct requests
for (const [filename, filePath] of Object.entries(collageImageMap)) {
  app.get(`/demo/kevin-wedding/${filename}`, (req, res) => serveFile(filePath, res));
  app.get(`/templates/kevin-wedding/${filename}`, (req, res) => serveFile(filePath, res));
}

// Serve dress code inspiration images
app.use('/dress-code', express.static(path.join(__dirname, 'public', 'dress-code')));

// Next.js image optimization endpoint
app.get('/_next/image', (req, res, next) => {
  const imageUrl = req.query.url || '';
  for (const [filename, filePath] of Object.entries(collageImageMap)) {
    if (imageUrl.includes(filename)) {
      return serveFile(filePath, res);
    }
  }
  for (const [filename, filePath] of Object.entries(storyImageMap)) {
    if (imageUrl.includes(filename)) {
      return serveFile(filePath, res);
    }
  }
  if (imageUrl.includes('hero.webp')) {
    return serveFile(COVER_PATH, res);
  }
  if (imageUrl.includes('footer.webp')) {
    return serveFile(FOOTER_PATH, res);
  }
  if (imageUrl.includes('venue.webp')) {
    return serveFile(VENUE_PATH, res);
  }
  next();
});

// Quote configuration
const oldQuote = 'you’re my favorite person to do anything with for the rest of my life.';
const newQuoteText = `weaving every detail together.

What felt ordinary in the moment became part of something extraordinary.

“He has made everything beautiful in its time.”
Ecclesiastes 3:11`;
const newQuoteJson = newQuoteText.split('\n').join('\\\\n');

// Chapter Stories configuration
const ch1TitleOld = 'chapter one: how we met';
const ch1TitleNew = 'Chapter 1: “Where it all began”';
const ch1BodyOld = 'We met at university, became fast friends, and eventually realized the best parts of every week were the parts we spent together.';
const ch1BodyNew = 'A simple “hello” grew into shared moments and intentional friendship—God quietly weaving our stories together from the very start.';
const ch1BodyJson = ch1BodyNew;

const ch2TitleOld = 'chapter two: falling in love';
const ch2TitleNew = 'Chapter 2: “When it became intentional”';
const ch2BodyOld = 'Toronto became our home base for late dinners, weekend walks, shared routines, and all of the small moments that made life feel bigger.';
const ch2BodyNew = 'Casual talks turned into clear intentions. Not rushed, but with prayer, purpose, and grace — God led us to one another.';
const ch2BodyJson = ch2BodyNew;

const ch3TitleOld = 'chapter three: the next step';
const ch3TitleNew = 'Chapter 3: “When we said YES to a lifetime”';
const ch3BodyOld = 'A trip, a question, a very easy yes, and suddenly the future we had been imagining became something we could invite everyone into.';
const ch3BodyNew = 'After every intentional step came a resounding YES—trusting the God who brought us this far for a lifetime of walking together in grace.';
const ch3BodyJson = ch3BodyNew;

const polaroidTitles = [
  'First year on campus',
  'Coffee between classes',
  'The start of everything',
  'A favorite city corner',
  'Weekends downtown',
  'Our everyday ritual',
  'The weekend away',
  'Right after yes',
  'Celebrating together'
];

// Transition Line configuration
const oldTransitionSpans = '<span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">you&#x27;re</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">cordially</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">invited</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">to</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">celebrate</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">the</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">story</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">of...</span>';
const newTransitionSpans = '<span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">two</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">separate</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">stories</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">woven</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">by</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out;font-style:italic">grace</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">into</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">one...</span>';
const oldTransitionText = "you're cordially invited to celebrate the story of...";
const newTransitionText = "two separate stories woven by grace into one...";

// Dress Code configuration
const oldLadiesBody = 'Tea or floor-length dresses are welcome. Bright colors and florals are encouraged.\\\\n\\\\nWear comfortable shoes for wandering and dancing.';
const newLadiesBody = 'Long dresses, midi dresses, elegant jumpsuits, or formal garden attire in shades of Mocha.\\\\n\\\\nKindly avoid neon colors, very bright red, orange, yellow, overly loud prints, jeans, and casual footwear.';

const oldGentlemenSection = '{\\"id\\":\\"gentlemen\\",\\"title\\":\\"For the Gentlemen\\",\\"subtitle\\":\\"Classic with a summer touch\\",\\"body\\":\\"Dress shirts and suits are perfect. Linen and lighter colors are encouraged.\\\\n\\\\nKeep things polished but breathable for a warm summer evening.\\",\\"isVisible\\":true}';
const newGentlemenAndEntourageSection = '{\\"id\\":\\"gentlemen\\",\\"title\\":\\"For the Gentlemen (Guests)\\",\\"subtitle\\":\\"Formal Suits & Polo\\",\\"body\\":\\"Suits or long-sleeved polo paired with trousers.\\\\n\\\\nKindly avoid jeans, shorts, and casual footwear.\\",\\"isVisible\\":true},{\\"id\\":\\"entourage\\",\\"title\\":\\"For the Entourage\\",\\"subtitle\\":\\"Curated Color & Attire Guide\\",\\"body\\":\\"• Principal Sponsors: Gray taupe long dress (Female) / Formal barong, black pants & black shoes (Male)\\\\n\\\\n• Secondary Sponsors: Champagne long dress (Female) / Formal barong, black pants & black shoes (Male)\\\\n\\\\n• Bridesmaids: Sage green long dress (tulle, mismatched styles)\\\\n\\\\n• Groomsmen & Bearers: Formal barong, black pants, black shoes\\\\n\\\\n• Flower Girls: Sage green floral midi dress\\",\\"isVisible\\":true}';

// Vision Statement configuration
const oldVisionText = "The vision for the night is simple: all of our most beloved people in one place that happens to have a gorgeous garden, flowing drinks, and an unforgettable dance floor.";
const newVisionText = "In His time, grace upon grace. What began as two separate stories is now one celebration of God’s faithfulness, surrounded by the people we love most.";

// Clean token replacements for information only
const replacements = [
  // Names & Monogram
  ['Jim \\\\u0026 Pam', 'Jed \\\\u0026 Vanj'],
  ['Jim \\u0026 Pam', 'Jed \\u0026 Vanj'],
  ['Jim &amp; Pam', 'Jed &amp; Vanj'],
  ['Jim & Pam', 'Jed & Vanj'],
  ['Jim and Pam', 'Jed and Vanj'],
  ['Jim or Pam', 'Jed or Vanj'],
  ['J&amp;P', 'J&amp;V'],
  ['J\\\\u0026P', 'J\\\\u0026V'],
  ['J\\u0026P', 'J\\u0026V'],
  ['J&P', 'J&V'],
  ['Demo Wedding Website | Cordially', 'Jed & Vanj — Wedding Website'],
  ['Jed &amp; Vange', 'Jed &amp; Vanj'],
  ['Jed & Vange', 'Jed & Vanj'],
  ['Jed and Vange', 'Jed and Vanj'],

  // Date & Event Kicker
  ['june 18, 2027', 'December 8, 2026'],
  ['June 18, 2027', 'December 8, 2026'],
  ['2027-06-18', '2026-12-08'],
  ['december 8, 2026', 'December 8, 2026'],
  ['so please join us...', 'We would love for you to join us'],
  ['so please join us', 'We would love for you to join us'],
  ['So please join us...', 'We would love for you to join us'],
  ['So please join us', 'We would love for you to join us'],

  // RSVP deadline
  ['august 20, 2027', 'october 30, 2026'],
  ['August 20, 2027', 'October 30, 2026'],

  // Venue
  ['Cecil Green Park House', 'Zaycoland Resort and Hotel'],
  ['6251 Cecil Green Park Rd, Vancouver, BC', 'Kabankalan City, Negros Occidental'],
  ['https://maps.google.com/?q=6251+Cecil+Green+Park+Rd+Vancouver+BC', 'https://share.google/hZBElWZSFrunPhIBL'],
  ['https://maps.google.com/?q=Zaycoland+Resort+and+Hotel+Kabankalan+City+Negros+Occidental', 'https://share.google/hZBElWZSFrunPhIBL'],
  ['>Kabankalan City, Negros Occidental</a>', '>Kabankalan City, Negros Occidental</a><div id="venue-location-btn" class="mt-6 flex justify-center"><a href="https://share.google/hZBElWZSFrunPhIBL" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-transform hover:scale-105" style="background-color: #8a5a2b; color: #fff9f1; box-shadow: 0 4px 14px rgba(138, 90, 43, 0.28); text-decoration: none;"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg><span>View on Google Maps</span></a></div>'],

  // Chapter 1
  [`\\"${ch1BodyOld}\\"`, `\\"${ch1BodyJson}\\"`],
  [`>${ch1BodyOld}<`, `>${ch1BodyNew}<`],
  [`\\"${ch1TitleOld}\\"`, `\\"${ch1TitleNew}\\"`],
  [`>${ch1TitleOld}<`, `>${ch1TitleNew}<`],
  [ch1TitleOld, ch1TitleNew],

  // Chapter 2
  [`\\"${ch2BodyOld}\\"`, `\\"${ch2BodyJson}\\"`],
  [`>${ch2BodyOld}<`, `>${ch2BodyNew}<`],
  [`\\"${ch2TitleOld}\\"`, `\\"${ch2TitleNew}\\"`],
  [`>${ch2TitleOld}<`, `>${ch2TitleNew}<`],
  [ch2TitleOld, ch2TitleNew],

  // Chapter 3
  [`\\"${ch3BodyOld}\\"`, `\\"${ch3BodyJson}\\"`],
  [`>${ch3BodyOld}<`, `>${ch3BodyNew}<`],
  [`\\"${ch3TitleOld}\\"`, `\\"${ch3TitleNew}\\"`],
  [`>${ch3TitleOld}<`, `>${ch3TitleNew}<`],
  [ch3TitleOld, ch3TitleNew],

  // Footer Quote
  [`\\"${oldQuote}\\"`, `\\"${newQuoteJson}\\"`],
  [`>${oldQuote}<`, `>${newQuoteText}<`],

  // Clear demo-specific polaroid titles so cards are clean
  ...polaroidTitles.flatMap(pt => [
    [`\\"${pt}\\"`, '\\"\\"'],
    [`"${pt}"`, '""'],
    [pt, '']
  ]),

  // Transition Line
  [oldTransitionSpans, newTransitionSpans],
  [`\\"${oldTransitionText}\\"`, `\\"${newTransitionText}\\"`],
  [`"${oldTransitionText}"`, `"${newTransitionText}"`],
  [oldTransitionText, newTransitionText],

  // Vision Statement (Option 1)
  [`\\"${oldVisionText}\\"`, `\\"${newVisionText}\\"`],
  [`>${oldVisionText}<`, `>${newVisionText}<`],
  [oldVisionText, newVisionText],

  // FAQ Replacements (10 Questions mapped into 9 slots from couple's wedding-plan.txt)
  // Q1: RSVP deadline
  ['When should I RSVP by?', 'When is the RSVP deadline?'],
  ['Please RSVP by October 30, 2026.', 'Please confirm your attendance by October 30 so we can prepare everything for you.'],

  // Q2: Dress Code / Attire
  ['Is there a dress code?', 'What should I wear?'],
  ['Yes! Think Summer Garden Party.', 'Please refer to our Dress Code section for the suggested attire and color palette (Mocha palette for guests, and assigned attire for our entourage).'],

  // Q3: Arrival time
  ['Is the wedding outdoors?', 'What time should I arrive?'],
  ['Yes! The ceremony will take place in the garden and the reception will take place on the terrace.', 'We encourage our guests to arrive at least 30 minutes before the ceremony so everyone can be comfortably seated before we begin.'],

  // Q4: Gifts
  ['What will the weather be like? What happens if it rains?', 'Can I give a gift?'],
  ['Expect a warm afternoon and a cooler evening. We recommend bringing a light layer just in case.', 'Your presence at our wedding is already a gift we deeply treasure. If you wish to bless us further, we kindly prefer monetary gifts rather than physical gifts as we begin building our life together. Thank you for being part of our story and for celebrating this new chapter with us. 🤍'],

  // Q5: Plus-one & Children
  ['Can I bring a plus one or my kids?', 'Can I bring a plus-one or children?'],
  ['We are keeping the guest list intimate, so plus-ones and children may be limited depending on your invitation.', 'We kindly ask that you follow the number of guests and family members indicated in your invitation and RSVP.'],

  // Q6: Photos & Videos
  ['What time should I arrive at the ceremony?', 'Can I take photos and videos?'],
  ['Please plan to arrive about 15 minutes before the ceremony begins so everyone has time to get settled.', 'Absolutely! 📸 We’d love for you to capture and share the special moments with us. Feel free to take photos and videos throughout the celebration, and don’t forget to tag us!'],

  // Q7: Dietary Restrictions
  ['I have a food allergy, can I make a special request?', 'What if I have dietary restrictions?'],
  ['Yes! Please make note of any food allergies or restrictions when submitting your RSVP and we will do our best to accommodate.', 'Please let us know when you RSVP so we can make the necessary arrangements.'],

  // Q8: Parking
  ['Is there parking at the venue?', 'Is parking available?'],
  ['Use this answer to share parking, drop-off, shuttle, or rideshare instructions for your venue.', 'Yes, parking is available at the venue. Our coordinators and ushers will be happy to assist you upon arrival at Zaycoland Resort.'],

  // Q9: Unable to attend
  ['Help! I have other questions!', 'What if I can\'t attend?'],
  ['Please reach out at your-email@example.com with any other questions.', 'We completely understand! Please let us know through the RSVP form so we can finalize our arrangements. Your prayers and love are more than enough. 🤍'],

  // Old Dress Code Modal Fallback (if ever opened)
  ['Summer garden party vibes.', 'Mocha Palette · Formal Attire'],
  ['Think summer garden party.', 'Formal and semi-formal garden attire. We warmly invite our guests to celebrate with us in our Mocha wedding palette.'],
  ['For the Ladies', 'For the Ladies (Guests)'],
  ['Elegant, colorful, and comfortable', 'Mocha Palette · Formal Garden Attire'],
  [oldLadiesBody, newLadiesBody],
  [oldGentlemenSection, newGentlemenAndEntourageSection],

  // Navbar Links
  ['href="#details">Travel Logistics</a>', 'href="#entourage-section">Entourage</a>'],
  ['href="#details">Registry</a>', 'href="#dress-code-section">Dress Code</a>'],
  ['{\\"label\\":\\"Travel\\",\\"targetId\\":\\"details\\",\\"overlayCardId\\":\\"travel\\"', '{\\"label\\":\\"Entourage\\",\\"targetId\\":\\"entourage-section\\",\\"overlayCardId\\":\\"\\"'],
  ['{\\"label\\":\\"Registry\\",\\"targetId\\":\\"details\\",\\"overlayCardId\\":\\"registry\\"', '{\\"label\\":\\"Dress Code\\",\\"targetId\\":\\"dress-code-section\\",\\"overlayCardId\\":\\"\\"'],
  ['href="/demo/rsvp"', 'href="#rsvp-callout-section"'],
  ['{\\"label\\":\\"RSVP\\",\\"targetId\\":\\"rsvp\\"', '{\\"label\\":\\"RSVP\\",\\"targetId\\":\\"rsvp-callout-section\\"'],

  // Remove Cordially platform branding badge
  ['Created on Cordially.io', ''],
  ['Created on Cordially', ''],

  // Off-white Jed & Vange headline
  ['style="fill:#ffffff;--template-fitted-font-size:140px;', 'style="fill:#f7efe2;--template-fitted-font-size:140px;'],

  // Preserve line breaks cleanly in footer quote and story captions & hide old details container & anchor offsets & responsive mobile story adjustments & minimal hero bottom gradient & mobile black burger/J&V & brown radio styling & italic grace & text-wrap balance & lowered hero headline & tab favicon & remove hero divider line
  ['</head>', '<link rel="icon" type="image/png" sizes="192x192" href="/favicon.png"><link rel="shortcut icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><style>[data-testid="footer-quote"], [data-story-caption-group] p, [data-testid="mobile-story-caption-body"] { white-space: pre-line !important; line-height: 1.4 !important; text-wrap: balance !important; } @media (max-width: 768px) { [data-story-caption-group] p, [data-testid="mobile-story-caption-body"] { font-size: 0.88rem !important; line-height: 1.35 !important; max-width: 92% !important; margin-left: auto !important; margin-right: auto !important; margin-bottom: 14px !important; } nav a[href="/"], nav [data-testid="nav-content"] > a { color: #000000 !important; } nav button[aria-label*="menu" i], nav [data-testid="nav-content"] button { color: #000000 !important; } nav button[aria-label*="menu" i] span, nav [data-testid="nav-content"] button span { background-color: #000000 !important; } nav button[aria-label*="menu" i] svg, nav [data-testid="nav-content"] button svg { stroke: #000000 !important; color: #000000 !important; } } [data-site-section-id="details"], a[href*="cordially.io"] { display: none !important; } #dress-code-section, #entourage-section, #rsvp-callout-section { scroll-margin-top: 80px; } #rsvp-callout-section, #rsvp-section-wrapper, #wedding-rsvp-form { opacity: 1 !important; visibility: visible !important; display: block !important; } #attendance-options { display: grid !important; gap: 14px !important; } .rsvp-radio-card { display: flex !important; align-items: center !important; padding: 16px 20px !important; cursor: pointer !important; } .rsvp-radio-circle { margin-right: 18px !important; flex-shrink: 0 !important; width: 22px !important; height: 22px !important; min-width: 22px !important; min-height: 22px !important; border-radius: 9999px !important; } input[type="radio"], input[type="radio"]:focus, input[type="radio"]:checked { accent-color: #8a5a2b !important; outline: none !important; } [data-site-section-id="storyIntro"] em, [data-site-section-id="storyIntro"] [data-vision-word="true"]:nth-of-type(6) { font-style: italic !important; } [data-site-section-id="hero"] [data-hero-headline-shell], [data-testid="hero-headline"] { fill: #f7efe2 !important; color: #f7efe2 !important; filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45)) !important; stroke: none !important; -webkit-text-stroke: 0 !important; } [data-site-section-id="hero"] .bg-black\\/20 { display: none !important; } [data-testid="hero-foreground"] { background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.45) 85%, rgba(0,0,0,0.65) 100%) !important; } [data-site-section-id="hero"] [data-hero-headline-container] { bottom: 4.5rem !important; } [data-site-section-id="hero"] img { object-position: center center !important; } [data-testid="hero-scroll-prompt"] { filter: none !important; } [data-testid="hero-divider"] { display: none !important; opacity: 0 !important; visibility: hidden !important; }</style></head>']
];

function replaceInfo(content) {
  let res = content;
  for (const [src, dst] of replacements) {
    res = res.replaceAll(src, dst);
  }
  return res;
}

// 100% pure transparent proxy preserving all original code, scripts, styles, and animations
app.use(createProxyMiddleware({
  target: 'https://www.cordially.io',
  changeOrigin: true,
  selfHandleResponse: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Host', 'www.cordially.io');
      proxyReq.setHeader('Accept-Encoding', 'identity');
    },
    proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];

      const contentType = proxyRes.headers['content-type'] || '';
      if (
        contentType.includes('text/html') ||
        contentType.includes('application/json') ||
        contentType.includes('text/x-component') ||
        contentType.includes('text/plain')
      ) {
        let text = responseBuffer.toString('utf8');
        text = replaceInfo(text);

        if (contentType.includes('text/html')) {
          const entouragePath = resolveFilePath('entourage-section.html');
          const entourageHtml = fs.existsSync(entouragePath) ? fs.readFileSync(entouragePath, 'utf8') : '';

          const dressCodePath = resolveFilePath('dress-code-section.html');
          const dressCodeHtml = fs.existsSync(dressCodePath) ? fs.readFileSync(dressCodePath, 'utf8') : '';

          // 1. Server-side initial render injection
          const entourageWrapper = `<div data-scroll-section="" data-scroll-section-kind="content" data-site-section-id="entourage">${entourageHtml}</div>`;
          const dressCodeWrapper = `<div data-scroll-section="" data-scroll-section-kind="content" data-site-section-id="dress-code">${dressCodeHtml}</div>`;

          if (rsvpHtml && text.includes('id="rsvp-callout-section"')) {
            text = text.replace(
              /<section id="rsvp-callout-section"[\s\S]*?<\/section>/,
              `<section id="rsvp-callout-section" class="relative z-30 w-full" style="scroll-margin-top: 80px;">${rsvpHtml}</section>`
            );
          }

          if (text.includes('data-design-anchor="venue"')) {
            text = text.replace('<div data-design-anchor="venue"', entourageWrapper + '<div data-design-anchor="venue"');
          }
          if (text.includes('data-design-anchor="faq"')) {
            text = text.replace('<div data-design-anchor="faq"', dressCodeWrapper + '<div data-design-anchor="faq"');
          }

          // 2. Client-side hydration watchdog and interactive controller
          const safeEntourageJson = JSON.stringify(entourageHtml).replace(/<\/script/gi, '<\\/script');
          const safeDressCodeJson = JSON.stringify(dressCodeHtml).replace(/<\/script/gi, '<\\/script');
          const safeRsvpJson = JSON.stringify(rsvpHtml).replace(/<\/script/gi, '<\\/script');

          const clientScript = `
<script>
(function() {
  window.filterDressCode = function(category, btn) {
    var buttons = document.querySelectorAll('.dc-filter-btn');
    buttons.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var cards = document.querySelectorAll('#dc-grid .dc-card-item');
    cards.forEach(function(card) {
      var cardCat = (card.getAttribute('data-category') || '').split(' ');
      if (category === 'all' || cardCat.indexOf(category) !== -1) {
        card.classList.remove('dc-hidden');
      } else {
        card.classList.add('dc-hidden');
      }
    });

    window.dispatchEvent(new Event('resize'));
  };

  window.selectAttendance = function(val, card) {
    var cards = document.querySelectorAll('.rsvp-radio-card');
    cards.forEach(function(c) {
      c.style.borderColor = 'rgba(47, 36, 27, 0.16)';
      c.style.backgroundColor = '#ffffff';
      var circle = c.querySelector('.rsvp-radio-circle');
      if (circle) circle.style.borderColor = 'rgba(47, 36, 27, 0.3)';
      var dot = c.querySelector('.rsvp-radio-dot');
      if (dot) {
        dot.style.opacity = '0';
        dot.style.transform = 'scale(0)';
      }
    });
    if (card) {
      card.style.borderColor = '#8a5a2b';
      card.style.backgroundColor = 'rgba(138, 90, 43, 0.06)';
      var radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      var circle = card.querySelector('.rsvp-radio-circle');
      if (circle) circle.style.borderColor = '#8a5a2b';
      var dot = card.querySelector('.rsvp-radio-dot');
      if (dot) {
        dot.style.opacity = '1';
        dot.style.transform = 'scale(1)';
      }
    }
    var guestWrapper = document.getElementById('guest-count-wrapper');
    var guestSelect = document.getElementById('rsvp-guest-count');
    if (val === 'Regretfully Declines') {
      if (guestWrapper) guestWrapper.style.display = 'none';
      if (guestSelect) guestSelect.value = '0';
    } else {
      if (guestWrapper) guestWrapper.style.display = 'block';
      if (guestSelect && guestSelect.value === '0') guestSelect.value = '2';
    }
  };

  window.handleRsvpSubmit = async function(e) {
    e.preventDefault();
    var form = document.getElementById('wedding-rsvp-form');
    var btn = document.getElementById('rsvp-submit-btn');
    var btnText = document.getElementById('rsvp-btn-text');
    var btnSpinner = document.getElementById('rsvp-btn-spinner');
    var errorDiv = document.getElementById('rsvp-error-msg');
    var successCard = document.getElementById('rsvp-success-card');

    var fullName = (document.getElementById('rsvp-full-name').value || '').trim();
    var attendanceRadio = document.querySelector('input[name="attendance"]:checked');
    var attendance = attendanceRadio ? attendanceRadio.value : 'Joyfully Accepts';
    var guestSelect = document.getElementById('rsvp-guest-count');
    var guestCount = guestSelect ? guestSelect.value : '1';
    var dietary = (document.getElementById('rsvp-dietary').value || '').trim() || 'None';
    var message = (document.getElementById('rsvp-message').value || '').trim();

    if (!fullName) {
      if (errorDiv) {
        errorDiv.textContent = 'Please enter your full name.';
        errorDiv.classList.remove('hidden');
      }
      return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.75';
    btnText.textContent = 'SAVING RSVP...';
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');

    try {
      var res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName,
          attendance: attendance,
          guestCount: attendance === 'Regretfully Declines' ? 0 : parseInt(guestCount, 10),
          dietary: dietary,
          message: message
        })
      });

      var data = await res.json();
      if (!res.ok || data.error) {
        if (data.duplicate) {
          var nameInput = document.getElementById('rsvp-full-name');
          if (nameInput) {
            nameInput.style.borderColor = '#dc2626';
            nameInput.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.15)';
            nameInput.focus();
          }
        }
        throw new Error(data.error || 'Failed to submit RSVP. Please try again.');
      }

      var confirmedName = document.getElementById('rsvp-confirmed-name');
      if (confirmedName) confirmedName.textContent = fullName;
      var confirmedDetail = document.getElementById('rsvp-confirmed-detail');
      if (confirmedDetail) {
        if (attendance === 'Regretfully Declines') {
          confirmedDetail.textContent = 'Thank you for letting us know! You will be dearly missed, and we feel your warmth and prayers from afar. 🤍';
        } else {
          confirmedDetail.textContent = 'Your response has been saved to our guest list. We look forward to celebrating this special day together on December 8, 2026 at Zaycoland Resort!';
        }
      }
      var modal = document.getElementById('rsvp-success-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Something went wrong. Please check your connection and try again.';
        errorDiv.classList.remove('hidden');
      }
    } finally {
      btn.disabled = false;
      btn.style.opacity = '1';
      btnText.textContent = 'CONFIRM RSVP';
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  };

  window.returnHomeFromRsvp = function() {
    var modal = document.getElementById('rsvp-success-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.resetRsvpForm();
  };

  window.resetRsvpForm = function() {
    var modal = document.getElementById('rsvp-success-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    var form = document.getElementById('wedding-rsvp-form');
    var successCard = document.getElementById('rsvp-success-card');
    if (form) {
      form.reset();
      form.classList.remove('hidden');
    }
    if (successCard) successCard.classList.add('hidden');
    var errorDiv = document.getElementById('rsvp-error-msg');
    if (errorDiv) errorDiv.classList.add('hidden');
    var fullNameInput = document.getElementById('rsvp-full-name');
    if (fullNameInput) {
      fullNameInput.style.borderColor = 'rgba(47, 36, 27, 0.16)';
      fullNameInput.style.boxShadow = 'none';
    }
    var cards = document.querySelectorAll('.rsvp-radio-card');
    if (cards[0]) window.selectAttendance('Joyfully Accepts', cards[0]);
  };

  function insertCustomSections() {
    // 1. Insert Entourage section right before Venue
    if (!document.getElementById('entourage-section')) {
      var venue = document.querySelector('[data-site-section-id="venue"]') || document.getElementById('venue-section');
      if (venue) {
        var target = venue.closest('[data-scroll-section]') || venue;
        if (target && target.parentNode) {
          var div = document.createElement('div');
          div.setAttribute('data-scroll-section', '');
          div.setAttribute('data-scroll-section-kind', 'content');
          div.setAttribute('data-site-section-id', 'entourage');
          div.innerHTML = ${safeEntourageJson};
          target.parentNode.insertBefore(div, target);
        }
      }
    }

    // 2. Insert Bespoke Dress Code section right before FAQ
    if (!document.getElementById('dress-code-section')) {
      var faq = document.querySelector('[data-site-section-id="faq"]') || document.getElementById('faq');
      if (faq) {
        var targetFaq = faq.closest('[data-scroll-section]') || faq;
        if (targetFaq && targetFaq.parentNode) {
          var divDc = document.createElement('div');
          divDc.setAttribute('data-scroll-section', '');
          divDc.setAttribute('data-scroll-section-kind', 'content');
          divDc.setAttribute('data-site-section-id', 'dress-code');
          divDc.innerHTML = ${safeDressCodeJson};
          targetFaq.parentNode.insertBefore(divDc, targetFaq);
        }
      }
    }

    // 5. Ensure Venue Location button exists and points to share.google link
    var venueAddr = document.querySelector('[data-site-section-id="venue"] a[href*="google"], [data-site-section-id="venue"] a[href*="share.google"]');
    if (venueAddr) {
      venueAddr.setAttribute('href', 'https://share.google/hZBElWZSFrunPhIBL');
      if (!document.getElementById('venue-location-btn')) {
        var btnDiv = document.createElement('div');
        btnDiv.id = 'venue-location-btn';
        btnDiv.className = 'mt-6 flex justify-center';
        btnDiv.innerHTML = '<a href="https://share.google/hZBElWZSFrunPhIBL" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-transform hover:scale-105" style="background-color: #8a5a2b; color: #fff9f1; box-shadow: 0 4px 14px rgba(138, 90, 43, 0.28); text-decoration: none;"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg><span>View on Google Maps</span></a>';
        if (venueAddr.parentNode) {
          venueAddr.parentNode.appendChild(btnDiv);
        }
      }
    }

    // 6. Populate or preserve RSVP section form
    var rsvpSec = document.getElementById('rsvp-callout-section');
    if (rsvpSec && !document.getElementById('wedding-rsvp-form')) {
      rsvpSec.innerHTML = ${safeRsvpJson};
      rsvpSec.style.padding = '0';
      rsvpSec.style.opacity = '1';
    }

    // 5. Ensure 'grace' in transition line stays italicized
    document.querySelectorAll('[data-vision-word="true"]').forEach(function(el) {
      if (el.textContent.trim().toLowerCase() === 'grace') {
        el.style.fontStyle = 'italic';
      }
    });

    // 6. Remove any Cordially platform badge elements
    document.querySelectorAll('a[href*="cordially.io"]').forEach(function(el) { el.remove(); });

    // 7. Remove hero divider line
    document.querySelectorAll('[data-testid="hero-divider"]').forEach(function(el) { el.remove(); });

    window.dispatchEvent(new Event('resize'));
  }

  // Smooth scroll click handler for custom sections & RSVP
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href="#dress-code-section"], a[href="#entourage-section"], a[href="#rsvp-callout-section"], a[href="/demo/rsvp"]');
    if (a) {
      var href = a.getAttribute('href');
      var targetId = (href === '/demo/rsvp' || href === '#rsvp-callout-section') ? 'rsvp-callout-section' : href.slice(1);
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // Watchdog execution across all hydration milestones
  insertCustomSections();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertCustomSections);
  }
  window.addEventListener('load', insertCustomSections);

  var pollCount = 0;
  var pollTimer = setInterval(function() {
    pollCount++;
    insertCustomSections();
    if (document.getElementById('entourage-section') && document.getElementById('dress-code-section') && document.getElementById('wedding-rsvp-form')) {
      if (pollCount > 10) clearInterval(pollTimer);
    }
    if (pollCount > 30) clearInterval(pollTimer);
  }, 200);
})();
</script>
</body>`;
          text = text.replace('</body>', clientScript);
        }

        return text;
      }
      return responseBuffer;
    })
  }
}));

export { replaceInfo };
export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Clean Carbon Copy Server running at http://localhost:${PORT}`);
  });
}
