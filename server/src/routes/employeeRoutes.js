import { Router } from "express";
import { requireEmployeeAuth } from "../middleware/auth.js";
import { handleUpload } from "../controllers/uploadController.js";
import { uploadEmployeeDoc } from "../middleware/uploadDocuments.js";
import { employeeLogin, employeeSetPassword } from "../controllers/employeeAuthController.js";
import {
  acceptOffer,
  cancelMyLeaveRequest,
  createLeaveRequest,
  getMe,
  getOffer,
  listLeaveTypesForEmployee,
  listMyCompanyDocuments,
  listMyDocuments,
  listMyInterviews,
  listMyLeaveRequests,
  listMyNotifications,
  listMyTasks,
  markNotificationRead,
  updateMyTaskStatus,
  uploadMyDocument
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

router.get("/me/notifications", requireEmployeeAuth, listMyNotifications);
router.put("/me/notifications/:id/read", requireEmployeeAuth, markNotificationRead);

router.get("/me/tasks", requireEmployeeAuth, listMyTasks);
router.put("/me/tasks/:id/status", requireEmployeeAuth, updateMyTaskStatus);

router.get("/me/leave-types", requireEmployeeAuth, listLeaveTypesForEmployee);
router.get("/me/leave-requests", requireEmployeeAuth, listMyLeaveRequests);
router.post("/me/leave-requests", requireEmployeeAuth, createLeaveRequest);
router.put("/me/leave-requests/:id/cancel", requireEmployeeAuth, cancelMyLeaveRequest);

export default router;
