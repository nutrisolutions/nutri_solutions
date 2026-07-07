import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { contactInfo, pageSeo, seo } from "../data/content";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nutri Solutions Private Limited",
  url: seo.siteUrl,
  description: seo.description,
  email: contactInfo.email,
  telephone: contactInfo.phoneTel,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Orbit, Plot No 30/C, Sy No 83/1, Raidurgam, Knowledge City Rd",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500032",
    addressCountry: "IN"
  },
  areaServed: "IN",
  sameAs: []
};

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
    script.textContent = JSON.stringify([organizationSchema, serviceSchema]);
  }, [meta, pathname]);

  return null;
};

export default SeoHead;
