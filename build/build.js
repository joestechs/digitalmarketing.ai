#!/usr/bin/env node
/* Static site builder for digitalmarketing.ai
 * Reads build/nav.json + build/content/<slug>.html fragments,
 * wraps them in build/layout.html, writes finished pages to /site.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = __dirname;
const SITE = path.join(ROOT, "site");
const CONTENT_DIR = path.join(BUILD, "content");

const nav = JSON.parse(fs.readFileSync(path.join(BUILD, "nav.json"), "utf8"));
const layoutTpl = fs.readFileSync(path.join(BUILD, "layout.html"), "utf8");

// Flatten pages in document order, resolving output path + depth
const flat = [];
nav.groups.forEach((group) => {
  group.pages.forEach((page) => {
    const outPath = page.path || `pages/${group.id}/${page.slug}.html`;
    const depth = outPath.split("/").length - 1; // dirs below /site
    flat.push({ ...page, group, outPath, depth });
  });
});

function rootPrefix(depth) {
  return depth <= 0 ? "./" : "../".repeat(depth);
}

function buildSidebar(activeOutPath) {
  return nav.groups
    .map((group) => {
      const items = group.pages
        .map((page) => {
          const outPath = page.path || `pages/${group.id}/${page.slug}.html`;
          const depth = (activeOutPath.match(/\//g) || []).length;
          const href = rootPrefix(depth) + outPath;
          const isActive = outPath === activeOutPath ? " is-active" : "";
          return `<li><a href="${href}" class="${isActive.trim()}">${page.title}</a></li>`;
        })
        .join("\n");
      return `<div class="side-group">
        <button class="side-group__title" type="button">
          <span class="side-group__dot" style="background:${group.color}"></span>
          <span>${group.title}</span>
          <span class="side-group__count">${group.pages.length}</span>
          <svg class="side-group__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <ul class="side-group__list">${items}</ul>
      </div>`;
    })
    .join("\n");
}

function buildBreadcrumb(page, depth) {
  const rp = rootPrefix(depth);
  return `<a href="${rp}index.html">Home</a> <span>/</span> <span>${page.group.title}</span> <span>/</span> <span>${page.title}</span>`;
}

function buildPageNav(index) {
  const prev = flat[index - 1];
  const next = flat[index + 1];
  const depth = flat[index].depth;
  const rp = rootPrefix(depth);
  let html = '<div class="page-nav">';
  html += prev
    ? `<a href="${rp}${prev.outPath}"><span class="page-nav__label">&larr; Previous</span>${prev.title}</a>`
    : "<span></span>";
  html += next
    ? `<a href="${rp}${next.outPath}" class="page-nav__next"><span class="page-nav__label">Next &rarr;</span>${next.title}</a>`
    : "<span></span>";
  html += "</div>";
  return html;
}

function buildSearchIndex() {
  const items = flat.map((p) => ({
    title: p.title,
    category: p.group.title,
    url: p.outPath, // resolved relative to root at runtime via absolute path fix below
  }));
  return JSON.stringify(items);
}

const SEARCH_INDEX = buildSearchIndex();

function render(vars) {
  let html = layoutTpl;
  Object.keys(vars).forEach((key) => {
    html = html.split(`{{${key}}}`).join(vars[key]);
  });
  return html;
}

// Ensure clean site dir for generated pages (keep css/js/assets which were authored directly)
fs.mkdirSync(path.join(SITE, "pages"), { recursive: true });

flat.forEach((page, index) => {
  const contentPath = path.join(CONTENT_DIR, `${page.slug}.html`);
  if (!fs.existsSync(contentPath)) {
    console.warn(`  [skip] missing content for ${page.slug}`);
    return;
  }
  const body = fs.readFileSync(contentPath, "utf8");
  const outFull = path.join(SITE, page.outPath);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  const depth = page.depth;
  const rp = rootPrefix(depth);

  // For search index, make URLs root-relative to site root using a marker the
  // client resolves against the <base>. Simplify: store path from site root
  // and prefix with rp at runtime isn't possible statically per page since
  // index differs; instead bake an absolute-from-root URL using rp of THIS page.
  const localIndex = JSON.stringify(
    flat.map((p) => ({ title: p.title, category: p.group.title, url: rp + p.outPath }))
  );

  const html = render({
    TITLE: `${page.title} — digitalmarketing.ai`,
    DESC: `${page.title}: a practical, in-depth digital marketing tutorial with code, tools and interview Q&A.`,
    ROOT: rp,
    BODY: body,
    SIDEBAR: buildSidebar(page.outPath),
    BREADCRUMB: buildBreadcrumb(page, depth),
    PAGE_NAV: buildPageNav(index),
    SEARCH_INDEX: localIndex,
    ACTIVE_GROUP: page.group.id,
  });
  fs.writeFileSync(outFull, html);
  console.log(`  built ${page.outPath}`);
});

// Build home page separately (custom body, not part of flat content pages)
const homeBody = fs.readFileSync(path.join(CONTENT_DIR, "_home.html"), "utf8");
const homeIndex = JSON.stringify(flat.map((p) => ({ title: p.title, category: p.group.title, url: p.outPath })));
const homeHtml = render({
  TITLE: "digitalmarketing.ai — Practical Digital Marketing, Learned by Doing",
  DESC: "A free, open-source, practical digital marketing tutorial site: SEO, PPC, content, social, email, analytics, tools, projects and 80+ interview questions.",
  ROOT: "./",
  BODY: homeBody,
  SIDEBAR: buildSidebar("__home__"),
  BREADCRUMB: `<span>Home</span>`,
  PAGE_NAV: "",
  SEARCH_INDEX: homeIndex,
  ACTIVE_GROUP: "",
});
fs.writeFileSync(path.join(SITE, "index.html"), homeHtml);
console.log("  built index.html");

console.log(`\nDone. ${flat.length} content pages + home built.`);
