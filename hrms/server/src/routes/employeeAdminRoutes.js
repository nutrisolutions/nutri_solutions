import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  completeOnboarding,
  convertToPermanent,
  createEmployee,
  startOnboarding,
  deleteEmployee,
  generateAppraisal,
  generateOffer,
  generatePayslip,
  getEmployee,
  listEmployees,
  listResignations,
  requestDocuments,
  resetEmployeePassword,
  reviewDocument,
  reviewResignation,
  sendCompanyDocument,
  sendOffer,
  setOnboardingLevel,
  setSuspended,
  setTeamLead,
  setWorkEmail,
  terminateEmployee,
  updateOnboardingItem
} from "../controllers/employeeAdminController.js";
import { listInterviews, markSelected, scheduleInterview } from "../controllers/interviewAdminController.js";

const router = Router();

router.get("/", listEmployees);
router.post("/", requireRole("superadmin", "hr"), createEmployee);
router.get("/resignations", listResignations);
router.get("/:id", getEmployee);
router.post("/:id/reset-password", requireRole("superadmin", "hr"), resetEmployeePassword);
router.get("/:id/interviews", listInterviews);
router.post("/:id/interviews", requireRole("superadmin", "hr"), scheduleInterview);
router.put("/:id/select", requireRole("superadmin", "hr"), markSelected);
router.post("/:id/payslips", requireRole("superadmin", "hr"), generatePayslip);
router.post("/:id/appraisals", requireRole("superadmin", "hr"), generateAppraisal);
router.post("/:id/documents", requireRole("superadmin", "hr"), requestDocuments);
router.put("/:employeeId/documents/:docId/review", requireRole("superadmin", "hr"), reviewDocument);
router.post("/:id/offer", requireRole("superadmin", "hr"), generateOffer);
router.post("/:id/offer/send", requireRole("superadmin", "hr"), sendOffer);
router.put("/:employeeId/company-documents/:docId/send", requireRole("superadmin", "hr"), sendCompanyDocument);
router.put("/:id/onboarding/start", requireRole("superadmin", "hr"), startOnboarding);
router.put("/:id/onboarding/complete", requireRole("superadmin", "hr"), completeOnboarding);
router.put("/:id/onboarding/:itemIndex", requireRole("superadmin", "hr"), updateOnboardingItem);
router.put("/:id/onboarding-level", requireRole("superadmin", "hr"), setOnboardingLevel);
router.put("/:id/convert-permanent", requireRole("superadmin", "hr"), convertToPermanent);
router.put("/:id/suspend", requireRole("superadmin", "hr"), setSuspended);
router.put("/:id/team-lead", requireRole("superadmin", "hr"), setTeamLead);
router.put("/:id/work-email", requireRole("superadmin", "hr"), setWorkEmail);
router.put("/:id/resignation/review", requireRole("superadmin", "hr"), reviewResignation);
router.post("/:id/terminate", requireRole("superadmin", "hr"), terminateEmployee);
router.delete("/:id", requireRole("superadmin"), deleteEmployee);

export default router;
