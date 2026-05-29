import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, MapPin } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { fetchCareers } from "../../lib/api";
import { careersContent } from "../../data/content";

const CareersOpenPositions = () => {
  const { openings } = careersContent;
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareers()
      .then(setPositions)
      .catch(() => setPositions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="open-positions" className="section careers-openings section-muted">
      <div className="container">
        <SectionHeader label={openings.label} title={openings.title} subtitle={openings.subtitle} />

        {loading ? (
          <p className="careers-loading">Loading open positions…</p>
        ) : positions.length === 0 ? (
          <div className="careers-empty">
            <Briefcase size={40} aria-hidden />
            <h3>No open roles right now</h3>
            <p>We're not actively hiring for listed positions, but we'd still love to hear from you.</p>
            <Link to="/contact" className="btn btn-primary">
              Send your profile
            </Link>
          </div>
        ) : (
          <div className="careers-grid">
            {positions.map((job, index) => (
              <motion.article
                key={job._id}
                className="career-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Link to={`/careers/${job.slug}`} className="career-card-link">
                  <span className="career-card-dept">{job.department}</span>
                  <h3>{job.title}</h3>
                  <p>{job.shortDescription}</p>
                  <div className="career-card-meta">
                    <span>
                      <MapPin size={14} /> {job.location}
                    </span>
                    <span>{job.employmentType}</span>
                  </div>
                  <span className="career-card-cta">
                    View & apply <ArrowUpRight size={16} />
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CareersOpenPositions;
