/**
 * Responsive <img> props for remote images.
 * Unsplash URLs are resized server-side (w/h, auto=format → WebP/AVIF), so phones download
 * a ~400–800px image instead of the 1200px+ original. Other hosts pass through unchanged.
 */

const isUnsplash = (url) => typeof url === "string" && /^https:\/\/images\.unsplash\.com\//.test(url);

/** Unsplash URL at a given width (keeps crop ratio when an explicit height is set). */
export const sizedImage = (url, width) => {
  if (!isUnsplash(url)) return url;
  try {
    const u = new URL(url);
    const w = Number(u.searchParams.get("w"));
    const h = Number(u.searchParams.get("h"));
    u.searchParams.set("w", String(width));
    if (w && h) u.searchParams.set("h", String(Math.round((h / w) * width)));
    u.searchParams.set("auto", "format");
    u.searchParams.set("q", "75");
    if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return url;
  }
};

/** Common `sizes` presets matching the site's layouts. */
export const IMAGE_SIZES = {
  full: "100vw",
  half: "(max-width: 768px) 100vw, 50vw",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
};

const WIDTHS = {
  full: [640, 960, 1280, 1600],
  half: [480, 720, 960],
  card: [400, 600, 800]
};

/**
 * Spread onto an <img>: `<img {...responsiveImage(url, "card")} alt="…" />`.
 * Returns only `src` for non-Unsplash URLs (no srcset we can trust).
 */
export const responsiveImage = (url, preset = "card") => {
  if (!url) return { src: url };
  if (!isUnsplash(url)) return { src: url };
  const widths = WIDTHS[preset] || WIDTHS.card;
  return {
    src: sizedImage(url, widths[1]),
    srcSet: widths.map((w) => `${sizedImage(url, w)} ${w}w`).join(", "),
    sizes: IMAGE_SIZES[preset] || IMAGE_SIZES.card
  };
};
