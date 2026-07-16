-- =============================================================================
-- MIGRATION: Gamer DNA + Swipe Matching
-- Run ONCE in Hostinger phpMyAdmin (or `mysql < this_file.sql`).
-- Safe to re-run — uses CREATE TABLE IF NOT EXISTS throughout.
-- =============================================================================

-- 1. Gamer DNA — a lightweight self-assessment used to power match scoring.
--    One row per user (not per game) — playstyle is a general trait.
CREATE TABLE IF NOT EXISTS user_gamer_dna (
    user_id      INT                 PRIMARY KEY,
    play_style   ENUM('casual','balanced','competitive') NOT NULL,
    comms_pref   ENUM('voice','text','silent')            NOT NULL,
    session_goal ENUM('unwind','improve','win','socialize') NOT NULL,
    updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dna_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. Swipe actions — every like/pass a user makes on a candidate card.
--    UNIQUE(swiper_id, target_id) means a user can only swipe once per
--    candidate; re-swiping is not allowed (candidate simply won't resurface).
CREATE TABLE IF NOT EXISTS swipe_actions (
    swipe_id   INT AUTO_INCREMENT  PRIMARY KEY,
    swiper_id  INT                 NOT NULL,
    target_id  INT                 NOT NULL,
    action     ENUM('like','pass') NOT NULL,
    created_at DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_swipe_pair (swiper_id, target_id),
    CONSTRAINT chk_swipe_no_self CHECK (swiper_id <> target_id),
    CONSTRAINT fk_swipe_swiper FOREIGN KEY (swiper_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_swipe_target FOREIGN KEY (target_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_swipe_target ON swipe_actions(target_id, action);


-- 3. Swipe matches — created when both sides have liked each other.
--    user_a_id is always the smaller user_id so (a,b) is a stable, unique
--    pairing regardless of who swiped last (mirrors the friendships/team
--    dedup pattern already used elsewhere in this schema).
CREATE TABLE IF NOT EXISTS swipe_matches (
    match_id   INT AUTO_INCREMENT  PRIMARY KEY,
    user_a_id  INT                 NOT NULL,
    user_b_id  INT                 NOT NULL,
    created_at DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_swipe_match_pair (user_a_id, user_b_id),
    CONSTRAINT fk_match_a FOREIGN KEY (user_a_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_b FOREIGN KEY (user_b_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_swipe_match_a ON swipe_matches(user_a_id);
CREATE INDEX idx_swipe_match_b ON swipe_matches(user_b_id);


-- 4. Swipe chat — 1-to-1 messages tied to a swipe_match, mirroring the
--    existing dm_messages / team_messages shape (reply, soft delete).
CREATE TABLE IF NOT EXISTS swipe_messages (
    message_id  INT AUTO_INCREMENT PRIMARY KEY,
    match_id    INT         NOT NULL,
    sender_id   INT         NOT NULL,
    content     TEXT        NOT NULL,
    reply_to_id INT         NULL,
    is_deleted  TINYINT(1)  NOT NULL DEFAULT 0,
    deleted_at  DATETIME    NULL,
    sent_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_swmsg_match  FOREIGN KEY (match_id)  REFERENCES swipe_matches(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_swmsg_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_swmsg_reply  FOREIGN KEY (reply_to_id) REFERENCES swipe_messages(message_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_swipe_messages_match  ON swipe_messages(match_id, message_id);
CREATE INDEX idx_swipe_messages_sender ON swipe_messages(sender_id);


-- 5. Extend the existing chat_read_status ENUM to cover the new chat type.
--    chat_type: 'swipe' → ref_id = match_id
ALTER TABLE chat_read_status
  MODIFY COLUMN chat_type ENUM('team','dm','swipe') NOT NULL;
