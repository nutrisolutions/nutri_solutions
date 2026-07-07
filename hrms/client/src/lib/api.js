import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

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

export const adminLogin = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const unifiedLogin = (email, password) =>
  api.post("/api/auth/unified-login", { email, password }).then((r) => r.data);

export const adminMe = () => api.get("/api/auth/me").then((r) => r.data.admin);

export const adminDepartments = {
  list: () => api.get("/api/admin/departments").then((r) => r.data.departments),
  create: (data) => api.post("/api/admin/departments", data).then((r) => r.data.department),
  update: (id, data) => api.put(`/api/admin/departments/${id}`, data).then((r) => r.data.department),
  remove: (id) => api.delete(`/api/admin/departments/${id}`)
};

export const adminEmployees = {
  list: (params) => api.get("/api/admin/employees", { params }).then((r) => r.data.employees),
  listResignations: (params) => api.get("/api/admin/employees/resignations", { params }).then((r) => r.data.employees),
  get: (id) => api.get(`/api/admin/employees/${id}`).then((r) => r.data),
  create: (data) => api.post("/api/admin/employees", data).then((r) => r.data),
  resetPassword: (id) => api.post(`/api/admin/employees/${id}/reset-password`).then((r) => r.data),
  listInterviews: (id) => api.get(`/api/admin/employees/${id}/interviews`).then((r) => r.data.interviews),
  scheduleInterview: (id, data) => api.post(`/api/admin/employees/${id}/interviews`, data).then((r) => r.data),
  markSelected: (id, note) => api.put(`/api/admin/employees/${id}/select`, { note }).then((r) => r.data.employee),
  generatePayslip: (id, data) => api.post(`/api/admin/employees/${id}/payslips`, data).then((r) => r.data.companyDocument),
  generateAppraisal: (id, data) => api.post(`/api/admin/employees/${id}/appraisals`, data).then((r) => r.data),
  requestDocuments: (id, labels) =>
    api.post(`/api/admin/employees/${id}/documents`, { labels }).then((r) => r.data.documents),
  reviewDocument: (employeeId, docId, decision, rejectionReason) =>
    api
      .put(`/api/admin/employees/${employeeId}/documents/${docId}/review`, { decision, rejectionReason })
      .then((r) => r.data),
  generateOffer: (id, details) =>
    api.post(`/api/admin/employees/${id}/offer`, details).then((r) => r.data.employee),
  sendOffer: (id) => api.post(`/api/admin/employees/${id}/offer/send`).then((r) => r.data.employee),
  sendCompanyDocument: (employeeId, docId) =>
    api.put(`/api/admin/employees/${employeeId}/company-documents/${docId}/send`).then((r) => r.data),
  startOnboarding: (id, checklist) =>
    api.put(`/api/admin/employees/${id}/onboarding/start`, { checklist }).then((r) => r.data.employee),
  updateOnboardingItem: (id, itemIndex, completed) =>
    api.put(`/api/admin/employees/${id}/onboarding/${itemIndex}`, { completed }).then((r) => r.data.employee),
  completeOnboarding: (id) => api.put(`/api/admin/employees/${id}/onboarding/complete`).then((r) => r.data.employee),
  setOnboardingLevel: (id, level) =>
    api.put(`/api/admin/employees/${id}/onboarding-level`, { level }).then((r) => r.data.employee),
  convertToPermanent: (id, level) =>
    api.put(`/api/admin/employees/${id}/convert-permanent`, { level }).then((r) => r.data.employee),
  setSuspended: (id, suspended) => api.put(`/api/admin/employees/${id}/suspend`, { suspended }).then((r) => r.data.employee),
  setTeamLead: (id, isTeamLead) => api.put(`/api/admin/employees/${id}/team-lead`, { isTeamLead }).then((r) => r.data.employee),
  setWorkEmail: (id, workEmail) => api.put(`/api/admin/employees/${id}/work-email`, { workEmail }).then((r) => r.data.employee),
  reviewResignation: (id, decision, { reviewNote, lastWorkingDay } = {}) =>
    api.put(`/api/admin/employees/${id}/resignation/review`, { decision, reviewNote, lastWorkingDay }).then((r) => r.data.employee),
  terminate: (id, reason) => api.post(`/api/admin/employees/${id}/terminate`, { reason }).then((r) => r.data.employee),
  remove: (id) => api.delete(`/api/admin/employees/${id}`)
};

