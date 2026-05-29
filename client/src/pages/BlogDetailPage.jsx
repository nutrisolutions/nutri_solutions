import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { fetchBlog } from "../lib/api";
import { pageSeo } from "../data/content";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog(slug)
      .then(setBlog)
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
    return () => {
      document.title = pageSeo.home.title;
    };
  }, [slug]);

  useEffect(() => {
    if (blog) document.title = `${blog.title} | Nutri Solutions Blog`;
  }, [blog]);

  if (loading) return <div className="container blog-detail-loading">Loading…</div>;
  if (!blog) {
    return (
      <div className="container blog-detail-error">
        <h1>Article not found</h1>
        <Link to="/blog">Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="blog-detail-page">
      {blog.coverImage && (
        <div className="blog-detail-cover">
          <img src={blog.coverImage} alt="" />
          <div className="blog-detail-cover-overlay" />
        </div>
      )}
      <div className="container blog-detail-body">
        <Link to="/blog" className="project-back-link">
          <ArrowLeft size={18} /> All articles
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-label">BLOG</span>
          <h1>{blog.title}</h1>
          <p className="blog-detail-meta">By {blog.author}</p>
        </motion.div>
        <div className="blog-detail-content">
          {blog.content.split("\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogDetailPage;
