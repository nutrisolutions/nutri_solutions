# Project Memory

## 1. Project Snapshot
- Company site for Nutri Solutions Pvt Ltd (software dev agency, Hyderabad). Canonical host: `https://www.nutrisolutions.co.in`.
- Frontend: `client/` — Vite 5 + React 18 SPA, react-router 6, framer-motion, lenis, plain CSS (`src/styles/global.css`, `redesign.css`, `responsive.css`). npm.
- Backend: `server/` — Express + MongoDB (Mongoose), JWT admin auth, PM2 process `nutri-backend`. Public API at `https://api.nutrisolutions.co.in`.
- Hosting: single EC2 (Ubuntu, nginx 1.28) — static site in `/var/www/nutrisolutions`, repo at `/root/nutri_solutions`.
- No mobile app in this repo → web↔mobile parity doesn't apply.

## 2. Architecture
- Public content (blogs, projects, careers, homepage, settings) comes from the API; admin panel at `/admin` edits it.
- Site settings (phone, address, social links) live in Mongo; code defaults in `client/src/data/content.js` + `server/src/controllers/settingsController.js` are only fallbacks — **the live footer/contact use the DB values** (change them in Admin → Settings).
- SEO: `client/src/lib/seo.js` (`applySeo`, `canonicalUrl`, `breadcrumbSchema`, `fitTitle`) + `hooks/usePageSeo.js`. `components/SeoHead.jsx` owns the site-wide ProfessionalService/WebSite JSON-LD and section-page meta; detail pages (blog/project/service/career) and `NotFoundPage` call `usePageSeo` themselves.
- Prerender: `client/scripts/prerender.mjs` (Puppeteer) runs after `vite build` (`npm run build:seo`) → `dist/_pages/<route>.html` + `dist/_pages/404.html` + `dist/sitemap.xml`. `dist/index.html` stays the plain SPA shell (admin + fallback). Fails the build on missing title/description/h1, wrong canonical, or noindex on an expected page.
- Deploy: `.github/workflows/deploy.yml` builds + prerenders on the Actions runner, `nginx -t`-checks `deploy/nginx/`, uploads `site.tar.gz` to EC2, then `scripts/deploy.sh` installs it (`PREBUILT_SITE`). Nightly scheduled run (02:00 IST) re-prerenders for new blog posts (frontend only). `VITE_API_URL` is set in the workflow (no PostHog key in prod).
- nginx config is versioned in `deploy/nginx/` (clean URL → `_pages/*.html`, non-www/trailing-slash 301s, gzip, immutable `/assets`, security headers, real 404).

## 4. Engineering Decisions
- Prerender in GitHub Actions, not on EC2 (headless Chrome too heavy for the small instance). Date: 2026-11-24
- Public pages are eagerly bundled; only admin routes are `React.lazy` (lazy public pages would blank prerendered HTML on boot). Date: 2026-11-24
- `noindex` only when the API returns 404 (`isNotFoundError`), never on network errors — protects indexed pages from transient API failures. Date: 2026-11-24
- Homepage H1 = small line "Custom software development company in Hyderabad"; the big "From concept to code to customers" is a styled `<p class="protoz-hero-title">`. Date: 2026-11-24
- Sitemap is generated, not hand-written (`client/public/sitemap.xml` removed). Date: 2026-11-24
- Stat counters (`AnimatedStatValue`) start at the real value; count-up only when motion allowed — snapshots/crawlers must never see "0+". Date: 2026-11-24
- Public blog list (`GET /api/blogs`) omits `content`; only `GET /api/blogs/:slug` returns the body. Date: 2026-11-24

## 6. Current Work
- SEO audit (2026-11-24, score 40/100): `nutrisolutions.co.in-audit/` (untracked) — FULL-AUDIT-REPORT.md, ACTION-PLAN.md.
- Phase 1+2 (A–O) live as of 2026-11-24: nginx config applied on EC2 (`/etc/nginx/sites-available/nutrisolutions`, backup of the old certbot config at `/root/nutrisolutions.nginx.bak`; api block untouched). Perf round 2 (2026-11-24): responsive Unsplash srcset (`lib/responsiveImage.js`), deferred gtag, API gzip (`compression`), blog list without `content` + `?limit=`, stat counters render real values, Lenis off on touch/reduced-motion. Lighthouse: home mobile 29 → ~44–50 (LCP ~6.7–7.2s), desktop 89, blog mobile 75; SEO 100 everywhere. Audit v2 score 71/100 (`nutrisolutions.co.in-audit/FULL-AUDIT-REPORT-v2.md`). **Pending:** submit sitemap in GSC + Bing; re-auth Search Console MCP.
- Remaining mobile cost is main-thread: framer-motion (~2.3s CPU) + React re-rendering the whole prerendered DOM (`createRoot`, not `hydrateRoot`) + render-blocking Google Fonts. Next options: `hydrateRoot`, LazyMotion/`m` components or CSS animations above the fold, self-hosted fonts.
- Phase 3 (content/authority: blog rewrites, named authors, case-study results, GBP, directories, llms.txt) not started — needs content from the team.

## 7. Known Issues
- Blog posts are thin (~210 words, stock images, team author). Phase 3.
- `global.css` ~L782 gradient text flagged by the design hook — pre-existing, untouched.

## 8. Important Constraints
- Correct phone: +91 99493 55560 (`+919949355560`).
- Social: instagram.com/nutrisolutions_official, facebook.com/nutrisolutionsofficial, linkedin.com/company/nutri-solutions-pvt-ltd.
- API CORS only allows the production origins — local prerender proxies API calls through Node.

## 11. Do Not Repeat
- Disabling Lenis alone did not improve mobile Lighthouse (framer-motion is the cost); kept for native touch scroll UX, not speed.
- Don't add `gzip on;` at http level in `deploy/nginx/` — Ubuntu's nginx.conf already has it (duplicate → `nginx -t` fails).
- nginx config uses `http2 on;` (needs nginx ≥1.25.1 — prod is 1.28, CI runner is newer). CI dummy dhparams must be ≥2048-bit (OpenSSL 3 rejects 1024).

## 12. Last Updated
2026-11-24
