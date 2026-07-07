/**
 * Device frame for home marquee mockups — driven by application type only.
 */
export const resolveProjectDevice = (project) => {
  const type = (project?.applicationType || "").toLowerCase();
  if (type.includes("mobile")) return "phone";
  return "laptop";
};

/**
 * Fallback CSS UI when no homeMockupImage is set.
 */
export const resolveProjectMockup = (project) => {
  const type = (project?.applicationType || "").toLowerCase();
  const title = (project?.title || "").toLowerCase();
  const slug = (project?.slug || "").toLowerCase();
  const text = `${title} ${slug} ${(project?.shortDescription || "").toLowerCase()}`;

  const isMobile = type.includes("mobile");

  if (
    text.includes("healthcare") ||
    text.includes("patient") ||
    text.includes("doctor") ||
    text.includes("hospital") ||
    slug.includes("healthcare")
  ) {
    return { device: "phone", screen: "healthcare" };
  }

  if (
    text.includes("event") ||
    text.includes("schedule") ||
    text.includes("ticketing") ||
    text.includes("conference") ||
    slug.includes("event")
  ) {
    return { device: isMobile ? "phone" : "laptop", screen: "events" };
  }

  if (
    text.includes("e-commerce") ||
    text.includes("ecommerce") ||
    text.includes("commerce") ||
    text.includes("storefront") ||
    text.includes("retail") ||
    slug.includes("ecommerce")
  ) {
    return { device: "laptop", screen: "ecommerce" };
  }

  if (
    text.includes("hr") ||
    text.includes("payroll") ||
    text.includes("enterprise") ||
    slug.includes("hr") ||
    slug.includes("payroll") ||
    type.includes("custom")
  ) {
    return { device: "laptop", screen: "enterprise" };
  }

  if (isMobile) {
    return { device: "phone", screen: "generic-mobile" };
  }

  if (type.includes("web")) {
    return { device: "laptop", screen: "ecommerce" };
  }

  return { device: "laptop", screen: "generic-web" };
};