export const adminCalendar = {
  list: (month, year) => api.get("/api/admin/calendar-events", { params: { month, year } }).then((r) => r.data.events),
  create: (data) => api.post("/api/admin/calendar-events", data).then((r) => r.data.event),
  update: (id, data) => api.put(`/api/admin/calendar-events/${id}`, data).then((r) => r.data.event),
  remove: (id) => api.delete(`/api/admin/calendar-events/${id}`)
};

export const adminTasks = {
  list: (params) => api.get("/api/admin/tasks", { params }).then((r) => r.data.tasks),
  create: (data) => api.post("/api/admin/tasks", data).then((r) => r.data.task),
  update: (id, data) => api.put(`/api/admin/tasks/${id}`, data).then((r) => r.data.task),
  remove: (id) => api.delete(`/api/admin/tasks/${id}`)
};

export const adminLeave = {
  listRequests: (params) => api.get("/api/admin/leave-requests", { params }).then((r) => r.data.requests),
  reviewRequest: (id, decision, reviewNote) =>
    api.put(`/api/admin/leave-requests/${id}/review`, { decision, reviewNote }).then((r) => r.data.request)
};

export const adminAttendance = {
  list: (params) => api.get("/api/admin/attendance", { params }).then((r) => r.data.records)
};

export const adminTimesheet = {
  list: (params) => api.get("/api/admin/timesheet", { params }).then((r) => r.data),
  export: (params) => api.get("/api/admin/timesheet/export", { params, responseType: "blob" }).then((r) => r.data)
};

export const adminTeams = {
  list: () => api.get("/api/admin/teams").then((r) => r.data.teams),
  create: (data) => api.post("/api/admin/teams", data).then((r) => r.data.team),
  update: (id, data) => api.put(`/api/admin/teams/${id}`, data).then((r) => r.data.team),
  remove: (id) => api.delete(`/api/admin/teams/${id}`)
};

