import { Router } from "express";
import { getHomepageContent } from "../controllers/contentController.js";

const router = Router();

router.get("/homepage", getHomepageContent);

export default router;
