import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const fetchProjects = (params) => api.get("/api/projects", { params }).then((r) => r.data.projects);

export const fetchProject = (slug) => api.get(`/api/projects/${slug}`).then((r) => r.data.project);

export const fetchBlogs = () => api.get("/api/blogs").then((r) => r.data.blogs);

export const fetchBlog = (slug) => api.get(`/api/blogs/${slug}`).then((r) => r.data.blog);

export const fetchTechStack = () => api.get("/api/tech-stack").then((r) => r.data.items);

export const fetchCareers = () => api.get("/api/careers").then((r) => r.data.positions);

export const fetchCareer = (slug) => api.get(`/api/careers/${slug}`).then((r) => r.data.position);

export const submitCareerApplication = (slug, data) =>
  api.post(`/api/careers/${slug}/apply`, data).then((r) => r.data);

export const submitContactInquiry = (data) => api.post("/api/contact", data).then((r) => r.data);

export const fetchSiteSettings = () => api.get("/api/content/settings").then((r) => r.data.settings);

export const adminLogin = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const adminMe = () => api.get("/api/auth/me").then((r) => r.data.admin);

export const adminProjects = {
  list: () => api.get("/api/admin/projects").then((r) => r.data.projects),
  create: (data) => api.post("/api/admin/projects", data).then((r) => r.data.project),
  update: (id, data) => api.put(`/api/admin/projects/${id}`, data).then((r) => r.data.project),
  remove: (id) => api.delete(`/api/admin/projects/${id}`)
};

export const adminBlogs = {
  list: () => api.get("/api/admin/blogs").then((r) => r.data.blogs),
  create: (data) => api.post("/api/admin/blogs", data).then((r) => r.data.blog),
  update: (id, data) => api.put(`/api/admin/blogs/${id}`, data).then((r) => r.data.blog),
  remove: (id) => api.delete(`/api/admin/blogs/${id}`)
};

export const adminTechStack = {
  list: () => api.get("/api/admin/tech-stack").then((r) => r.data.items),
  create: (data) => api.post("/api/admin/tech-stack", data).then((r) => r.data.item),
  update: (id, data) => api.put(`/api/admin/tech-stack/${id}`, data).then((r) => r.data.item),
  reorder: (ids) => api.put("/api/admin/tech-stack/reorder", { ids }).then((r) => r.data.items),
  remove: (id) => api.delete(`/api/admin/tech-stack/${id}`)
};

export const adminAnalytics = {
  summary: (days = 30) => api.get("/api/admin/analytics", { params: { days } }).then((r) => r.data)
};

export const adminCareers = {
  listPositions: () => api.get("/api/admin/careers/positions").then((r) => r.data.positions),
  createPosition: (data) => api.post("/api/admin/careers/positions", data).then((r) => r.data.position),
  updatePosition: (id, data) => api.put(`/api/admin/careers/positions/${id}`, data).then((r) => r.data.position),
  removePosition: (id) => api.delete(`/api/admin/careers/positions/${id}`),
  listApplications: (positionId) =>
    api.get(`/api/admin/careers/positions/${positionId}/applications`).then((r) => r.data),
  removeApplication: (id) => api.delete(`/api/admin/careers/applications/${id}`)
};

export const adminContact = {
  listInquiries: () => api.get("/api/admin/contact/inquiries").then((r) => r.data.inquiries),
  removeInquiry: (id) => api.delete(`/api/admin/contact/inquiries/${id}`)
};

export const adminSettings = {
  get: () => api.get("/api/admin/settings").then((r) => r.data.settings),
  update: (data) => api.put("/api/admin/settings", data).then((r) => r.data.settings)
};

export const adminUpload = {
  image: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/api/admin/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.url);
  },
  images: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api
      .post("/api/admin/upload/multiple", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.urls);
  }
};
