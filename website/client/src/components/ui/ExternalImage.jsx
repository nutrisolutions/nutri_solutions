import { externalImgProps } from "../../lib/externalImage";

const isExternalUrl = (src) => typeof src === "string" && /^https?:\/\//i.test(src);

/** Image that can load hotlink-protected CDNs (imgproxy, etc.) in admin and on the site */
const ExternalImage = ({ src, alt = "", ...rest }) => (
  <img src={src} alt={alt} {...(isExternalUrl(src) ? externalImgProps : {})} {...rest} />
);

export default ExternalImage;
