import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageSeo, seo } from "../data/content";
import { useSiteSettings } from "../context/SiteSettingsContext";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Nutri Solutions Software Development Services",
  provider: { "@type": "Organization", name: "Nutri Solutions Private Limited" },
  serviceType: [
    "Custom Software Development",
    "Web Development",
    "Mobile App Development",
    "Cloud DevOps Consulting"
  ],
  areaServed: "India"
};

const SeoHead = ({ page = "home" }) => {
  const { pathname } = useLocation();
  const contact = useSiteSettings();
  const pageKey = page || (pathname === "/" ? "home" : pathname.replace(/^\//, "").split("/")[0]);
  const meta = pageSeo[pageKey] || pageSeo.home;

  useEffect(() => {
    document.title = meta.title;

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", meta.description);
    setMeta("keywords", seo.keywords);
    setMeta("og:title", meta.title, "property");
    setMeta("og:description", meta.description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", `${seo.siteUrl}${pathname === "/" ? "" : pathname}`, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);

    const scriptId = "nutri-json-ld";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nutri Solutions Private Limited",
      url: seo.siteUrl,
      description: seo.description,
      email: contact.email,
      telephone: contact.phoneTel,
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.streetAddress || contact.address,
        addressLocality: contact.addressLocality,
        addressRegion: contact.addressRegion,
        postalCode: contact.postalCode,
        addressCountry: contact.addressCountry || "IN"
      },
      areaServed: contact.addressCountry || "IN",
      sameAs: (contact.socialLinks || []).map((link) => link.url).filter(Boolean)
    };

    script.textContent = JSON.stringify([organizationSchema, serviceSchema]);
  }, [meta, pathname, contact]);

  return null;
};

export default SeoHead;
