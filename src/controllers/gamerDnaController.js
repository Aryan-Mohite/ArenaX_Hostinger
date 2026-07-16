import pool from "../config/db.js";

// ─── SAVE / UPDATE MY DNA ───────────────────────────────────────────────────
// POST /api/gamer-dna  { play_style, comms_pref, session_goal }
export const saveMyDna = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { play_style, comms_pref, session_goal } = req.body;

    const validStyles = ["casual", "balanced", "competitive"];
    const validComms  = ["voice", "text", "silent"];
    const validGoals  = ["unwind", "improve", "win", "socialize"];

    if (!validStyles.includes(play_style) || !validComms.includes(comms_pref) || !validGoals.includes(session_goal)) {
      return res.status(422).json({ success: false, message: "Invalid play_style, comms_pref, or session_goal" });
    }

    await pool.query(
      `INSERT INTO user_gamer_dna (user_id, play_style, comms_pref, session_goal)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE play_style=VALUES(play_style), comms_pref=VALUES(comms_pref), session_goal=VALUES(session_goal)`,
      [userId, play_style, comms_pref, session_goal]
    );

    const [rows] = await pool.query("SELECT * FROM user_gamer_dna WHERE user_id = ?", [userId]);
    res.json({ success: true, dna: rows[0] });
  } catch (err) { next(err); }
};

// ─── GET MY DNA ──────────────────────────────────────────────────────────────
// GET /api/gamer-dna/me
export const getMyDna = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM user_gamer_dna WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, dna: rows[0] || null });
  } catch (err) { next(err); }
};

// ─── GET CANDIDATE CARDS ─────────────────────────────────────────────────────
// GET /api/gamer-dna/candidates?game_id=&limit=20
// Excludes: self, anyone already swiped on (either direction), users with no DNA set.
// Ranks by number of matching DNA traits (playstyle/comms/goal) — simple,
// transparent scoring rather than a black-box similarity model.
export const getCandidates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { game_id } = req.query;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const [mine] = await pool.query("SELECT * FROM user_gamer_dna WHERE user_id = ?", [userId]);
    if (mine.length === 0) {
      return res.status(400).json({ success: false, message: "Complete your Gamer DNA profile before browsing candidates" });
    }
    const my = mine[0];

    let query = `
      SELECT u.user_id, u.username, u.profile_picture, u.region, u.bio,
             dna.play_style, dna.comms_pref, dna.session_goal,
             ugp.rank AS game_rank, ugp.elo_rating, ugp.\`role\` AS game_role,
             (
               (dna.play_style   = ?) +
               (dna.comms_pref   = ?) +
               (dna.session_goal = ?)
             ) AS match_score
      FROM users u
      JOIN user_gamer_dna dna ON dna.user_id = u.user_id
      LEFT JOIN user_game_profile ugp ON ugp.user_id = u.user_id ${game_id ? "AND ugp.game_id = ?" : ""}
      WHERE u.user_id != ?
        AND u.status = 'active'
        AND u.user_id NOT IN (
          SELECT target_id FROM swipe_actions WHERE swiper_id = ?
        )
    `;
    const params = [my.play_style, my.comms_pref, my.session_goal];
    if (game_id) params.push(game_id);
    params.push(userId, userId);

    if (game_id) { query += " AND ugp.game_id = ?"; params.push(game_id); }

    query += " ORDER BY match_score DESC, u.user_id ASC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, candidates: rows });
  } catch (err) { next(err); }
};

// ─── SWIPE ───────────────────────────────────────────────────────────────────
// POST /api/gamer-dna/swipe  { target_id, action: 'like' | 'pass' }
// On mutual 'like', creates a swipe_match (order-normalized pair) and returns it.
export const swipe = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { target_id, action } = req.body;

    if (!target_id || Number(target_id) === userId) {
      conn.release();
      return res.status(400).json({ success: false, message: "Invalid target_id" });
    }
    if (!["like", "pass"].includes(action)) {
      conn.release();
      return res.status(422).json({ success: false, message: "action must be 'like' or 'pass'" });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO swipe_actions (swiper_id, target_id, action) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE action = VALUES(action)`,
      [userId, target_id, action]
    );

    let match = null;
    if (action === "like") {
      const [reverse] = await conn.query(
        "SELECT 1 FROM swipe_actions WHERE swiper_id = ? AND target_id = ? AND action = 'like'",
        [target_id, userId]
      );
      if (reverse.length > 0) {
        const userA = Math.min(userId, Number(target_id));
        const userB = Math.max(userId, Number(target_id));
        await conn.query(
          `INSERT INTO swipe_matches (user_a_id, user_b_id) VALUES (?,?)
           ON DUPLICATE KEY UPDATE match_id = match_id`,
          [userA, userB]
        );
        const [rows] = await conn.query(
          "SELECT * FROM swipe_matches WHERE user_a_id = ? AND user_b_id = ?",
          [userA, userB]
        );
        match = rows[0];
      }
    }

    await conn.commit();
    res.json({ success: true, matched: !!match, match });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// ─── GET MY MATCHES ──────────────────────────────────────────────────────────
// GET /api/gamer-dna/matches
export const getMyMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT sm.match_id, sm.created_at,
              u.user_id, u.username, u.profile_picture, u.region
       FROM swipe_matches sm
       JOIN users u ON u.user_id = IF(sm.user_a_id = ?, sm.user_b_id, sm.user_a_id)
       WHERE sm.user_a_id = ? OR sm.user_b_id = ?
       ORDER BY sm.created_at DESC`,
      [userId, userId, userId]
    );
    res.json({ success: true, matches: rows });
  } catch (err) { next(err); }
};
