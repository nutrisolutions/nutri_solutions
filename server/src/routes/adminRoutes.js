import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
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

export default router;
