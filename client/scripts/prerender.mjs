#!/usr/bin/env node
/**
 * Build-time prerender + sitemap.
 *
 * Runs after `vite build`. Serves dist/ locally, opens every public route in headless Chrome,
 * and saves the fully rendered HTML (title, meta, canonical, JSON-LD and page text) to
 * dist/_pages/<route>.html. nginx maps clean URLs to those files (see deploy/nginx/).
 * dist/index.html stays the plain SPA shell, so an un-updated nginx keeps working as before.
 *
 * Also writes dist/sitemap.xml from the same route list (indexable pages only).
 *
 * Env: VITE_API_URL (default https://api.nutrisolutions.co.in)
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(DIST, "_pages");
const SITE = "https://www.nutrisolutions.co.in";
const API = (process.env.VITE_API_URL || "https://api.nutrisolutions.co.in").replace(/\/+$/, "");
const NOT_FOUND_ROUTE = "/__prerender-not-found";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/blog",
  "/careers",
  "/contact",
  "/terms",
  "/privacy-policy"
];
// Client-side <Navigate> aliases — nginx 301s these, never prerender them.
const SKIP_ROUTES = new Set(["/process", "/portfolio"]);

const BLOCKED_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "posthog.com",
  "images.unsplash.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain"
};

const log = (...args) => console.log("[prerender]", ...args);

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
};

const listFrom = (data, key) => (Array.isArray(data) ? data : data?.[key] || []);

const startServer = (shell) =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const file = path.join(DIST, urlPath);
      if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
        fs.createReadStream(file).pipe(res);
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[".html"] });
      res.end(shell);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

const outFileFor = (route) =>
  route === "/"
    ? path.join(OUT, "index.html")
    : route === NOT_FOUND_ROUTE
      ? path.join(OUT, "404.html")
      : path.join(OUT, `${route.replace(/^\//, "")}.html`);

const xmlEscape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const main = async () => {
  const shellPath = path.join(DIST, "index.html");
  if (!fs.existsSync(shellPath)) throw new Error("dist/index.html missing — run vite build first");
  const shell = fs.readFileSync(shellPath, "utf8");
  const shellScriptSrcs = [...shell.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);

  // 1. Route inventory from the API (source of truth for dynamic pages + lastmod).
  const [blogs, projects, careers] = await Promise.all([
    fetchJson(`${API}/api/blogs`).then((d) => listFrom(d, "blogs")),
    fetchJson(`${API}/api/projects`).then((d) => listFrom(d, "projects")),
    fetchJson(`${API}/api/careers`).then((d) => listFrom(d, "positions"))
  ]);
  const lastmod = new Map();
  const dynamicRoutes = [];
  for (const [base, items] of [
    ["/blog", blogs],
    ["/projects", projects],
    ["/careers", careers]
  ]) {
    for (const item of items) {
      if (!item.slug) continue;
      const route = `${base}/${item.slug}`;
      dynamicRoutes.push(route);
      const date = item.updatedAt || item.publishedAt || item.createdAt;
      if (date) lastmod.set(route, date.slice(0, 10));
    }
  }
  log(`API: ${blogs.length} blogs, ${projects.length} projects, ${careers.length} careers`);

  // 2. Render. Service detail pages (and anything else linked) are discovered by crawling links.
  const server = await startServer(shell);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  const queue = [...new Set([...STATIC_ROUTES, ...dynamicRoutes])];
  const seen = new Set(queue);
  const results = [];
  const failures = [];
  const expected = new Set(queue);

  const renderRoute = async (route) => {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 900 });
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.setRequestInterception(true);
      page.on("request", async (req) => {
        const url = req.url();
        try {
          if (BLOCKED_HOSTS.some((h) => url.includes(h)) || ["image", "media", "font"].includes(req.resourceType())) {
            return req.abort();
          }
          if (url.startsWith(API)) {
            // Proxy API calls through Node: avoids CORS (localhost origin) and never sends writes.
            if (req.method() === "OPTIONS") {
              return req.respond({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
            }
            if (req.method() !== "GET") return req.abort();
            const res = await fetch(url, { headers: { Accept: "application/json" } });
            return req.respond({
              status: res.status,
              contentType: res.headers.get("content-type") || "application/json",
              headers: { "Access-Control-Allow-Origin": "*" },
              body: Buffer.from(await res.arrayBuffer())
            });
          }
          if (url.startsWith(origin) || url.startsWith("data:")) return req.continue();
          return req.abort();
        } catch {
          if (!req.isInterceptResolutionHandled()) req.abort().catch(() => {});
        }
      });

      const pending = new Map();
      page.on("request", (r) => pending.set(r, r.url()));
      page.on("requestfinished", (r) => pending.delete(r));
      page.on("requestfailed", (r) => pending.delete(r));

      await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      try {
        await page.waitForNetworkIdle({ idleTime: 600, timeout: 25000 });
      } catch {
        log(`warn: ${route} network never idle; still pending: ${[...pending.values()].slice(0, 5).join(", ")}`);
      }
      await page.waitForSelector('link[rel="canonical"]', { timeout: 20000 });
      await new Promise((r) => setTimeout(r, 250));

      const info = await page.evaluate((keepSrcs) => {
        // Drop scripts injected at runtime (analytics loaders etc.); keep the original bundle tags.
        document.querySelectorAll("script[src]").forEach((s) => {
          if (!keepSrcs.includes(s.getAttribute("src"))) s.remove();
        });
        // Un-hide content frozen mid-animation so no-JS readers see it. React re-renders on boot anyway.
        document.querySelectorAll("[style]").forEach((el) => {
          if (el.style.opacity === "0") el.style.removeProperty("opacity");
          if (el.style.transform && el.style.transform !== "none") el.style.removeProperty("transform");
        });
        const links = [...document.querySelectorAll("a[href]")]
          .map((a) => a.getAttribute("href"))
          .filter((h) => h && h.startsWith("/") && !h.startsWith("//"));
        // Content images hosted on our own domain → image sitemap (Google Images).
        const images = [
          ...new Set(
            [...document.querySelectorAll(".blog-detail-cover img, .blog-detail-content img")]
              .map((img) => (img.getAttribute("src") || "").replace(/^https:\/\/www\.nutrisolutions\.co\.in(?=\/)/, ""))
              .filter((src) => src && src.startsWith("/") && !src.startsWith("//"))
          )
        ];
        return {
          images,
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || "",
          canonical: document.querySelector('link[rel="canonical"]')?.href || "",
          robots: document.querySelector('meta[name="robots"]')?.content || "",
          h1: document.querySelector("h1")?.textContent?.trim() || "",
          links,
          html: "<!doctype html>\n" + document.documentElement.outerHTML
        };
      }, shellScriptSrcs);

      return info;
    } finally {
      await page.close();
    }
  };

  // Small worker pool.
  const CONCURRENCY = 4;
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const route = queue[cursor++];
      try {
        const info = await renderRoute(route);
        const noindex = /noindex/i.test(info.robots);
        if (noindex && expected.has(route)) {
          failures.push(`${route}: rendered as not-found/noindex ("${info.h1}")`);
          continue;
        }
        if (noindex) {
          log(`warn: linked page ${route} is not-found — fix the link`);
          continue;
        }
        const file = outFileFor(route);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, info.html);
        results.push({ route, ...info, html: undefined });

        for (const raw of info.links) {
          const link = raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
          if (link.startsWith("/admin") || SKIP_ROUTES.has(link) || seen.has(link)) continue;
          if (path.extname(link)) continue; // files like /sitemap.xml
          seen.add(link);
          queue.push(link);
        }
      } catch (err) {
        failures.push(`${route}: ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // 404 page (served by nginx with a real 404 status).
  try {
    const nf = await renderRoute(NOT_FOUND_ROUTE);
    fs.writeFileSync(outFileFor(NOT_FOUND_ROUTE), nf.html.replace(/\s*<link rel="canonical"[^>]*>/, ""));
  } catch (err) {
    failures.push(`404 page: ${err.message}`);
  }

  await browser.close();
  server.close();

  // 3. Quality gates.
  const byTitle = new Map();
  for (const r of results) {
    if (!r.title || !r.description) failures.push(`${r.route}: missing title or description`);
    if (!r.h1) failures.push(`${r.route}: missing <h1>`);
    if (r.canonical !== `${SITE}${r.route === "/" ? "/" : r.route}`) {
      failures.push(`${r.route}: canonical is ${r.canonical}`);
    }
    byTitle.set(r.title, [...(byTitle.get(r.title) || []), r.route]);
  }
  for (const [title, routes] of byTitle) {
    if (routes.length > 1) log(`warn: duplicate title "${title}" on ${routes.join(", ")}`);
  }

  if (failures.length) {
    console.error("[prerender] FAILED:\n  " + failures.join("\n  "));
    process.exit(1);
  }

  // 4. Sitemap.
  const imagesByRoute = new Map(results.map((r) => [r.route, r.images || []]));
  const routes = results.map((r) => r.route).sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...routes.map((route) => {
      const loc = `${SITE}${route === "/" ? "/" : route}`;
      const mod = lastmod.get(route);
      const imgs = (imagesByRoute.get(route) || [])
        .map((src) => `<image:image><image:loc>${xmlEscape(SITE + src)}</image:loc></image:image>`)
        .join("");
      return `  <url><loc>${xmlEscape(loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ""}${imgs}</url>`;
    }),
    "</urlset>",
    ""
  ].join("\n");
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml);

  log(`done: ${results.length} pages prerendered, sitemap has ${routes.length} URLs`);
};

main().catch((err) => {
  console.error("[prerender] FAILED:", err);
  process.exit(1);
});