export const adminAnnouncements = {
  list: () => api.get("/api/admin/announcements").then((r) => r.data.announcements),
  create: (data) => api.post("/api/admin/announcements", data).then((r) => r.data.announcement),
  remove: (id) => api.delete(`/api/admin/announcements/${id}`)
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

export const employeeUploadDocument = (docId, file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return employeeApi
    .post(`/api/employees/me/documents/${docId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (event) => {
            const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            onProgress(percent);
          }
        : undefined
    })
    .then((r) => r.data.document);
};

export const employeeOffer = () => employeeApi.get("/api/employees/me/offer").then((r) => r.data.employee);

export const employeeAcceptOffer = () => employeeApi.post("/api/employees/me/offer/accept").then((r) => r.data.employee);

export const employeeRejectOffer = (reason) =>
  employeeApi.post("/api/employees/me/offer/reject", { reason }).then((r) => r.data.employee);

export const employeeNotifications = () =>
  employeeApi.get("/api/employees/me/notifications").then((r) => r.data.notifications);

export const employeeMyTasks = () => employeeApi.get("/api/employees/me/tasks").then((r) => r.data.tasks);

export const employeeUpdateTaskStatus = (id, status) =>
  employeeApi.put(`/api/employees/me/tasks/${id}/status`, { status }).then((r) => r.data.task);

export const employeeLeaveSummary = () =>
  employeeApi.get("/api/employees/me/leave-summary").then((r) => r.data);

export const employeeMyLeaveRequests = () =>
  employeeApi.get("/api/employees/me/leave-requests").then((r) => r.data.requests);

export const employeeCreateLeaveRequest = (data) =>
  employeeApi.post("/api/employees/me/leave-requests", data).then((r) => r.data.request);

export const employeeCancelLeaveRequest = (id) =>
  employeeApi.put(`/api/employees/me/leave-requests/${id}/cancel`).then((r) => r.data.request);

export const employeeCalendarEvents = (month, year) =>
  employeeApi.get("/api/employees/me/calendar-events", { params: { month, year } }).then((r) => r.data.events);

export const employeeMyAnnouncements = () =>
  employeeApi.get("/api/employees/me/announcements").then((r) => r.data.announcements);

export const employeeMyLeadTeams = () => employeeApi.get("/api/employees/me/teams").then((r) => r.data.teams);

export const employeeCreateTeamTask = (teamId, data) =>
  employeeApi.post(`/api/employees/me/teams/${teamId}/tasks`, data).then((r) => r.data.task);

export const employeeCheckIn = () =>
  employeeApi.post("/api/employees/me/attendance/check-in").then((r) => r.data.attendance);

export const employeeTodayAttendance = () =>
  employeeApi.get("/api/employees/me/attendance/today").then((r) => r.data);

export const employeeMyAttendance = () =>
  employeeApi.get("/api/employees/me/attendance").then((r) => r.data.records);

export const employeeSubmitTimesheet = (workUpdate, date) =>
  employeeApi.post("/api/employees/me/timesheet", { workUpdate, date }).then((r) => r.data.entry);

export const employeeMyTimesheet = () =>
  employeeApi.get("/api/employees/me/timesheet").then((r) => r.data.entries);

export const employeeMyResignation = () =>
  employeeApi.get("/api/employees/me/resignation").then((r) => r.data);

export const employeeSubmitResignation = (reason, acceptedNotice) =>
  employeeApi.post("/api/employees/me/resignation", { reason, acceptedNotice }).then((r) => r.data.resignation);

export const employeeWithdrawResignation = () =>
  employeeApi.put("/api/employees/me/resignation/withdraw").then((r) => r.data.resignation);

export const employeeUpdateBankDetails = (bankDetails) =>
  employeeApi.put("/api/employees/me/bank-details", bankDetails).then((r) => r.data.bankDetails);

export const chatApi = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export const setChatAuthToken = (token) => {
  if (token) {
    chatApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete chatApi.defaults.headers.common.Authorization;
  }
};

export const chatDirectory = () => chatApi.get("/api/chat/directory").then((r) => r.data.directory);

export const chatConversations = () => chatApi.get("/api/chat/conversations").then((r) => r.data.conversations);

export const chatStartDm = (target) =>
  chatApi.post("/api/chat/conversations/dm", target).then((r) => r.data.conversation);

export const chatMessages = (conversationId, before) =>
  chatApi
    .get(`/api/chat/conversations/${conversationId}/messages`, { params: before ? { before } : {} })
    .then((r) => r.data.messages);

export const chatSendMessage = (conversationId, body) =>
  chatApi.post(`/api/chat/conversations/${conversationId}/messages`, { body }).then((r) => r.data.message);

export const chatSendAttachment = (conversationId, file, caption, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  return chatApi
    .post(`/api/chat/conversations/${conversationId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (event) => {
            const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            onProgress(percent);
          }
        : undefined
    })
    .then((r) => r.data.message);
};

export const chatMarkRead = (conversationId) =>
  chatApi.put(`/api/chat/conversations/${conversationId}/read`).then((r) => r.data);

export const adminChatGroups = {
  create: (title, members) => api.post("/api/admin/chat/groups", { title, members }).then((r) => r.data.conversation),
  update: (id, data) => api.put(`/api/admin/chat/groups/${id}`, data).then((r) => r.data.conversation),
  remove: (id) => api.delete(`/api/admin/chat/groups/${id}`),
  listAll: () => api.get("/api/admin/chat/groups").then((r) => r.data.groups),
  getAuditMessages: (id) => api.get(`/api/admin/chat/groups/${id}/messages`).then((r) => r.data)
};
