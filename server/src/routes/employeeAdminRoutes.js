import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  completeOnboarding,
  convertToPermanent,
  createEmployee,
  createEmployeeFromApplication,
  deleteEmployee,
  generateAppraisal,
  generateOffer,
  generatePayslip,
  getEmployee,
  listEmployees,
  requestDocuments,
  resetEmployeePassword,
  reviewDocument,
  startOnboarding,
  updateOnboardingItem
} from "../controllers/employeeAdminController.js";
import { listInterviews, markSelected, scheduleInterview } from "../controllers/interviewAdminController.js";

const router = Router();

router.get("/", listEmployees);
router.post("/", requireRole("superadmin", "hr"), createEmployee);
router.get("/:id", getEmployee);
router.post("/from-application/:applicationId", requireRole("superadmin", "hr"), createEmployeeFromApplication);
router.post("/:id/reset-password", requireRole("superadmin", "hr"), resetEmployeePassword);
router.get("/:id/interviews", listInterviews);
router.post("/:id/interviews", requireRole("superadmin", "hr"), scheduleInterview);
router.put("/:id/select", requireRole("superadmin", "hr"), markSelected);
router.post("/:id/payslips", requireRole("superadmin", "hr"), generatePayslip);
router.post("/:id/appraisals", requireRole("superadmin", "hr"), generateAppraisal);
router.post("/:id/documents", requireRole("superadmin", "hr"), requestDocuments);
router.put("/:employeeId/documents/:docId/review", requireRole("superadmin", "hr"), reviewDocument);
router.post("/:id/offer", requireRole("superadmin", "hr"), generateOffer);
router.put("/:id/onboarding/start", requireRole("superadmin", "hr"), startOnboarding);
router.put("/:id/onboarding/complete", requireRole("superadmin", "hr"), completeOnboarding);
router.put("/:id/onboarding/:itemIndex", requireRole("superadmin", "hr"), updateOnboardingItem);
router.put("/:id/convert-permanent", requireRole("superadmin", "hr"), convertToPermanent);
router.delete("/:id", requireRole("superadmin"), deleteEmployee);

export default router;
