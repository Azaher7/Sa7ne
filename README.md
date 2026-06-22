# Sa7ne — صَحْني | Handmade Ceramics

A premium, fully responsive marketing site for **Sa7ne (صَحْني)**, a handmade
ceramics studio that personalises tableware. Plain, production‑ready
**static HTML / CSS / vanilla JS** — no framework and no build step — with a
browser‑based **content editor at `/admin`** powered by
[Decap CMS](https://decapcms.org) (the maintained successor to Netlify CMS).

> Design language: warm ivory & butter‑yellow with powder‑blue accents,
> Cormorant Garamond display type, photography‑driven, generous whitespace.

---

## Quick start (local)

It’s a static site, but it must be served over **HTTP** (not opened as a
`file://` URL) so the browser can `fetch()` the JSON content files.

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, `php -S`, nginx, …).

---

## Project structure

```
.
├── index.html                  # Home
├── about.html  contact.html  custom.html  terms.html
├── bowls.html  platters.html  risers.html  stands.html  sets.html   # collections
├── product-*.html              # product detail pages
├── styles.css                  # design system + all styles
├── script.js                   # original interactions (selectors, form feedback)
├── cms.js                      # tiny content‑hydration layer (reads /content JSON)
├── images/                     # all photography + logo (also the CMS media library)
├── content/                    # ← EDITABLE CONTENT (JSON) — the single source of truth
│   ├── settings.json           # footer text + contact/social links (site‑wide)
│   ├── home.json               # homepage: hero, sections, cards, gallery, testimonials
│   ├── about.json              # About page copy + images
│   ├── contact.json            # Contact page copy + studio hours
│   └── collections/
│       ├── bowls.json  platters.json  risers.json  stands.json  sets.json
├── admin/                      # the editors (both read the SAME content/ files)
│   ├── index.html              # /admin  → visual editor (preview + draft + export)
│   ├── editor.js               #          its logic
│   └── cms/                    # /admin/cms → full Decap CMS (publishes to everyone)
│       ├── index.html
│       └── config.yml
├── netlify.toml                # Netlify deploy config (static, no build)
└── README.md
```

### How the content system works

The HTML holds the design **and** a copy of the current text/images as a
fallback. `cms.js` runs on page load, fetches the relevant file(s) from
`content/`, and injects the values into the existing elements through
`data-cms*` attributes — so **editing JSON changes the visible site without
touching markup, styling, or layout**. If JavaScript or a file ever fails to
load, the built‑in fallback content stays on screen.

You normally never edit JSON by hand — that’s what the CMS below is for.

---

## Client editing — two ways to edit

Both editors read and write the **same** `content/*.json` files — the single
source of truth the website itself renders from. Nothing is hard‑coded or
duplicated inside the editors.

| | Visual editor — `/admin/` | Full CMS — `/admin/cms/` |
|---|---|---|
| Loads current content + image previews | ✅ instantly, no login | ✅ after login |
| Works with zero setup | ✅ | ❌ needs Netlify Identity |
| Publishes to the **public** site for everyone | ❌ browser‑only + export | ✅ commits to GitHub |
| Best for | reviewing / preparing edits | a non‑technical client publishing live |

### 1) Visual editor — `https://YOUR-SITE.netlify.app/admin/`

Open it and it immediately loads the **real current content**: every page’s
text and every image (with thumbnail previews), the collection cards, the
gallery, contact details and footer/social links — exactly as they are on the
site today. Edit any field; change an image path and the preview updates live;
add or remove gallery photos, products and testimonials. (Locally:
`http://localhost:8000/admin/`.)

**How saving works — important, because this is a static site with no backend:**

- **Save draft** stores your edits **in this browser only** (localStorage). It
  does **not** change the public website for other visitors.
- **Preview my draft on the site** (toggle, top‑right) — turn it on, then open
  the normal pages in the same browser to see your draft applied (still only in
  your browser).
- **Export this file / Export all** downloads the updated `.json` file(s). To
  make changes live for everyone, commit those files to the repo (or send them
  to your developer) — or make the edit in the full CMS below, which does it for
  you.

### 2) Full CMS (publishes live) — `https://YOUR-SITE.netlify.app/admin/cms/`

This is **Decap CMS**. When the client saves here it **commits straight to
GitHub** and Netlify redeploys, so the change goes live for everyone with no
developer involved. It needs a one‑time Netlify setup.

#### One‑time Netlify setup (site owner)

