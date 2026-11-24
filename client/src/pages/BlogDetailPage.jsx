import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { fetchBlog, isNotFoundError } from "../lib/api";
import usePageSeo from "../hooks/usePageSeo";
import { breadcrumbSchema, canonicalUrl, fitTitle, ORG_ID, toDescription } from "../lib/seo";

const blogSeo = (blog, slug) => {
  const path = `/blog/${slug}`;
  const description = toDescription(blog.excerpt || blog.content);
  const isTeam = !blog.author || /nutri solutions/i.test(blog.author);
  return {
    title: fitTitle(`${blog.title} | Nutri Solutions Blog`, `${blog.title} | Nutri Solutions`, blog.title),
    description,
    type: "article",
    image: blog.coverImage || undefined,
    imageAlt: blog.title,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description,
        image: blog.coverImage ? [blog.coverImage] : undefined,
        datePublished: blog.publishedAt || blog.createdAt,
        dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
        author: isTeam
          ? { "@id": ORG_ID }
          : { "@type": "Person", name: blog.author },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: canonicalUrl(path),
        inLanguage: "en-IN"
      },
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: blog.title, path }
      ])
    ]
  };
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMissing(false);
    fetchBlog(slug)
      .then(setBlog)
      .catch((error) => {
        setBlog(null);
        setMissing(isNotFoundError(error));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // On a transient API failure, leave the (prerendered) head alone instead of marking it noindex.
  usePageSeo(
    loading
      ? null
      : blog
        ? blogSeo(blog, slug)
        : missing
          ? {
              title: "Article not found | Nutri Solutions Blog",
              description: "This article could not be found. Browse all articles on the Nutri Solutions blog.",
              noindex: true
            }
          : null
  );

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
          <img src={blog.coverImage} alt={`Cover image for ${blog.title}`} />
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
