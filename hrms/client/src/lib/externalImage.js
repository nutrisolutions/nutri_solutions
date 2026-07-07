/**
 * Props for <img> loading third-party URLs (Unsplash, imgproxy, CDNs).
 * Many hosts return 403 when Referer is localhost — no-referrer avoids that.
 */
export const externalImgProps = {
  referrerPolicy: "no-referrer",
  decoding: "async"
};
