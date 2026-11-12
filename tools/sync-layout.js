#!/usr/bin/env node
/*
 * sync-layout.js — keeps the shared parts of every page identical.
 *
 *   node tools/sync-layout.js
 *
 * For every page in PAGES it rewrites:
 *   <header class="site-header">…</header>     main menu (with the Curriculum & Pedagogy dropdown)
 *   <footer class="site-footer">…</footer>     Statement of Originality + footer links
 *   <nav class="cp-subnav">…</nav>             A–E tabs on Curriculum & Pedagogy subpages
 *   <nav class="cp-pager">…</nav>              previous / next links on those subpages
 *   style.css?v= / main.js?v=                  cache-busting version (bumped every run)
 * then converts any non-ASCII character to an HTML entity and checks that
 * every local link points to a file that exists.
 *
 * To add a page: create the .html file (copy an existing one), add it to PAGES
 * (and to SUBPAGES if it belongs under Curriculum & Pedagogy), run this script.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const SUBPAGES = [
  { key: "A", file: "pedagogical-documentation.html", label: "Pedagogical Documentation" },
  { key: "B", file: "learning-story.html", label: "Learning Story" },
  { key: "C", file: "inclusive-plans.html", label: "Detailed Responsive Inclusive Plans" },
  { key: "D", file: "meaningful-artifacts.html", label: "Meaningful Artifacts" },
  { key: "E", file: "resources-in-practice.html", label: "Resources Used in Practice" },
];

const PAGES = [
  { file: "index.html", nav: "home" },
  { file: "cover-letter.html", nav: "cover" },
  { file: "philosophy.html", nav: "philosophy" },
  { file: "curriculum-pedagogy.html", nav: "cp" },
  ...SUBPAGES.map((s) => ({ file: s.file, nav: "cp", sub: s.key })),
  { file: "continuous-learning.html", nav: "cpl" },
  { file: "references.html", nav: "refs" },
];

const TOP = [
  { nav: "home", file: "index.html", label: "Home" },
  { nav: "cover", file: "cover-letter.html", label: "Cover Letter &amp; Resume" },
  { nav: "philosophy", file: "philosophy.html", label: "Philosophy of Teaching &amp; Learning" },
  { nav: "cp", file: "curriculum-pedagogy.html", label: "Curriculum &amp; Pedagogy", dropdown: true },
  { nav: "cpl", file: "continuous-learning.html", label: "Continuous Professional Learning" },
  { nav: "refs", file: "references.html", label: "References" },
];

const EMAIL = "itskeerthi2000@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/keerthika-mohanmoorthy";

function header(page) {
  const items = TOP.map((t) => {
    const here = page.nav === t.nav && !page.sub;
    const inSection = page.nav === t.nav;
    if (!t.dropdown) return `        <a href="${t.file}"${here ? ' aria-current="page"' : ""}>${t.label}</a>`;
    const subs = SUBPAGES.map(
      (s) => `            <a href="${s.file}"${page.sub === s.key ? ' aria-current="page"' : ""}><span class="dd-letter">${s.key}</span> ${s.label}</a>`
    ).join("\n");
    return `        <div class="nav-dd">
          <a href="${t.file}" class="dd-toggle${inSection ? " is-active" : ""}"${here ? ' aria-current="page"' : ""} aria-haspopup="true">${t.label} <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a>
          <div class="dd-menu">
            <a href="${t.file}"${here ? ' aria-current="page"' : ""}><span class="dd-letter"><i class="fa-solid fa-table-cells-large"></i></span> Overview</a>
${subs}
          </div>
        </div>`;
  }).join("\n");
  return `<header class="site-header">
    <div class="container">
      <a class="brand" href="index.html" aria-label="Keerthika Mohanmoorthy, home">
        <span class="brand-mark">KM</span>
        <span class="brand-text">
          <span class="brand-name">Keerthika Mohanmoorthy</span>
          <span class="brand-role">Early Childhood Educator</span>
        </span>
      </a>
      <button class="nav-toggle" aria-controls="site-nav" aria-expanded="false" aria-label="Toggle navigation"><i class="fa-solid fa-bars"></i></button>
      <nav id="site-nav" class="nav" aria-label="Main">
${items}
      </nav>
    </div>
  </header>`;
}

function footer() {
  const links = TOP.map((t) => `            <li><a href="${t.file}">${t.label}</a></li>`).join("\n");
  return `<footer class="site-footer">
    <div class="container">
      <div class="originality" role="note" aria-labelledby="originality-title">
        <span class="orig-icon" aria-hidden="true">&#128395;&#65039;</span>
        <div>
          <h4 id="originality-title">Statement of Originality &amp; Authenticity</h4>
          <p>I, Keerthika Mohanmoorthy, declare that the work presented in this portfolio is my own original and authentic work. Work completed with classmates is identified as group work, and my individual contributions are shown. All ideas, words and images from other sources are acknowledged in APA format on the <a href="references.html">References</a> page. Children and families featured in any documentation are kept anonymous to protect their confidentiality.</p>
        </div>
      </div>
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html">
            <span class="brand-mark">KM</span>
            <span class="brand-text"><span class="brand-name">Keerthika Mohanmoorthy</span><span class="brand-role">Early Childhood Educator</span></span>
          </a>
          <p>Digital Showcase Portfolio, Early Childhood Education, Humber College. Toronto, Ontario.</p>
        </div>
        <div>
          <h4>Portfolio</h4>
          <ul>
${links}
          </ul>
        </div>
        <div>
          <h4>Get in touch</h4>
          <ul>
            <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
            <li><a href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&#169; <span data-year>2026</span> Keerthika Mohanmoorthy. All rights reserved.</span>
        <span>Statement of Originality &amp; Authenticity applies to every page of this portfolio.</span>
      </div>
    </div>
  </footer>`;
}

function subnav(page) {
  const tabs = [`<a href="curriculum-pedagogy.html"><span class="dd-letter"><i class="fa-solid fa-table-cells-large"></i></span> Overview</a>`]
    .concat(SUBPAGES.map((s) => `<a href="${s.file}"${page.sub === s.key ? ' aria-current="page"' : ""}><span class="dd-letter">${s.key}</span> ${s.label}</a>`))
    .map((a) => "        " + a)
    .join("\n");
  return `<nav class="cp-subnav" aria-label="Curriculum and Pedagogy subpages">
      <div class="container">
${tabs}
      </div>
    </nav>`;
}

function pager(page) {
  const i = SUBPAGES.findIndex((s) => s.key === page.sub);
  const prev = i > 0 ? SUBPAGES[i - 1] : null;
  const next = i < SUBPAGES.length - 1 ? SUBPAGES[i + 1] : null;
  const prevHtml = prev
    ? `<a class="prev" href="${prev.file}"><small><i class="fa-solid fa-arrow-left"></i> Previous</small><span>${prev.key}. ${prev.label}</span></a>`
    : `<a class="prev" href="curriculum-pedagogy.html"><small><i class="fa-solid fa-arrow-left"></i> Back to</small><span>Curriculum &amp; Pedagogy overview</span></a>`;
  const nextHtml = next
    ? `<a class="next" href="${next.file}"><small>Next <i class="fa-solid fa-arrow-right"></i></small><span>${next.key}. ${next.label}</span></a>`
    : `<a class="next" href="continuous-learning.html"><small>Next <i class="fa-solid fa-arrow-right"></i></small><span>Continuous Professional Learning</span></a>`;
  return `<nav class="cp-pager" aria-label="Previous and next subpage">
          ${prevHtml}
          ${nextHtml}
        </nav>`;
}

const version = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const encode = (s) => s.replace(/[^\x00-\x7f]/gu, (c) => "&#" + c.codePointAt(0) + ";");
let problems = 0;

for (const page of PAGES) {
  const file = path.join(ROOT, page.file);
  if (!fs.existsSync(file)) { console.log("MISSING PAGE:", page.file); problems++; continue; }
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(/<header class="site-header">[\s\S]*?<\/header>/, header(page));
  s = s.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer());
  if (page.sub) {
    s = s.replace(/<nav class="cp-subnav"[^>]*>[\s\S]*?<\/nav>/, subnav(page));
    s = s.replace(/<nav class="cp-pager"[^>]*>[\s\S]*?<\/nav>/, pager(page));
  }
  s = s.replace(/style\.css(\?v=\d+)?"/g, `style.css?v=${version}"`).replace(/main\.js(\?v=\d+)?"/g, `main.js?v=${version}"`);
  s = encode(s);
  fs.writeFileSync(file, s);

  // link check
  for (const m of s.matchAll(/(?:href|src)="([^"#:?]+\.(?:html|pdf|jpe?g|png|css|js))(?:[?#][^"]*)?"/g)) {
    if (!fs.existsSync(path.join(ROOT, m[1]))) { console.log(`BROKEN LINK in ${page.file}: ${m[1]}`); problems++; }
  }
}
console.log(`Synced ${PAGES.length} pages (v=${version})${problems ? `, ${problems} problem(s)` : ", all links OK"}`);
process.exitCode = problems ? 1 : 0;
