import { Router } from "express";
import { login, me, unifiedLogin } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/unified-login", unifiedLogin);
router.get("/me", requireAuth, me);

export default router;
