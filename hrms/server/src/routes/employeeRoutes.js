import { Router } from "express";
import { requireEmployeeAuth } from "../middleware/auth.js";
import { handleUpload } from "../middleware/handleUpload.js";
import { uploadEmployeeDoc } from "../middleware/uploadDocuments.js";
import { employeeLogin, employeeSetPassword } from "../controllers/employeeAuthController.js";
import {
  acceptOffer,
  cancelMyLeaveRequest,
  checkInAttendance,
  createLeaveRequest,
  createTeamTask,
  getMe,
  getMyLeaveSummary,
  getMyResignation,
  getMyTodayAttendance,
  listCalendarEventsForEmployee,
  getOffer,
  listMyAnnouncements,
  listMyAttendance,
  listMyCompanyDocuments,
  listMyDocuments,
  listMyInterviews,
  listMyLeadTeams,
  listMyLeaveRequests,
  listMyNotifications,
  listMyTasks,
  listMyTimesheet,
  markNotificationRead,
  rejectOffer,
  submitMyTimesheet,
  submitResignation,
  updateMyBankDetails,
  updateMyTaskStatus,
  uploadMyDocument,
  withdrawResignation
} from "../controllers/employeePortalController.js";

const router = Router();

router.post("/login", employeeLogin);
router.post("/set-password", requireEmployeeAuth, employeeSetPassword);

router.get("/me", requireEmployeeAuth, getMe);

router.get("/me/interviews", requireEmployeeAuth, listMyInterviews);

router.get("/me/company-documents", requireEmployeeAuth, listMyCompanyDocuments);

router.get("/me/documents", requireEmployeeAuth, listMyDocuments);
router.post("/me/documents/:docId/upload", requireEmployeeAuth, handleUpload(uploadEmployeeDoc), uploadMyDocument);

router.get("/me/offer", requireEmployeeAuth, getOffer);
router.post("/me/offer/accept", requireEmployeeAuth, acceptOffer);
router.post("/me/offer/reject", requireEmployeeAuth, rejectOffer);

router.get("/me/notifications", requireEmployeeAuth, listMyNotifications);
router.put("/me/notifications/:id/read", requireEmployeeAuth, markNotificationRead);

router.get("/me/tasks", requireEmployeeAuth, listMyTasks);
router.put("/me/tasks/:id/status", requireEmployeeAuth, updateMyTaskStatus);

router.get("/me/leave-summary", requireEmployeeAuth, getMyLeaveSummary);
router.get("/me/leave-requests", requireEmployeeAuth, listMyLeaveRequests);
router.post("/me/leave-requests", requireEmployeeAuth, createLeaveRequest);
router.put("/me/leave-requests/:id/cancel", requireEmployeeAuth, cancelMyLeaveRequest);

router.get("/me/calendar-events", requireEmployeeAuth, listCalendarEventsForEmployee);
router.get("/me/announcements", requireEmployeeAuth, listMyAnnouncements);

router.get("/me/teams", requireEmployeeAuth, listMyLeadTeams);
router.post("/me/teams/:teamId/tasks", requireEmployeeAuth, createTeamTask);

router.post("/me/attendance/check-in", requireEmployeeAuth, checkInAttendance);
router.get("/me/attendance/today", requireEmployeeAuth, getMyTodayAttendance);
router.get("/me/attendance", requireEmployeeAuth, listMyAttendance);

router.post("/me/timesheet", requireEmployeeAuth, submitMyTimesheet);
router.get("/me/timesheet", requireEmployeeAuth, listMyTimesheet);

router.put("/me/bank-details", requireEmployeeAuth, updateMyBankDetails);

router.get("/me/resignation", requireEmployeeAuth, getMyResignation);
router.post("/me/resignation", requireEmployeeAuth, submitResignation);
router.put("/me/resignation/withdraw", requireEmployeeAuth, withdrawResignation);

export default router;
