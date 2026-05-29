import { Router } from "express";
import { collectEvents } from "../controllers/analyticsController.js";

const router = Router();

router.post("/collect", collectEvents);

export default router;