Auth is via **Netlify Identity** + **Git Gateway** — no secrets are stored in
the code.

1. **Deploy to Netlify** (see *Deploying to Netlify* below).
2. **Site configuration → Identity → Enable Identity**.
3. **Identity → Registration → Invite only** (recommended).
4. *(Optional)* **Identity → Authentication providers** — add Google/GitHub, or
   keep email/password.
5. **Identity → Services → Git Gateway → Enable Git Gateway**.
6. Make sure `admin/cms/config.yml` has `backend.branch: <your production
   branch>` (currently `main`). If Netlify deploys a different branch, change
   this to match and redeploy.

#### Inviting the client

1. **Identity → Invite users** → enter the client’s email.
2. They click **Accept the invite**, set a password, and are sent to
   `/admin/cms/` (the homepage carries the Identity widget to complete this).
3. From then on they log in at `…/admin/cms/`.

#### What can be edited (both editors)

- **Site Settings** — footer description and all contact/social links (email,
  WhatsApp, Instagram, Pinterest). These power the footer icons site‑wide and
  the Contact page cards.
- **Home Page** — hero title/subtitle/buttons & background, “Shop by Collection”
  cards, Best Sellers, Gallery images, the About/Story block, and Testimonials.
- **About Page** — every heading, paragraph, image, the value cards, and CTA.
- **Contact Page** — headings, the WhatsApp/Email/Instagram card copy, and hours.
- **Shop Collections** — Bowls, Platters, Plate Risers, Cake Stands and
  Customised Sets: the heading/description and each product card.

#### Images & the media library

All photography lives in **`images/`**, and (in the full CMS) that folder *is*
the media library, so the client can pick an existing studio photo or upload a
new one. Uploads are committed to `images/` and referenced as `/images/<file>`.
In the visual editor, image fields are path‑based with a live preview (to add a
brand‑new photo there, drop the file in `images/` and reference its path).

> Prefer client uploads in a separate folder? Change `media_folder` /
> `public_folder` in `admin/cms/config.yml` to `assets/uploads` (the media
> library will then only show that folder).

#### How a full‑CMS change publishes

1. The client clicks **Publish** in `/admin/cms/`.
2. Decap commits the change (and any uploads) to **`main`** via Git Gateway.
3. Netlify redeploys automatically — live within ~a minute.

Every change is an ordinary Git commit — fully versioned and revertable.

### Testing the CMS locally (optional, for developers)

`admin/cms/config.yml` sets `local_backend: true`, so you can run the full CMS
against your local git checkout without Netlify:

```bash
npx decap-server          # terminal 1 — runs the local git proxy on :8081
python3 -m http.server 8000   # terminal 2 — serves the site
# open http://localhost:8000/admin/cms/  (it connects to the local proxy)
```

---

## Deploying to Netlify

This repo is ready to connect directly from GitHub.

1. In Netlify: **Add new site → Import an existing project → GitHub**, and pick
   this repository.
2. Build settings (Netlify reads these from `netlify.toml`, shown here for
   reference):
   - **Build command:** *(empty — no build)*
   - **Publish directory:** `.` (the repository root)
3. Click **Deploy**. When it’s live, follow *One‑time Netlify setup* above to
   turn on Identity + Git Gateway and invite the client.

> Already hosting elsewhere? It’s a static folder, so any static host works —
> but the `/admin` CMS specifically relies on Netlify Identity + Git Gateway.

---

## Customisation notes (developers)

- **Colours, type, spacing** are CSS custom properties at the top of
  `styles.css` (`:root`).
- To make a **new** piece of text/image editable: add a `data-cms="file.key"`
  (text), `data-cms-src` / `data-cms-alt` (images) or `data-cms-href` (links)
  attribute to the element, add the matching key to the JSON file under
  `content/`, and expose it in `admin/cms/config.yml` (the visual editor at
  `/admin/` picks up new fields automatically). Repeating blocks use a
  container with `data-cms-list="file.arrayKey"` and one template child whose
  inner elements carry `data-field="…"`. See the comments at the top of
  `cms.js`.
- The contact and custom‑order **forms are front‑end only** (they show a
  success state but don’t post anywhere). To make them live, wire them to a
  provider such as Netlify Forms, Formspree, or Basin.

## Credits

- Photography & logo: © Sa7ne (client‑provided).
- Type: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) (Google Fonts).
- CMS: [Decap CMS](https://decapcms.org).
