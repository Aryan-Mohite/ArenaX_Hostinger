import pool from "../config/db.js";

// ─── Retention policy ─────────────────────────────────────────────────────────
// Change this to 15 if you prefer a 15-day window.
// Keep in sync with RETENTION_DAYS in frontend/src/components/ChatDrawer.jsx
const RETENTION_DAYS = 7;

/**
 * Deletes messages older than RETENTION_DAYS from both chat tables.
 * Called fire-and-forget with a 10 % probability on every message fetch
 * so no cron job is needed. Errors are swallowed — this is best-effort cleanup.
 */
async function pruneOldMessages() {
  try {
    await pool.query(
      `DELETE FROM team_messages WHERE sent_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [RETENTION_DAYS]
    );
    await pool.query(
      `DELETE FROM dm_messages WHERE sent_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [RETENTION_DAYS]
    );
  } catch (_) {
    // Silent — pruning is non-critical
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Ensure the requesting user is an active member of a team. */
async function assertTeamMember(userId, teamId) {
  const [rows] = await pool.query(
    `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, userId]
  );
  return rows.length > 0;
}

/**
 * Verify the user can access a DM chat for an application.
 * Returns the application row or null if unauthorised / not draft_accepted.
 */
async function getDmAccess(userId, applicationId) {
  const [rows] = await pool.query(
    `SELECT tfa.application_id, tfa.user_id AS applicant_id,
            tfp.user_id AS post_owner_id, tfa.status
     FROM   team_finder_applications tfa
     JOIN   team_finder_posts tfp ON tfp.post_id = tfa.post_id
     WHERE  tfa.application_id = ?`,
    [applicationId]
  );
  if (!rows.length) return null;
  const app = rows[0];
  if (app.status !== "draft_accepted") return null;
  if (app.applicant_id !== userId && app.post_owner_id !== userId) return null;
  return app;
}

// ─── TEAM CHAT ────────────────────────────────────────────────────────────────

/** GET /api/chat/team/:teamId/messages?after=0&limit=50 */
export const getTeamMessages = async (req, res, next) => {
  try {
    const teamId = Number(req.params.teamId);
    const after  = Number(req.query.after  || 0);
    const limit  = Math.min(Number(req.query.limit || 50), 100);

    if (!(await assertTeamMember(req.user.id, teamId)))
      return res.status(403).json({ success: false, message: "Not a team member" });

    // Prune old messages ~10 % of the time — no cron needed
    if (Math.random() < 0.1) pruneOldMessages();

    const [rows] = await pool.query(
      `SELECT tm.team_message_id AS message_id,
              tm.sender_id,
              u.username,
              u.profile_picture,
              tm.content,
              tm.sent_at
       FROM   team_messages tm
       JOIN   users u ON u.user_id = tm.sender_id
       WHERE  tm.team_id = ?
         AND  tm.team_message_id > ?
       ORDER  BY tm.team_message_id ASC
       LIMIT  ?`,
      [teamId, after, limit]
    );
    res.json({ success: true, messages: rows });
  } catch (err) { next(err); }
};

/** POST /api/chat/team/:teamId/messages  { content } */
export const sendTeamMessage = async (req, res, next) => {
  try {
    const teamId  = Number(req.params.teamId);
    const content = (req.body.content || "").trim().slice(0, 2000);
    if (!content) return res.status(400).json({ success: false, message: "Message cannot be empty" });

    if (!(await assertTeamMember(req.user.id, teamId)))
      return res.status(403).json({ success: false, message: "Not a team member" });

    const [result] = await pool.query(
      `INSERT INTO team_messages (team_id, sender_id, content) VALUES (?,?,?)`,
      [teamId, req.user.id, content]
    );
    const [rows] = await pool.query(
      `SELECT tm.team_message_id AS message_id, tm.sender_id,
              u.username, u.profile_picture, tm.content, tm.sent_at
       FROM   team_messages tm JOIN users u ON u.user_id = tm.sender_id
       WHERE  tm.team_message_id = ?`,
      [result.insertId]
    );
    res.json({ success: true, message: rows[0] });
  } catch (err) { next(err); }
};

/** PUT /api/chat/team/:teamId/read  { lastMessageId } */
export const markTeamRead = async (req, res, next) => {
  try {
    const teamId        = Number(req.params.teamId);
    const lastMessageId = Number(req.body.lastMessageId || 0);

    await pool.query(
      `INSERT INTO chat_read_status (user_id, chat_type, ref_id, last_message_id)
       VALUES (?, 'team', ?, ?)
       ON DUPLICATE KEY UPDATE last_message_id = GREATEST(last_message_id, VALUES(last_message_id))`,
      [req.user.id, teamId, lastMessageId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── DM CHAT ──────────────────────────────────────────────────────────────────

/** GET /api/chat/dm/:appId/messages?after=0&limit=50 */
export const getDmMessages = async (req, res, next) => {
  try {
    const appId = Number(req.params.appId);
    const after = Number(req.query.after  || 0);
    const limit = Math.min(Number(req.query.limit || 50), 100);

    const access = await getDmAccess(req.user.id, appId);
    if (!access) return res.status(403).json({ success: false, message: "Not authorised for this chat" });

    // Prune old messages ~10 % of the time — no cron needed
    if (Math.random() < 0.1) pruneOldMessages();

    const [rows] = await pool.query(
      `SELECT dm.message_id, dm.sender_id,
              u.username, u.profile_picture,
              dm.content, dm.sent_at
       FROM   dm_messages dm
       JOIN   users u ON u.user_id = dm.sender_id
       WHERE  dm.application_id = ?
         AND  dm.message_id > ?
       ORDER  BY dm.message_id ASC
       LIMIT  ?`,
      [appId, after, limit]
    );
    res.json({ success: true, messages: rows });
  } catch (err) { next(err); }
};

/** POST /api/chat/dm/:appId/messages  { content } */
export const sendDmMessage = async (req, res, next) => {
  try {
    const appId   = Number(req.params.appId);
    const content = (req.body.content || "").trim().slice(0, 2000);
    if (!content) return res.status(400).json({ success: false, message: "Message cannot be empty" });

    const access = await getDmAccess(req.user.id, appId);
    if (!access) return res.status(403).json({ success: false, message: "Not authorised for this chat" });

    const [result] = await pool.query(
      `INSERT INTO dm_messages (application_id, sender_id, content) VALUES (?,?,?)`,
      [appId, req.user.id, content]
    );
    const [rows] = await pool.query(
      `SELECT dm.message_id, dm.sender_id,
              u.username, u.profile_picture, dm.content, dm.sent_at
       FROM   dm_messages dm JOIN users u ON u.user_id = dm.sender_id
       WHERE  dm.message_id = ?`,
      [result.insertId]
    );
    res.json({ success: true, message: rows[0] });
  } catch (err) { next(err); }
};

/** PUT /api/chat/dm/:appId/read  { lastMessageId } */
export const markDmRead = async (req, res, next) => {
  try {
    const appId         = Number(req.params.appId);
    const lastMessageId = Number(req.body.lastMessageId || 0);

    await pool.query(
      `INSERT INTO chat_read_status (user_id, chat_type, ref_id, last_message_id)
       VALUES (?, 'dm', ?, ?)
       ON DUPLICATE KEY UPDATE last_message_id = GREATEST(last_message_id, VALUES(last_message_id))`,
      [req.user.id, appId, lastMessageId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── UNREAD COUNTS ────────────────────────────────────────────────────────────

/**
 * GET /api/chat/unread
 * Returns { teams: { "teamId": count }, dms: { "appId": count } }
 * Called every 30s to power unread badges. Two queries total.
 */
export const getUnreadCounts = async (req, res, next) => {
  try {
    const uid = req.user.id;

    // Team unread — only for teams the user is an active member of,
    // only messages not sent by them, only newer than their watermark.
    const [teamRows] = await pool.query(
      `SELECT tm.team_id,
              COUNT(*) AS unread
       FROM   team_messages tm
       JOIN   team_members  tmem
              ON  tmem.team_id = tm.team_id
              AND tmem.user_id = ?
              AND tmem.status  = 'active'
       LEFT JOIN chat_read_status crs
              ON  crs.user_id   = ?
              AND crs.chat_type = 'team'
              AND crs.ref_id    = tm.team_id
       WHERE  tm.sender_id != ?
         AND  tm.team_message_id > COALESCE(crs.last_message_id, 0)
       GROUP  BY tm.team_id`,
      [uid, uid, uid]
    );

    // DM unread — only draft_accepted apps where user is applicant or post owner
    const [dmRows] = await pool.query(
      `SELECT dm.application_id,
              COUNT(*) AS unread
       FROM   dm_messages dm
       JOIN   team_finder_applications tfa
              ON  tfa.application_id = dm.application_id
              AND tfa.status         = 'draft_accepted'
       JOIN   team_finder_posts tfp
              ON  tfp.post_id = tfa.post_id
       LEFT JOIN chat_read_status crs
              ON  crs.user_id   = ?
              AND crs.chat_type = 'dm'
              AND crs.ref_id    = dm.application_id
       WHERE  (tfa.user_id = ? OR tfp.user_id = ?)
         AND  dm.sender_id != ?
         AND  dm.message_id > COALESCE(crs.last_message_id, 0)
       GROUP  BY dm.application_id`,
      [uid, uid, uid, uid]
    );

    const teams = {};
    teamRows.forEach(r => { teams[r.team_id] = r.unread; });

    const dms = {};
    dmRows.forEach(r => { dms[r.application_id] = r.unread; });

    res.json({ success: true, teams, dms });
  } catch (err) { next(err); }
};