# Keerthika Mohanmoorthy — ECE Portfolio

Static portfolio website for an Early Childhood Educator (Toronto, ON). Plain HTML/CSS/JS, no build step, no framework.

- **Live site:** https://keerthi2000-coder.github.io/keerthika-ece-portfolio/
- **Repo:** https://github.com/Keerthi2000-coder/keerthika-ece-portfolio (branch `main`, GitHub Pages from `/ (root)`)
- **Old repo** `Keerthi2000-coder/keerthika-portfolio` (remote `old-origin`) holds the previous site. Don't push there.

## Folder layout

```
index.html                  Home: hero, stats, land acknowledgement, about, competencies, experience, education, availability, contact
cover-letter.html           Resume & Cover Letter: full letter text, resume highlights, embedded resume PDF
curriculum-pedagogy.html    Philosophy of Teaching (kaleidoscope), approaches, age groups, pedagogical documentation, CCEYA links
continuous-learning.html    Diploma progress, learning timeline, Tutor Skills certificate, certifications, goals
references.html             Four professional reference cards + references PDF
assets/css/style.css        The only stylesheet (design tokens in :root at the top)
assets/js/main.js           The only script (all interactions, see below)
assets/img/                 Photos (keerthika-portrait.jpeg = hero, keerthika-graduation.jpeg = About)
assets/docs/application/    Resume, cover letter, references PDFs  (published)
assets/docs/coursework/     ECE 245 philosophy + pedagogical documentation PDFs (published)
assets/docs/certificates/   Certificates (published)
Source Documents/           Original files as received. NOT published (gitignored). Keep originals here.
.nojekyll                   Tells GitHub Pages to serve files as-is
```

## How to add or update a document

1. Put the original into the right `Source Documents/` subfolder.
2. Copy it into the matching `assets/docs/<category>/` folder with a clean name (`Keerthika_Mohanmoorthy_<Thing>.pdf`, no spaces or `+`).
3. Update the text on the page so it matches the document. **Use only facts from her documents**; never invent experience, dates or claims.
4. Bump the cache version (see below), preview, commit, push.

## Rules that matter

- **Non-ASCII characters must be HTML entities** in `.html` files (`&#233;`, `&#8217;`, emoji like `&#129528;`) and `\u{...}` escapes in `main.js`. Some viewers ignored UTF-8 and showed mojibake (`Ã©`). Check with: `LC_ALL=C grep -c '[^ -~	]' *.html assets/css/style.css assets/js/main.js` → all must be 0.
- **Write "Resume", not "Résumé"** (her preference).
- **Cache busting:** pages link `style.css?v=YYYYMMDDHHMM` and `main.js?v=...`. After any CSS/JS change, bump the version in all 5 HTML files, or visitors see the old styles for up to 10 minutes (GitHub Pages `max-age=600`).
- **Nav and footer are duplicated in every page.** When changing them, change all 5 files. The current page gets `aria-current="page"`.
- **Privacy:** don't put her home address on the web pages (it's only in the PDFs). The References page shows referees' contact details publicly; confirm consent before adding new referees.
- **Commit author** for this repo is set locally: `Keerthika Mohanmoorthy <itskeerthi2000@gmail.com>`.
- The working folder path contains an apostrophe (`Keerthika's Portfolio`), which breaks bash heredocs and `cd` quoting. Prefer PowerShell or small Node scripts for edits.

## Design system (assets/css/style.css)

- Fonts: **Fraunces** (serif headings) + **Plus Jakarta Sans** (body), Google Fonts. Icons: Font Awesome 6.5.2 (cdnjs).
- Colours (`:root`): `--teal #1f7a72` primary, `--sun #e8a33d`, `--rose #d9776a`, `--ink #16243a` headings, `--paper #fbf8f3` background.
- Reusable blocks: `.card`, `.bento` (`.feature`, `.full`), `.timeline`/`.tl-item`, `.status-list` + `.pill.ok|.prog|.info`, `.steps`, `.cta`, `.band`, `.doc-feature`, `.facet`, `.ref-card`, `.cert-card`, `.laws`.
- Child-friendly touches: `data-emoji="🧸"` on a card adds a corner emoji; `<span class="em">` inside `.eyebrow` adds a label emoji.
- Mobile nav collapses below 1180px. Everything is tested at 390px wide (no horizontal scroll).

## Interactions (assets/js/main.js)

| Feature | How to use |
| --- | --- |
| Reveal on scroll | add class `reveal` or `reveal-scale`; `data-stagger="90"` on a parent staggers children |
| Headline word animation | `data-split` on an `h1` |
| Count-up numbers | `<span data-count="15">15</span>` |
| Cursor spotlight on cards | class `spot` |
| Magnetic buttons | class `magnetic` |
| 3D portrait tilt | `data-tilt` wrapper with `.tilt` inside |
| Diploma progress bar | `data-progress-start` / `data-progress-end` dates; % is computed from today |
| Floating emojis in headers | automatic on `.hero` / `.page-hero` (`KID_SETS` in main.js) |
| Welcome avatar popup (waving 👋) | automatic, once per browser session (`sessionStorage km-welcome`) |
| Page transitions (teal curtain) | automatic for internal links + back/forward; inline head script on every page adds `pt-arriving` |
| Open at top on reload | `history.scrollRestoration = "manual"` (hash links still jump) |

All motion is disabled under `prefers-reduced-motion`.

## Preview and publish

```powershell
# Preview (any static server); e.g. from this folder:
npx serve .            # or: python -m http.server 5317
# Publish
git add -A
git commit -m "..."
git push               # Pages redeploys in ~30-60 s
```

If `git push` fails with "terminal prompts disabled", run it with `$env:GCM_INTERACTIVE='always'; $env:GIT_TERMINAL_PROMPT='1'` so the GitHub sign-in window can appear (sign in as **Keerthi2000-coder**).

## Content sources (keep in sync)

| Page section | Source document |
| --- | --- |
| Experience, education, credentials, competencies | Resume (`assets/docs/application/`) |
| Cover letter text, availability | Cover letter |
| Reference cards | Professional references PDF (latest = "With Gold Circle Website" version) |
| Philosophy (kaleidoscope, 5 facets) | ECE 245 Philosophy of Teaching and Learning |
| Pedagogical documentation | ECE 245 "Colouring with Chalk" group documentation (her contributions quoted) |
| Certificate + Tutor Doctor modules | Tutor Skills certificate (2025-10-31, 2 CPD credits) |

## Open items

- Her resume/cover letter PDFs still print the **old** portfolio URL (`.../keerthika-portfolio`). Update the PDFs to `https://keerthi2000-coder.github.io/keerthika-ece-portfolio/` and replace them in `assets/docs/application/`.
- Confirm consent for the public pedagogical documentation PDF (group work, may show children).
