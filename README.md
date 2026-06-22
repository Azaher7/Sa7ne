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
├── admin/                      # the CMS (reads/writes the SAME content/ files)
│   ├── index.html              # /admin  → Decap CMS (login + Publish to GitHub)
│   ├── config.yml              # CMS collections, fields & media config
│   └── local-editor/           # /admin/local-editor → optional offline preview tool
│       ├── index.html
│       └── editor.js
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

## Client editing — the CMS at `/admin`

The website renders from the JSON files in `content/` (the single source of
truth). **The CMS edits those same files**, so when the client saves, the live
site changes. Content is never hard‑coded into the admin.

### The real CMS — `https://YOUR-SITE.netlify.app/admin/`

`/admin` is **Decap CMS** (a Git‑based CMS). The client **logs in** (Netlify
Identity), edits text and images in friendly forms with image previews, and
clicks **Publish** — which **commits the change to GitHub**, and Netlify rebuilds
and redeploys the site. No code, no developer, no browser‑only drafts.

#### One‑time Netlify setup (site owner)

Auth is via **Netlify Identity** + **Git Gateway** — no secrets are stored in
the code.

1. **Deploy to Netlify** (see *Deploying to Netlify* below).
2. **Site configuration → Identity → Enable Identity**.
3. **Identity → Registration → Invite only** (recommended).
4. *(Optional)* **Identity → Authentication providers** — add Google/GitHub, or
   keep email/password.
5. **Identity → Services → Git Gateway → Enable Git Gateway**. This is what lets
   the CMS commit to GitHub on the editor’s behalf.
6. Make sure `admin/config.yml` has `backend.branch: <your production branch>`
   (currently `main`). If Netlify deploys a different branch, change it to match
   and redeploy.

> No Git Gateway? You can instead use the GitHub backend with OAuth — set
> `backend: { name: github, repo: Azaher7/Sa7ne, branch: main }` in
> `admin/config.yml` and add a GitHub OAuth app (or a hosted service like
> DecapBridge). Git Gateway above is the fastest path and needs no OAuth app.

#### Inviting the client as an editor

1. **Identity → Invite users** → enter the client’s email.
2. They click **Accept the invite**, set a password, and are sent to `/admin/`
   (the homepage carries the Identity widget to complete this hand‑off).
3. From then on they log in at `https://YOUR-SITE.netlify.app/admin/`.

#### What the client can edit

- **Site Settings** — logo alt text, footer description, and all contact/social
  links (email, WhatsApp, Instagram, Pinterest). These power the footer icons
  site‑wide and the Contact page cards.
- **Home Page** — hero title/subtitle/buttons & background image, “Shop by
  Collection” cards, Best Sellers, Gallery images, the About/Story block, and
  Testimonials.
- **About Page** — every heading, paragraph, image (with alt text), value cards, CTA.
- **Contact Page** — headings, the WhatsApp/Email/Instagram card copy, and hours.
- **Shop Collections** — Bowls, Platters, Plate Risers, Cake Stands and
  Customised Sets: the collection title/description and each product card
  (badge, image, alt text, name, description, link).

#### Image uploads & previews

The media library points at **`images/`**, so the client sees **all existing
studio photos** and can either **pick one** or **upload a new one** directly in
any image field (with a live preview). Uploads are committed to `images/` and
referenced as `/images/<file>`.

> Prefer uploads in a separate folder (e.g. `public/uploads`)? Change
> `media_folder` / `public_folder` in `admin/config.yml`. Note that the media
> library then only shows that folder, so the existing photos in `images/`
> would no longer appear for one‑click replacement — which is why `images/` is
> the default here.

#### How a save publishes (end to end)

1. The client clicks **Publish** in `/admin/`.
2. Decap commits the change (and any uploaded images) to **`main`** through Git
   Gateway — an ordinary, versioned Git commit.
3. Netlify detects the commit and **rebuilds + redeploys** automatically — the
   update is live within ~a minute.

### Optional: offline preview tool — `/admin/local-editor/`

A no‑login helper that loads the same `content/` files for **previewing and
drafting** ideas. It saves **to your browser only and does not publish** — use
`/admin/` to publish for everyone. It can also Export JSON to hand to a
developer. Purely optional; safe to ignore or delete.

### Testing the CMS locally (optional, for developers)

`admin/config.yml` sets `local_backend: true`, so you can run the CMS against
your local git checkout without Netlify:

```bash
npx decap-server          # terminal 1 — runs the local git proxy on :8081
python3 -m http.server 8000   # terminal 2 — serves the site
# open http://localhost:8000/admin/  (it connects to the local proxy)
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
  `content/`, and expose it in `admin/config.yml` (the offline preview tool at
  `/admin/local-editor/` picks up new fields automatically). Repeating blocks use a
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
