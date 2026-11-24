import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageSeo, seo } from "../data/content";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { applySeo, breadcrumbSchema, ORG_ID } from "../lib/seo";

const ORG_SCHEMA_ID = "nutri-json-ld";

// Section landing pages SeoHead owns. Detail pages (/blog/:slug …) and the 404 page set their own meta.
const SECTION_NAMES = {
  about: "About",
  services: "Services",
  projects: "Projects",
  blog: "Blog",
  careers: "Careers",
  contact: "Contact",
  terms: "Terms & Conditions",
  "privacy-policy": "Privacy Policy"
};

const SeoHead = () => {
  const { pathname } = useLocation();
  const contact = useSiteSettings();

  // Site-wide business graph (same on every page).
  useEffect(() => {
    let script = document.getElementById(ORG_SCHEMA_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = ORG_SCHEMA_ID;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfessionalService",
          "@id": ORG_ID,
          name: "Nutri Solutions Private Limited",
          alternateName: "Nutri Solutions",
          url: `${seo.siteUrl}/`,
          logo: `${seo.siteUrl}/favicon-512.png`,
          image: `${seo.siteUrl}/og-image.png`,
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
          geo: { "@type": "GeoCoordinates", latitude: 17.434691, longitude: 78.376771 },
          hasMap: contact.mapUrl || undefined,
          areaServed: [
            { "@type": "City", name: "Hyderabad" },
            { "@type": "Country", name: "India" }
          ],
          contactPoint: {
            "@type": "ContactPoint",
            telephone: contact.phoneTel,
            email: contact.email,
            contactType: "sales",
            areaServed: "IN",
            availableLanguage: ["en"]
          },
          knowsAbout: [
            "Custom Software Development",
            "Web Development",
            "Mobile App Development",
            "ERP Development",
            "Cloud DevOps",
            "UI/UX Design",
            "Quality Assurance"
          ],
          sameAs: (contact.socialLinks || []).map((link) => link.url).filter(Boolean)
        },
        {
          "@type": "WebSite",
          "@id": `${seo.siteUrl}/#website`,
          url: `${seo.siteUrl}/`,
          name: "Nutri Solutions",
          publisher: { "@id": ORG_ID },
          inLanguage: "en-IN"
        }
      ]
    };

    script.textContent = JSON.stringify(graph);
  }, [contact]);

  // Section-level page meta.
  useEffect(() => {
    const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    const isHome = segments.length === 0;
    const key = isHome ? "home" : segments[0];
    if (segments.length > 1 || !pageSeo[key]) return;

    applySeo({
      title: pageSeo[key].title,
      description: pageSeo[key].description,
      pathname,
      schema: isHome
        ? []
        : [
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: SECTION_NAMES[key] || pageSeo[key].title, path: `/${key}` }
            ])
          ]
    });
  }, [pathname]);

  return null;
};

export default SeoHead;
