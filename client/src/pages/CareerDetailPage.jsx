import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import CareerApplyForm from "../components/careers/CareerApplyForm";
import { fetchCareer } from "../lib/api";

const CareerDetailPage = () => {
  const { slug } = useParams();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchCareer(slug)
      .then(setPosition)
      .catch(() => {
        setPosition(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

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
