import { Router } from "express";
import {
  getTeamMessages, sendTeamMessage, markTeamRead,
  getDmMessages,   sendDmMessage,   markDmRead,
  getUnreadCounts,
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// Unread badge counts (lightweight — poll every 30s)
router.get("/unread", getUnreadCounts);

// Team group chat
router.get("/team/:teamId/messages", getTeamMessages);
router.post("/team/:teamId/messages", sendTeamMessage);
router.put("/team/:teamId/read",     markTeamRead);

// DM (draft-accept) chat
router.get("/dm/:appId/messages", getDmMessages);
router.post("/dm/:appId/messages", sendDmMessage);
router.put("/dm/:appId/read",     markDmRead);

export default router;
