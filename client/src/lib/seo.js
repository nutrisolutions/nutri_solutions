import { seo } from "../data/content";

export const SITE_NAME = "Nutri Solutions";
export const DEFAULT_OG_IMAGE = `${seo.siteUrl}/og-image.png`;
export const ORG_ID = `${seo.siteUrl}/#organization`;

const PAGE_SCHEMA_ID = "nutri-json-ld-page";

/** Absolute, canonical URL for a path: www host, no trailing slash (except root), no query/hash. */
/** Site-relative asset path → absolute URL (OG tags and JSON-LD require absolute URLs). */
export const absoluteUrl = (src) => (typeof src === "string" && src.startsWith("/") && !src.startsWith("//") ? `${seo.siteUrl}${src}` : src);

export const canonicalUrl = (pathname = "/") => {
  const clean = pathname.split(/[?#]/)[0].replace(/\/+$/, "");
  return `${seo.siteUrl}${clean || "/"}`;
};

/** First candidate title that fits Google's ~65-char display; falls back to the last (shortest). */
export const fitTitle = (...candidates) => candidates.find((t) => t.length <= 65) || candidates[candidates.length - 1];

/** Trim text to a meta-description-friendly length on a word boundary. */
export const toDescription = (text = "", max = 158) => {
  const plain = String(text).replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s-]+$/, "")}…`;
};

const upsertMeta = (key, content, attr = "name") => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content == null || content === "") {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: canonicalUrl(item.path)
  }))
});

/**
 * Apply all per-page head tags. `schema` is an array of JSON-LD objects for this page only;
 * the site-wide Organization/WebSite graph is managed separately by SeoHead.
 */
export const applySeo = ({
  title,
  description,
  pathname,
  image = DEFAULT_OG_IMAGE,
  imageAlt = "Nutri Solutions",
  type = "website",
  noindex = false,
  schema = []
}) => {
  const url = canonicalUrl(pathname);
  image = absoluteUrl(image);

  document.title = title;
  upsertMeta("description", description);
  upsertMeta("robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
  upsertLink("canonical", url);

  upsertMeta("og:type", type, "property");
  upsertMeta("og:site_name", SITE_NAME, "property");
  upsertMeta("og:title", title, "property");
  upsertMeta("og:description", description, "property");
  upsertMeta("og:url", url, "property");
  upsertMeta("og:image", image, "property");
  upsertMeta("og:image:secure_url", image, "property");
  upsertMeta("og:image:alt", imageAlt, "property");
  // Only the static default image has known dimensions/type.
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  upsertMeta("og:image:width", isDefaultImage ? "1200" : null, "property");
  upsertMeta("og:image:height", isDefaultImage ? "630" : null, "property");
  upsertMeta("og:image:type", isDefaultImage ? "image/png" : null, "property");
  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", title);
  upsertMeta("twitter:description", description);
  upsertMeta("twitter:image", image);

  let script = document.getElementById(PAGE_SCHEMA_ID);
  if (!schema.length) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = PAGE_SCHEMA_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema.length === 1 ? schema[0] : schema);
};
