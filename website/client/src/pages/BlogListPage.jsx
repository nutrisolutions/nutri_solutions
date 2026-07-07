import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import { fetchBlogs } from "../lib/api";
import { pageHero } from "../data/content";

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero {...pageHero.blog} />
      <section id="blog-list" className="section blog-list-section section-compact-top">
        <div className="container">
          {loading ? (
            <p>Loading articles…</p>
          ) : blogs.length === 0 ? (
            <p className="blog-empty">No articles yet. Check back soon.</p>
          ) : (
            <div className="blog-grid">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  className="blog-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link to={`/blog/${blog.slug}`} className="blog-card-link">
                    {blog.coverImage && (
                      <div className="blog-card-image">
                        <img src={blog.coverImage} alt="" loading="lazy" />
                      </div>
                    )}
                    <div className="blog-card-body">
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt}</p>
                      <span className="blog-card-cta">
                        Read article <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogListPage;
