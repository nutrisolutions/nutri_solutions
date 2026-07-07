import { Router } from "express";
import { requireChatAuth } from "../middleware/chatAuth.js";
import { handleUpload } from "../middleware/handleUpload.js";
import { uploadChatAttachment } from "../middleware/uploadChatAttachment.js";
import {
  getDirectory,
  getMessages,
  listConversations,
  markRead,
  postAttachmentMessage,
  postMessage,
  startDm
} from "../controllers/chatController.js";

const router = Router();

router.use(requireChatAuth);

router.get("/directory", getDirectory);
router.get("/conversations", listConversations);
router.post("/conversations/dm", startDm);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", postMessage);
router.post("/conversations/:id/attachments", handleUpload(uploadChatAttachment), postAttachmentMessage);
router.put("/conversations/:id/read", markRead);

export default router;
