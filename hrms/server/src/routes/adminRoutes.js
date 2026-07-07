import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment
} from "../controllers/departmentController.js";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskAdminController.js";
import { listLeaveRequests, reviewLeaveRequest } from "../controllers/leaveAdminController.js";
import { listAttendance } from "../controllers/attendanceAdminController.js";
import { exportTimesheet, listTimesheet } from "../controllers/timesheetAdminController.js";
import employeeAdminRoutes from "./employeeAdminRoutes.js";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent
} from "../controllers/calendarAdminController.js";
import {
  createGroup,
  deleteGroup,
  getGroupMessagesForAudit,
  listAllGroups,
  updateGroup
} from "../controllers/chatGroupAdminController.js";
import { createTeam, deleteTeam, listTeams, updateTeam } from "../controllers/teamAdminController.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements
} from "../controllers/announcementAdminController.js";

const router = Router();

router.use(requireAuth);

router.get("/departments", listDepartments);
router.post("/departments", requireRole("superadmin", "hr"), createDepartment);
router.put("/departments/:id", requireRole("superadmin", "hr"), updateDepartment);
router.delete("/departments/:id", requireRole("superadmin", "hr"), deleteDepartment);

router.use("/employees", employeeAdminRoutes);

router.get("/tasks", listTasks);
router.post("/tasks", requireRole("superadmin", "hr", "manager"), createTask);
router.put("/tasks/:id", requireRole("superadmin", "hr", "manager"), updateTask);
router.delete("/tasks/:id", requireRole("superadmin", "hr"), deleteTask);

router.get("/leave-requests", listLeaveRequests);
router.get("/attendance", listAttendance);

router.get("/timesheet", requireRole("superadmin", "hr"), listTimesheet);
router.get("/timesheet/export", requireRole("superadmin", "hr"), exportTimesheet);
router.put("/leave-requests/:id/review", requireRole("superadmin", "hr", "manager"), reviewLeaveRequest);

router.get("/calendar-events", listCalendarEvents);
router.post("/calendar-events", requireRole("superadmin", "hr"), createCalendarEvent);
router.put("/calendar-events/:id", requireRole("superadmin", "hr"), updateCalendarEvent);
router.delete("/calendar-events/:id", requireRole("superadmin", "hr"), deleteCalendarEvent);

router.post("/chat/groups", requireRole("superadmin", "hr"), createGroup);
router.put("/chat/groups/:id", requireRole("superadmin", "hr"), updateGroup);
router.delete("/chat/groups/:id", requireRole("superadmin", "hr"), deleteGroup);
router.get("/chat/groups", listAllGroups);
router.get("/chat/groups/:id/messages", getGroupMessagesForAudit);

router.get("/teams", listTeams);
router.post("/teams", requireRole("superadmin", "hr"), createTeam);
router.put("/teams/:id", requireRole("superadmin", "hr"), updateTeam);
router.delete("/teams/:id", requireRole("superadmin", "hr"), deleteTeam);

router.get("/announcements", listAnnouncements);
router.post("/announcements", requireRole("superadmin", "hr"), createAnnouncement);
router.delete("/announcements/:id", requireRole("superadmin", "hr"), deleteAnnouncement);

export default router;
