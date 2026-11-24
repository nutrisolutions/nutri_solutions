const BrandLogo = ({ variant = "branding", className = "" }) => {
  const isLogoOnly = variant === "logo";
  const src = isLogoOnly ? "/logo.svg" : "/branding.svg";
  const alt = "Nutri Solutions Private Limited";

  return (
    <img
      src={src}
      alt={alt}
      // Intrinsic size (from the SVG viewBox) reserves the aspect ratio; CSS sets the rendered size.
      width={isLogoOnly ? 181 : 875}
      height={isLogoOnly ? 299 : 297}
      className={`brand-logo ${isLogoOnly ? "brand-logo--icon" : "brand-logo--full"} ${className}`.trim()}
      loading="eager"
      decoding="async"
    />
  );
};

export default BrandLogo;
