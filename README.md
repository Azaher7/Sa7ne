# Sa7ne — Handmade Ceramics

A premium, fully responsive marketing site for **Sa7ne (صحني)**, a small-batch
handmade ceramics studio. Built as a single, production-ready static page with
semantic HTML5, modern CSS, and vanilla JavaScript — no build step, no
dependencies, no external CDNs.

> Design language: clean luxury, modern minimalism, photography-driven, generous
> whitespace, with soft **butter-yellow** and **sky-blue** accents drawn directly
> from the brand logo.

---

## Quick start

It's a static site — just serve the folder (or open over a local server so the
self-hosted fonts load with the right CORS headers):

```bash
# any static server works, e.g.
python3 -m http.server 8000
# then visit http://localhost:8000
```

To deploy, upload the whole folder to any static host (Netlify, Vercel, GitHub
Pages, S3, nginx, etc.). No configuration required.

---

## Project structure

```
.
├── index.html                 # The whole page (semantic sections)
├── assets/
│   ├── css/styles.css         # Design system + all styles (self-hosted @font-face at top)
│   ├── js/main.js             # Nav, mobile menu, scroll-reveal, scroll-spy, lightbox, form
│   ├── fonts/                 # Self-hosted Fraunces + Jost (woff2, SIL OFL)
│   └── img/
│       ├── brand/             # Logo (PNG, cream variant, SVG favicon)
│       ├── hero-*.{webp,jpg}  # Hero (homepage.jpg)
│       ├── piece-*            # Featured collection
│       ├── story-*            # About / craftsmanship
│       └── gallery-*          # Gallery
└── README.md
```

Every photo is exported at **4 widths (400/600/800/1200)** in both **WebP and
JPEG**, wired up with `<picture>`, `srcset`/`sizes`, lazy-loading, and explicit
`width`/`height` to avoid layout shift.

---

## Sections

Header (sticky) · Hero · About · Featured Collection · Process · Gallery
(with lightbox) · Testimonials · Contact (validated form) · Footer.

---

## Image curation

The client ZIP contained **41 photographs + 1 logo**. Photos were reviewed for
composition, lighting, sharpness, and brand fit; duplicates and near-duplicates
(including macOS "` 2`" copies) were grouped and only the strongest kept.

- **Used (17):** 1 hero, 6 featured pieces, 2 about/craft, 8 gallery.
- **Excluded (24):** near-duplicate copies, plastic-wrapped/cluttered shots, an
  over-saturated still life, and weaker/redundant angles.
- `homepage.jpg` is used as the hero per the client's request.

Re-running the optimisation (if originals change) only needs Python + Pillow; the
selection map lives in the commit history under the asset-processing script.

---

## Brand & customisation

Colours, type, spacing, and radii are CSS custom properties at the top of
`assets/css/styles.css` (`:root`). The most useful knobs:

| Token | Value | Meaning |
|-------|-------|---------|
| `--butter-300` | `#F1DC8E` | Butter-yellow accent (from logo `#F8F298`) |
| `--sky-500` / `--sky-ink` | `#8FB6CC` / `#3F6075` | Sky-blue accent / readable blue text |
| `--cream-50` / `--cream-100` | `#FBF8F2` / `#F6F1E7` | Page & alternating section backgrounds |
| `--ink` / `--ink-700` | `#2A2723` / `#4A453D` | Headings / body text |
| `--font-display` / `--font-sans` | Fraunces / Jost | Type pairing |

Text content (copy, product names, testimonials, contact details) is plain HTML
in `index.html` — search for the section and edit in place.

### Contact form
The form is fully validated client-side and shows a success state, but does **not**
post anywhere yet (static site). To make it live, point the `<form>` at your
provider (Formspree, Basin, Netlify Forms, or your own endpoint) and remove the
`e.preventDefault()` success shim in `assets/js/main.js`.

---

## Accessibility & performance

- Semantic landmarks, skip link, keyboard-accessible menu & lightbox (focus trap,
  `Esc`/arrow keys), visible focus styles, `aria` labels, AA-contrast palette.
- `prefers-reduced-motion` disables animation; reveal animations are
  progressive-enhancement only (content is fully visible without JavaScript).
- Responsive `<picture>` with WebP, lazy-loading, preloaded hero + critical fonts,
  no layout shift, no external requests.

---

## Credits

- Photography & logo: © Sa7ne (client-provided).
- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) and
  [Jost](https://fonts.google.com/specimen/Jost), self-hosted under the
  SIL Open Font License.
