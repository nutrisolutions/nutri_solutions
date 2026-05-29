import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SectionPageLink = ({ to, children }) => (
  <Link to={to} className="home-section-link">
    {children} <ArrowRight size={18} />
  </Link>
);

export default SectionPageLink;
