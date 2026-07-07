import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchBlogs } from "../../lib/api";
import SectionHeader from "../ui/SectionHeader";
import SectionPageLink from "./SectionPageLink";

const HomeBlogPreview = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs()
      .then((data) => setBlogs(data.slice(0, 3)))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="blog-preview" className="section section-muted home-blog-preview">
      <div className="container">
        <SectionHeader
          label="Insights"
          title="Thought leadership from our team"
          subtitle="Articles on tech stacks, agile delivery, product engineering, and building software that scales."
        />

        {loading ? (
          <p className="home-blog-loading">Loading articles…</p>
        ) : blogs.length === 0 ? (
          <p className="home-blog-empty">New articles coming soon. Check back for software development insights.</p>
        ) : (
          <div className="home-blog-grid">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog._id}
                className="home-blog-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link to={`/blog/${blog.slug}`} className="home-blog-card-link">
                  {blog.coverImage && (
                    <div className="home-blog-card-image">
                      <img src={blog.coverImage} alt="" loading="lazy" />
                    </div>
                  )}
                  <div className="home-blog-card-body">
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt}</p>
                    <span className="home-blog-card-cta">
                      Read article <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        <div className="home-section-footer">
          <SectionPageLink to="/blog">View all articles</SectionPageLink>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogPreview;
