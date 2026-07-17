import { Router } from "express";
import { getMyAchievements } from "../controllers/achievementController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// All achievement routes require authentication
router.use(authMiddleware);

router.get("/me", getMyAchievements);

export default router;
