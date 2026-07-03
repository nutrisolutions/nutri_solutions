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

export const adminLogin = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const unifiedLogin = (email, password) =>
  api.post("/api/auth/unified-login", { email, password }).then((r) => r.data);

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

export const adminDepartments = {
  list: () => api.get("/api/admin/departments").then((r) => r.data.departments),
  create: (data) => api.post("/api/admin/departments", data).then((r) => r.data.department),
  update: (id, data) => api.put(`/api/admin/departments/${id}`, data).then((r) => r.data.department),
  remove: (id) => api.delete(`/api/admin/departments/${id}`)
};

export const adminEmployees = {
  list: (params) => api.get("/api/admin/employees", { params }).then((r) => r.data.employees),
  get: (id) => api.get(`/api/admin/employees/${id}`).then((r) => r.data),
  create: (data) => api.post("/api/admin/employees", data).then((r) => r.data),
  createFromApplication: (applicationId, department) =>
    api.post(`/api/admin/employees/from-application/${applicationId}`, { department }).then((r) => r.data),
  resetPassword: (id) => api.post(`/api/admin/employees/${id}/reset-password`).then((r) => r.data),
  listInterviews: (id) => api.get(`/api/admin/employees/${id}/interviews`).then((r) => r.data.interviews),
  scheduleInterview: (id, data) => api.post(`/api/admin/employees/${id}/interviews`, data).then((r) => r.data),
  markSelected: (id, note) => api.put(`/api/admin/employees/${id}/select`, { note }).then((r) => r.data.employee),
  uploadCompanyDocument: (id, { type, label, periodMonth, periodYear, file }) => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("label", label);
    if (periodMonth) formData.append("periodMonth", periodMonth);
    if (periodYear) formData.append("periodYear", periodYear);
    formData.append("file", file);
    return api
      .post(`/api/admin/employees/${id}/company-documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((r) => r.data.companyDocument);
  },
  requestDocuments: (id, labels) =>
    api.post(`/api/admin/employees/${id}/documents`, { labels }).then((r) => r.data.documents),
  reviewDocument: (employeeId, docId, decision, rejectionReason) =>
    api
      .put(`/api/admin/employees/${employeeId}/documents/${docId}/review`, { decision, rejectionReason })
      .then((r) => r.data),
  sendOffer: (id, offerLetterFile, joiningLetterFile) => {
    const formData = new FormData();
    formData.append("offerLetter", offerLetterFile);
    formData.append("joiningLetter", joiningLetterFile);
    return api
      .post(`/api/admin/employees/${id}/offer`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.employee);
  },
  startOnboarding: (id, checklist) =>
    api.put(`/api/admin/employees/${id}/onboarding/start`, { checklist }).then((r) => r.data.employee),
  updateOnboardingItem: (id, itemIndex, completed) =>
    api.put(`/api/admin/employees/${id}/onboarding/${itemIndex}`, { completed }).then((r) => r.data.employee),
  completeOnboarding: (id) => api.put(`/api/admin/employees/${id}/onboarding/complete`).then((r) => r.data.employee),
  convertToPermanent: (id) => api.put(`/api/admin/employees/${id}/convert-permanent`).then((r) => r.data.employee),
  remove: (id) => api.delete(`/api/admin/employees/${id}`)
};

export const adminTasks = {
  list: (params) => api.get("/api/admin/tasks", { params }).then((r) => r.data.tasks),
  create: (data) => api.post("/api/admin/tasks", data).then((r) => r.data.task),
  update: (id, data) => api.put(`/api/admin/tasks/${id}`, data).then((r) => r.data.task),
  remove: (id) => api.delete(`/api/admin/tasks/${id}`)
};

export const adminLeave = {
  listTypes: () => api.get("/api/admin/leave-types").then((r) => r.data.leaveTypes),
  createType: (data) => api.post("/api/admin/leave-types", data).then((r) => r.data.leaveType),
  updateType: (id, data) => api.put(`/api/admin/leave-types/${id}`, data).then((r) => r.data.leaveType),
  listRequests: (params) => api.get("/api/admin/leave-requests", { params }).then((r) => r.data.requests),
  reviewRequest: (id, decision, reviewNote) =>
    api.put(`/api/admin/leave-requests/${id}/review`, { decision, reviewNote }).then((r) => r.data.request)
};

const employeeApi = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export const setEmployeeAuthToken = (token) => {
  if (token) {
    employeeApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete employeeApi.defaults.headers.common.Authorization;
  }
};

export const employeeLogin = (email, password) =>
  employeeApi.post("/api/employees/login", { email, password }).then((r) => r.data);

export const employeeSetPassword = (currentPassword, newPassword) =>
  employeeApi.post("/api/employees/set-password", { currentPassword, newPassword }).then((r) => r.data);

export const employeeMe = () => employeeApi.get("/api/employees/me").then((r) => r.data.employee);

export const employeeMyInterviews = () => employeeApi.get("/api/employees/me/interviews").then((r) => r.data.interviews);

export const employeeMyDocuments = () => employeeApi.get("/api/employees/me/documents").then((r) => r.data.documents);

export const employeeMyCompanyDocuments = () =>
  employeeApi.get("/api/employees/me/company-documents").then((r) => r.data.companyDocuments);

export const employeeUploadDocument = (docId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return employeeApi
    .post(`/api/employees/me/documents/${docId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then((r) => r.data.document);
};

export const employeeOffer = () => employeeApi.get("/api/employees/me/offer").then((r) => r.data.employee);

export const employeeAcceptOffer = () => employeeApi.post("/api/employees/me/offer/accept").then((r) => r.data.employee);

export const employeeNotifications = () =>
  employeeApi.get("/api/employees/me/notifications").then((r) => r.data.notifications);

export const employeeMyTasks = () => employeeApi.get("/api/employees/me/tasks").then((r) => r.data.tasks);

export const employeeUpdateTaskStatus = (id, status) =>
  employeeApi.put(`/api/employees/me/tasks/${id}/status`, { status }).then((r) => r.data.task);

export const employeeLeaveTypes = () =>
  employeeApi.get("/api/employees/me/leave-types").then((r) => r.data.leaveTypes);

export const employeeMyLeaveRequests = () =>
  employeeApi.get("/api/employees/me/leave-requests").then((r) => r.data.requests);

export const employeeCreateLeaveRequest = (data) =>
  employeeApi.post("/api/employees/me/leave-requests", data).then((r) => r.data.request);

export const employeeCancelLeaveRequest = (id) =>
  employeeApi.put(`/api/employees/me/leave-requests/${id}/cancel`).then((r) => r.data.request);

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
