const PATH_LABELS = {
  "/": "Home",
  "/about": "About",
  "/services": "Services",
  "/process": "About",
  "/projects": "Projects",
  "/portfolio": "Projects",
  "/contact": "Contact",
  "/blog": "Blog",
  "/admin": "Admin",
  "/admin/login": "Admin login",
  "/admin/analytics": "Analytics"
};

export const formatPathLabel = (path) => {
  if (!path || path === "/") return "Home";
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  if (path.startsWith("/projects/")) {
    const slug = path.replace("/projects/", "");
    return slug ? `Project: ${slug}` : "Project";
  }
  if (path.startsWith("/admin/")) return `Admin: ${path.replace("/admin/", "")}`;
  return path;
};

export const shortDate = (iso) => {
  const [, month, day] = iso.split("-");
  return `${month}/${day}`;
};
