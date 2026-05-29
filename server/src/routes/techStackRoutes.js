import { Router } from "express";
import { listPublishedTechStack } from "../controllers/techStackController.js";

const router = Router();

router.get("/", listPublishedTechStack);

export default router;
