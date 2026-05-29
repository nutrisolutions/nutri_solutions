import { Router } from "express";
import { submitInquiry } from "../controllers/contactController.js";

const router = Router();

router.post("/", submitInquiry);

export default router;
