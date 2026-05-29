import { Router } from "express";
import { getProjectBySlug, listPublishedProjects } from "../controllers/projectController.js";

const router = Router();

router.get("/", listPublishedProjects);
router.get("/:slug", getProjectBySlug);

export default router;
