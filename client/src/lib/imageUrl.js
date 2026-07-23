const IMAGE_EXT = /\.(avif|bmp|gif|heic|jpe?g|png|svg|webp)(\?.*)?$/i;

const KNOWN_IMAGE_HOST =
  /images\.unsplash\.com|i\.imgur\.com|res\.cloudinary\.com|imgproxy\.|epicpxls\.com|cdn\.|cloudfront\.net|storage\.googleapis\.com|picsum\.photos/i;

/** Path ends with an image extension (handles imgproxy URLs like …/Zg.jpg) */
const hasImageExtension = (pathname) =>
  IMAGE_EXT.test(pathname) || /\.(avif|bmp|gif|heic|jpe?g|png|svg|webp)(\?.*)?$/i.test(pathname.split("/").pop() || "");

/** URLs that are almost always HTML pages, not embeddable images */
const PAGE_URL_PATTERNS = [
  /linkedin\.com\/(pulse|posts|feed|in\/)/i,
  /freebiesui\.com\/?$/i,
  /freebiesui\.com\/[^/]+\/?$/i,
  /fueler\.io\/[a-z0-9-]+$/i,
  /behance\.net\//i,
  /dribbble\.com\/shots\//i,
  /medium\.com\//i,
  /facebook\.com\//i,
  /instagram\.com\/(p|reel)\//i
];

/**
 * @returns {{ ok: boolean, message?: string, warn?: string }}
 */
export const validateImageUrl = (raw) => {
  const url = raw?.trim();
  if (!url) return { ok: false, message: "Enter a URL first." };

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, message: "Invalid URL. Use a full link starting with https://" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, message: "URL must use http or https." };
  }

  const path = parsed.pathname;
  const hasImageExt = hasImageExtension(path);
  const isKnownCdn = KNOWN_IMAGE_HOST.test(parsed.href);

  if (PAGE_URL_PATTERNS.some((re) => re.test(url)) && !hasImageExt) {
    return {
      ok: false,
      message:
        "That link is a webpage, not an image file. Open the image in your browser, right-click it, choose “Copy image address”, or use Upload."
    };
  }

  if (!hasImageExt && !isKnownCdn) {
    return {
      ok: true,
      warn:
        "This URL has no .jpg/.png extension. It will only preview if it points directly to an image file."
    };
  }

  return { ok: true };
};
