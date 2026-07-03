import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createProject,
  deleteProject,
  listAllProjects,
  updateProject
} from "../controllers/projectController.js";
import {
  createBlog,
  deleteBlog,
  listAllBlogs,
  updateBlog
} from "../controllers/blogController.js";
import {
  createTechStack,
  deleteTechStack,
  listAllTechStack,
  reorderTechStack,
  updateTechStack
} from "../controllers/techStackController.js";
import { getAnalyticsSummary } from "../controllers/analyticsController.js";
import {
  createPosition,
  deleteApplication,
  deletePosition,
  listAllPositions,
  listApplicationsForPosition,
  updatePosition
} from "../controllers/careerController.js";
import { deleteInquiry, listInquiries } from "../controllers/contactController.js";
import { handleUpload, uploadImage, uploadImages } from "../controllers/uploadController.js";
import { uploadMultiple, uploadSingle } from "../middleware/upload.js";
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment
} from "../controllers/departmentController.js";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskAdminController.js";
import {
  createLeaveType,
  listLeaveRequests,
  listLeaveTypes,
  reviewLeaveRequest,
  updateLeaveType
} from "../controllers/leaveAdminController.js";
import employeeAdminRoutes from "./employeeAdminRoutes.js";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent
} from "../controllers/calendarAdminController.js";

const router = Router();

router.use(requireAuth);

router.get("/analytics", getAnalyticsSummary);

router.post("/upload", handleUpload(uploadSingle), uploadImage);
router.post("/upload/multiple", handleUpload(uploadMultiple), uploadImages);

router.get("/projects", listAllProjects);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

router.get("/blogs", listAllBlogs);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

router.get("/tech-stack", listAllTechStack);
router.put("/tech-stack/reorder", reorderTechStack);
router.post("/tech-stack", createTechStack);
router.put("/tech-stack/:id", updateTechStack);
router.delete("/tech-stack/:id", deleteTechStack);

router.get("/careers/positions", listAllPositions);
router.post("/careers/positions", createPosition);
router.put("/careers/positions/:id", updatePosition);
router.delete("/careers/positions/:id", deletePosition);
router.get("/careers/positions/:id/applications", listApplicationsForPosition);
router.delete("/careers/applications/:id", deleteApplication);

router.get("/contact/inquiries", listInquiries);
router.delete("/contact/inquiries/:id", deleteInquiry);

router.get("/departments", listDepartments);
router.post("/departments", requireRole("superadmin", "hr"), createDepartment);
router.put("/departments/:id", requireRole("superadmin", "hr"), updateDepartment);
router.delete("/departments/:id", requireRole("superadmin", "hr"), deleteDepartment);

router.use("/employees", employeeAdminRoutes);

router.get("/tasks", listTasks);
router.post("/tasks", requireRole("superadmin", "hr", "manager"), createTask);
router.put("/tasks/:id", requireRole("superadmin", "hr", "manager"), updateTask);
router.delete("/tasks/:id", requireRole("superadmin", "hr"), deleteTask);

router.get("/leave-types", listLeaveTypes);
router.post("/leave-types", requireRole("superadmin", "hr"), createLeaveType);
router.put("/leave-types/:id", requireRole("superadmin", "hr"), updateLeaveType);

router.get("/leave-requests", listLeaveRequests);
router.put("/leave-requests/:id/review", requireRole("superadmin", "hr", "manager"), reviewLeaveRequest);

router.get("/calendar-events", listCalendarEvents);
router.post("/calendar-events", requireRole("superadmin", "hr"), createCalendarEvent);
router.put("/calendar-events/:id", requireRole("superadmin", "hr"), updateCalendarEvent);
router.delete("/calendar-events/:id", requireRole("superadmin", "hr"), deleteCalendarEvent);

export default router;
