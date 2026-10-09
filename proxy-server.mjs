import express from 'express';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVER_PATH = path.join(__dirname, 'cover.webp');
const FOOTER_PATH = path.join(__dirname, 'footer.webp');
const VENUE_PATH = path.join(__dirname, 'venue.webp');
const STORY_DIR = path.join(__dirname, 'story');
const COLLAGE_DIR = path.join(__dirname, 'collage');

const app = express();
const PORT = 3333;

// When opening root, route directly to the /demo page
app.get('/', (req, res) => {
  res.redirect('/demo');
});

// Helper to serve local images with fallback for serverless environment
const serveFile = (filePath, res) => {
  if (!fs.existsSync(filePath)) {
    const base = path.basename(filePath);
    const candidate1 = path.join(process.cwd(), base);
    const candidate2 = path.join(process.cwd(), 'public', base);
    if (fs.existsSync(candidate1)) filePath = candidate1;
    else if (fs.existsSync(candidate2)) filePath = candidate2;
    else return res.status(404).send('Not found');
  }
  res.setHeader('Content-Type', 'image/webp');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  fs.createReadStream(filePath).pipe(res);
};

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
const ch1BodyNew = `What began with a simple introduction slowly became conversations, shared moments, unexpected trips, and a friendship that grew with intention.

Looking back, what felt ordinary was God quietly weaving our stories together.`;
const ch1BodyJson = ch1BodyNew.split('\n').join('\\\\n');

const ch2TitleOld = 'chapter two: falling in love';
const ch2TitleNew = 'Chapter 2: “When it became intentional”';
const ch2BodyOld = 'Toronto became our home base for late dinners, weekend walks, shared routines, and all of the small moments that made life feel bigger.';
const ch2BodyNew = `Somewhere along the way, the casual conversations became intentional ones. Friendship grew, intentions were made clear, and the decision to pursue one another unfolded, not rushed, but with prayer, purpose, and grace.

Looking back, we see how God was quietly leading us, one step at a time.`;
const ch2BodyJson = ch2BodyNew.split('\n').join('\\\\n');

const ch3TitleOld = 'chapter three: the next step';
const ch3TitleNew = 'Chapter 3: “When we said yes to a lifetime”';
const ch3BodyOld = 'A trip, a question, a very easy yes, and suddenly the future we had been imagining became something we could invite everyone into.';
const ch3BodyNew = `After all the little moments, unexpected turns, and intentional steps came the question and a resounding yes. Not because we know everything the future holds, but because we trust the God who brought us this far. And now, by His grace, we say yes, not just to each other, but to a lifetime of choosing, growing, serving, and walking with God together.`;
const ch3BodyJson = ch3BodyNew.split('\n').join('\\\\n');

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
const newTransitionSpans = '<span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">two</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">separate</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">stories</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">woven</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">by</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">grace</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">into</span> <span data-vision-word="true" style="opacity:0.4;transition:opacity 0.3s ease-out">one...</span>';
const oldTransitionText = "you're cordially invited to celebrate the story of...";
const newTransitionText = "two separate stories woven by grace into one...";

// Dress Code configuration
const oldLadiesBody = 'Tea or floor-length dresses are welcome. Bright colors and florals are encouraged.\\\\n\\\\nWear comfortable shoes for wandering and dancing.';
const newLadiesBody = 'Long dresses, midi dresses, elegant jumpsuits, or formal garden attire in shades of Mocha.\\\\n\\\\nKindly avoid neon colors, very bright red, orange, yellow, overly loud prints, jeans, and casual footwear.';

const oldGentlemenSection = '{\\"id\\":\\"gentlemen\\",\\"title\\":\\"For the Gentlemen\\",\\"subtitle\\":\\"Classic with a summer touch\\",\\"body\\":\\"Dress shirts and suits are perfect. Linen and lighter colors are encouraged.\\\\n\\\\nKeep things polished but breathable for a warm summer evening.\\",\\"isVisible\\":true}';
const newGentlemenAndEntourageSection = '{\\"id\\":\\"gentlemen\\",\\"title\\":\\"For the Gentlemen (Guests)\\",\\"subtitle\\":\\"Formal Suits & Polo\\",\\"body\\":\\"Suits or long-sleeved polo paired with trousers.\\\\n\\\\nKindly avoid jeans, shorts, and casual footwear.\\",\\"isVisible\\":true},{\\"id\\":\\"entourage\\",\\"title\\":\\"For the Entourage\\",\\"subtitle\\":\\"Curated Color & Attire Guide\\",\\"body\\":\\"• Principal Sponsors: Gray taupe long dress (Female) / Formal barong, black pants & black shoes (Male)\\\\n\\\\n• Secondary Sponsors: Champagne long dress (Female) / Formal barong, black pants & black shoes (Male)\\\\n\\\\n• Bridesmaids: Sage green long dress (tulle, mismatched styles)\\\\n\\\\n• Groomsmen & Bearers: Formal barong, black pants, black shoes\\\\n\\\\n• Flower Girls: Sage green floral midi dress\\",\\"isVisible\\":true}';

