import { Router } from "express";
import { getHomepageContent } from "../controllers/contentController.js";
import { getPublicSettings } from "../controllers/settingsController.js";

const router = Router();

router.get("/homepage", getHomepageContent);
router.get("/settings", getPublicSettings);

export default router;
