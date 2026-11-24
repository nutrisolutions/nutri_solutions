import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import CareerApplyForm from "../components/careers/CareerApplyForm";
import { fetchCareer, isNotFoundError } from "../lib/api";
import usePageSeo from "../hooks/usePageSeo";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { breadcrumbSchema, ORG_ID, toDescription } from "../lib/seo";
import { seo } from "../data/content";

const EMPLOYMENT_TYPES = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
  intern: "INTERN",
  temporary: "TEMPORARY"
};

const careerSeo = (position, slug, contact) => {
  const path = `/careers/${slug}`;
  const description = toDescription(position.shortDescription || position.description);
  const employmentType = EMPLOYMENT_TYPES[String(position.employmentType || "").toLowerCase()];
  const isRemote = /remote/i.test(position.location || "");
  return {
    title: `${position.title} Job in ${position.location || "Hyderabad"} | Careers at Nutri Solutions`,
    description,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: position.title,
        description: [position.shortDescription, position.description, ...(position.requirements || [])]
          .filter(Boolean)
          .join("\n"),
        datePosted: position.publishedAt || position.createdAt,
        employmentType,
        hiringOrganization: {
          "@type": "Organization",
          "@id": ORG_ID,
          name: "Nutri Solutions Private Limited",
          sameAs: seo.siteUrl,
          logo: `${seo.siteUrl}/favicon-512.png`
        },
        jobLocationType: isRemote ? "TELECOMMUTE" : undefined,
        applicantLocationRequirements: isRemote ? { "@type": "Country", name: "India" } : undefined,
        jobLocation: isRemote
          ? undefined
          : {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                streetAddress: contact.streetAddress,
                addressLocality: contact.addressLocality || "Hyderabad",
                addressRegion: contact.addressRegion || "Telangana",
                postalCode: contact.postalCode,
                addressCountry: contact.addressCountry || "IN"
              }
            },
        directApply: true
      },
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Careers", path: "/careers" },
        { name: position.title, path }
      ])
    ]
  };
};

const CareerDetailPage = () => {
  const { slug } = useParams();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setMissing(false);
    fetchCareer(slug)
      .then(setPosition)
      .catch((error) => {
        setPosition(null);
        setNotFound(true);
        setMissing(isNotFoundError(error));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const contact = useSiteSettings();
  // On a transient API failure, leave the (prerendered) head alone instead of marking it noindex.
  usePageSeo(
    loading
      ? null
      : position && !notFound
        ? careerSeo(position, slug, contact)
        : missing
          ? {
              title: "Position not found | Careers at Nutri Solutions",
              description: "This position is no longer open. See current openings at Nutri Solutions.",
              noindex: true
            }
          : null
  );

  if (loading) {
    return (
      <section className="section careers-detail-section">
        <div className="container">
          <p>Loading position…</p>
        </div>
      </section>
    );
  }

  if (notFound || !position) {
    return (
      <section className="section careers-detail-section">
        <div className="container careers-detail-error">
          <h1>Position not found</h1>
          <Link to="/careers" className="btn btn-outline">
            <ArrowLeft size={18} /> Back to careers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section careers-detail-section section-compact-top">
      <div className="container">
        <Link to="/careers" className="careers-back-link">
          <ArrowLeft size={18} /> All open positions
        </Link>

        <div className="careers-detail-layout">
          <header className="careers-detail-main">
            <span className="career-card-dept">{position.department}</span>
            <h1>{position.title}</h1>
            <div className="career-detail-meta">
              <span>
                <MapPin size={16} /> {position.location}
              </span>
              <span>{position.employmentType}</span>
            </div>
            {position.shortDescription && <p className="career-detail-lead">{position.shortDescription}</p>}
            {position.description && (
              <div className="career-detail-body">
                <h2>About the role</h2>
                {position.description.split("\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
            {position.requirements?.length > 0 && (
              <div className="career-detail-requirements">
                <h2>What we're looking for</h2>
                <ul>
                  {position.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </header>

          <section className="careers-detail-apply" aria-labelledby="career-apply-heading">
            <CareerApplyForm slug={position.slug} positionTitle={position.title} />
          </section>
        </div>
      </div>
    </section>
  );
};

export default CareerDetailPage;
