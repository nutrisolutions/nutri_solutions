import { Router } from "express";
import { getBlogBySlug, listPublishedBlogs } from "../controllers/blogController.js";

const router = Router();

router.get("/", listPublishedBlogs);
router.get("/:slug", getBlogBySlug);

export default router;