// Clean token replacements for information only
const replacements = [
  // Names & Monogram
  ['Jim \\\\u0026 Pam', 'Jed \\\\u0026 Vange'],
  ['Jim \\u0026 Pam', 'Jed \\u0026 Vange'],
  ['Jim &amp; Pam', 'Jed &amp; Vange'],
  ['Jim & Pam', 'Jed & Vange'],
  ['Jim and Pam', 'Jed and Vange'],
  ['Jim or Pam', 'Jed or Vange'],
  ['J&amp;P', 'J&amp;V'],
  ['J\\\\u0026P', 'J\\\\u0026V'],
  ['J\\u0026P', 'J\\u0026V'],
  ['J&P', 'J&V'],
  ['Demo Wedding Website | Cordially', 'Jed & Vange — Wedding Website'],

  // Date
  ['june 18, 2027', 'december 8, 2026'],
  ['June 18, 2027', 'December 8, 2026'],
  ['2027-06-18', '2026-12-08'],

  // RSVP deadline
  ['august 20, 2027', 'october 30, 2026'],
  ['August 20, 2027', 'October 30, 2026'],

  // Venue
  ['Cecil Green Park House', 'Zaycoland Resort and Hotel'],
  ['6251 Cecil Green Park Rd, Vancouver, BC', 'Kabankalan City, Negros Occidental'],
  ['https://maps.google.com/?q=6251+Cecil+Green+Park+Rd+Vancouver+BC', 'https://maps.google.com/?q=Zaycoland+Resort+and+Hotel+Kabankalan+City+Negros+Occidental'],

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

  // Remove Cordially platform branding badge
  ['Created on Cordially.io', ''],
  ['Created on Cordially', ''],

  // Preserve line breaks cleanly in footer quote and story captions & hide old details container & anchor offsets & remove badge
  ['</head>', '<style>[data-testid="footer-quote"], [data-story-caption-group] p, [data-testid="mobile-story-caption-body"] { white-space: pre-line !important; line-height: 1.35 !important; } [data-site-section-id="details"], a[href*="cordially.io"] { display: none !important; } #dress-code-section, #entourage-section { scroll-margin-top: 80px; }</style></head>']
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
      try {
        proxyReq.removeHeader('x-forwarded-host');
        proxyReq.removeHeader('x-vercel-id');
      } catch (e) {}
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
          const entouragePath = fs.existsSync(path.join(__dirname, 'entourage-section.html'))
            ? path.join(__dirname, 'entourage-section.html')
            : path.join(process.cwd(), 'entourage-section.html');
          const entourageHtml = fs.existsSync(entouragePath) ? fs.readFileSync(entouragePath, 'utf8') : '';

          const dressCodePath = fs.existsSync(path.join(__dirname, 'dress-code-section.html'))
            ? path.join(__dirname, 'dress-code-section.html')
            : path.join(process.cwd(), 'dress-code-section.html');
          const dressCodeHtml = fs.existsSync(dressCodePath) ? fs.readFileSync(dressCodePath, 'utf8') : '';

          // 1. Server-side initial render injection
          const entourageWrapper = `<div data-scroll-section="" data-scroll-section-kind="content" data-site-section-id="entourage">${entourageHtml}</div>`;
          const dressCodeWrapper = `<div data-scroll-section="" data-scroll-section-kind="content" data-site-section-id="dress-code">${dressCodeHtml}</div>`;

          if (text.includes('data-design-anchor="venue"')) {
            text = text.replace('<div data-design-anchor="venue"', entourageWrapper + '<div data-design-anchor="venue"');
          }
          if (text.includes('data-design-anchor="faq"')) {
            text = text.replace('<div data-design-anchor="faq"', dressCodeWrapper + '<div data-design-anchor="faq"');
          }

          // 2. Client-side hydration watchdog and interactive controller
          const safeEntourageJson = JSON.stringify(entourageHtml).replace(/<\/script/gi, '<\\/script');
          const safeDressCodeJson = JSON.stringify(dressCodeHtml).replace(/<\/script/gi, '<\\/script');

          const clientScript = `
<script>
(function() {
  window.filterDressCode = function(category, btn) {
    var buttons = document.querySelectorAll('.dc-filter-btn');
    buttons.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var cards = document.querySelectorAll('#dc-grid .dc-card-item');
    cards.forEach(function(card) {
      var cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category) {
        card.classList.remove('dc-hidden');
      } else {
        card.classList.add('dc-hidden');
      }
    });

    window.dispatchEvent(new Event('resize'));
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

    // 3. Remove any Cordially platform badge elements
    document.querySelectorAll('a[href*="cordially.io"]').forEach(function(el) { el.remove(); });

    window.dispatchEvent(new Event('resize'));
  }

  // Smooth scroll click handler for custom sections
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href="#dress-code-section"], a[href="#entourage-section"]');
    if (a) {
      var targetId = a.getAttribute('href').slice(1);
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
    if (document.getElementById('entourage-section') && document.getElementById('dress-code-section')) {
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

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Clean Carbon Copy Server running at http://localhost:${PORT}`);
  });
}
