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
├── content/                    # ← EDITABLE CONTENT (JSON), powers the site
│   ├── settings.json           # footer text + contact/social links (site‑wide)
│   ├── home.json               # homepage: hero, sections, cards, gallery, testimonials
│   ├── about.json              # About page copy + images
│   ├── contact.json            # Contact page copy + studio hours
│   └── collections/
│       ├── bowls.json  platters.json  risers.json  stands.json  sets.json
├── admin/                      # the CMS
│   ├── index.html              # loads Decap CMS + Netlify Identity
│   └── config.yml              # CMS configuration (collections & fields)
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

## Client Editing / Admin CMS

The site ships with a no‑code content editor so the client can update text and
images from a browser, with **no access to the code**.

### The admin URL

```
https://YOUR-SITE.netlify.app/admin/
```

(While developing locally it’s `http://localhost:8000/admin/`.)

### One‑time Netlify setup (site owner)

The CMS authenticates through **Netlify Identity** and writes changes through
**Git Gateway**. Both are enabled in the Netlify dashboard — no secrets or
passwords are stored in the code.

1. **Deploy the site to Netlify** (see *Deploying to Netlify* below).
2. In Netlify: **Site configuration → Identity → Enable Identity**.
3. Under **Identity → Registration**, set registration to **Invite only**
   (recommended, so only people you invite can log in).
4. *(Optional but recommended)* Under **Identity → Authentication providers**,
   add **Google/GitHub** for one‑click login, or leave email/password.
5. Enable the gateway: **Identity → Services → Git Gateway → Enable Git
   Gateway**. This lets the CMS commit content to GitHub on the editor’s behalf.
6. Confirm the production branch matches the CMS config: `admin/config.yml`
   has `backend.branch: main`. If your Netlify “Production branch” is not
   `main`, change that value to match and redeploy.

### Inviting the client as an editor

1. In Netlify go to **Identity → Invite users** and enter the client’s email.
2. The client receives an email and clicks **Accept the invite**.
3. The link opens the site with a token; they’re prompted to **set a password**
   and are then redirected to `/admin/` (the homepage carries the Netlify
   Identity widget to handle this hand‑off automatically).
4. From then on they log in at `https://YOUR-SITE.netlify.app/admin/`.

### What the client can edit

From `/admin` the following are organised into friendly forms:

- **Site Settings** — footer description and all contact/social links
  (email, WhatsApp, Instagram, Pinterest). These power the footer icons on
  every page and the Contact page cards.
- **Home Page** — hero title/subtitle/buttons & background, “Shop by
  Collection” cards, Best Sellers, Gallery images, the About/Story block, and
  Testimonials.
- **About Page** — every heading, paragraph, image, the value cards, and CTA.
- **Contact Page** — headings, the WhatsApp/Email/Instagram card copy, and
  studio hours.
- **Shop Collections** — Bowls, Platters, Plate Risers, Cake Stands and
  Customised Sets: the collection heading/description and each product card
  (badge, image, name, description, link).

### Where images live (and the media library)

All photography lives in **`images/`**, and that folder *is* the CMS media
library — so when the client clicks an image field they can **pick from the
existing studio photos** or upload a new one. New uploads are committed to the
same `images/` folder and referenced as `/images/<file>`.

> Prefer to keep client uploads separate from the original photos? Change
> `media_folder`/`public_folder` in `admin/config.yml` to `assets/uploads` —
> just note the media library will then only show what’s in that folder.

### How changes are saved & published

1. The editor clicks **Save / Publish** in `/admin`.
2. Decap CMS commits the change (and any uploaded images) straight to the
   **`main`** branch on GitHub through Git Gateway.
3. Netlify detects the new commit and **automatically rebuilds and redeploys**.
   The update is usually live within a minute.

So every content change is an ordinary Git commit — fully versioned and
revertable in GitHub’s history.

### Testing the CMS locally (optional, for developers)

`admin/config.yml` sets `local_backend: true`, so you can run the editor
against your local git checkout without Netlify:

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
  `content/`, and expose it in `admin/config.yml`. Repeating blocks use a
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
