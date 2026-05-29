import { Router } from "express";
import {
  getPositionBySlug,
  listPublishedPositions,
  submitApplication
} from "../controllers/careerController.js";

const router = Router();

router.get("/", listPublishedPositions);
router.get("/:slug", getPositionBySlug);
router.post("/:slug/apply", submitApplication);

export default router;
