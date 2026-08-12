# digitalmarketing.ai

A free, open-source, practical digital marketing reference — built like a docs site (MDN-inspired layout), covering **SEO, SEM/PPC, content marketing, social media, email & automation, analytics, e-commerce/affiliate, and tools/AI**, with **80+ interview Q&As** and **10 hands-on projects**.

No framework, no build tooling required to run it — it's plain HTML, CSS, and JavaScript, generated from simple content fragments by a small Node script.

**[Live demo](https://joestechs.github.io/digitalmarketing.ai/)** *(enable GitHub Pages — see Deploying below)*

## Project structure

```
.
├── index.html, css/, js/          ← the built, deployable static site (what GitHub Pages serves)
├── pages/<category>/<slug>.html   ← every generated topic page
├── interview-questions/index.html
├── projects/index.html
├── glossary/index.html
├── build/                         ← SOURCE OF TRUTH — edit here, not in /pages
│   ├── nav.json                   ← sidebar structure, page titles, categories, ordering
│   ├── layout.html                ← shared shell (topbar, sidebar, footer) with {{PLACEHOLDERS}}
│   ├── content/<slug>.html        ← the actual content fragment for each page
│   └── build.js                   ← assembles nav.json + layout.html + content/*.html → the static pages above
└── .github/workflows/deploy.yml   ← GitHub Actions → GitHub Pages
```

## Adding or editing a page

1. Write your content as an HTML fragment in `build/content/<your-slug>.html` (see any existing file for the pattern: `page-eyebrow`, `h1`/`h2`, `callout` boxes, `code-block`s, tables, and an "Interview Corner" callout at the end).
2. Add an entry for it to the right group in `build/nav.json` (`{ "slug": "your-slug", "title": "Your Title" }`).
3. Run the build:
   ```bash
   npm run build
   ```
   This regenerates every page (sidebar, breadcrumbs, prev/next links, and search index all rebuild automatically) into the matching `pages/<category>/` path.
4. Commit both `build/` (source) and the regenerated output (`pages/`, `index.html`, etc.) — the deploy workflow serves the pre-built output directly, with no build step in CI.

## Design system

Colors, type, and spacing are all CSS custom properties in `css/style.css`. Each content category has a signature accent color (SEO = green, PPC = magenta, Social = blue, Email = amber, Analytics = purple, Content = coral) used consistently across sidebar dots, page eyebrows, and callouts — mirroring how a real campaign dashboard color-codes traffic sources.

## Deploying to GitHub Pages

1. Push this repo to `main`.
2. In the repo settings → **Pages**, set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) deploys automatically on every push to `main`.

## Contributing

New topic pages, corrected facts, additional interview questions, and new practical projects are all welcome — open a PR. Please keep new pages consistent with the existing structure (see step-by-step above) so the sidebar/build script picks them up automatically.

## License

MIT — see [LICENSE](./LICENSE).
