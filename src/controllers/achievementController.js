import { getAchievementsForUser } from "../services/achievementService.js";

// ─── GET MY ACHIEVEMENTS ──────────────────────────────────────────────────────
// GET /api/achievements/me
// Returns { achieved: [...], locked: [...], streak: { current_streak, longest_streak } }
export const getMyAchievements = async (req, res, next) => {
  try {
    const data = await getAchievementsForUser(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
};
