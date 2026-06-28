import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useChatContext } from "../context/ChatContext";
import {
  getTeamMessages, sendTeamMessage, markTeamRead,
  getDmMessages,   sendDmMessage,   markDmRead,
} from "../services/chatService";

const POLL_MS = 4_000; // 4 s while drawer is open

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function timeStr(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function dateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ username, picture, size = 8 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold`}
      style={{ background: "rgba(255,70,85,0.2)", border: "1px solid rgba(255,70,85,0.35)", color: "#ff4655" }}
    >
      {picture
        ? <img src={picture} alt={username} className="w-full h-full object-cover" />
        : username?.[0]?.toUpperCase()}
    </div>
  );
}

// ─── Single message bubble ─────────────────────────────────────────────────────
function Bubble({ msg, isMine }) {
  return (
    <div className={`flex gap-2 max-w-[85%] ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
      {!isMine && <Avatar username={msg.username} picture={msg.profile_picture} />}
      <div className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="text-[10px] text-gray-500 px-1">{msg.username}</span>
        )}
        <div
          className="px-3 py-2 rounded-2xl text-sm leading-relaxed break-words"
          style={
            isMine
              ? { background: "rgba(255,70,85,0.2)", border: "1px solid rgba(255,70,85,0.35)", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }
          }
        >
          {msg.content}
        </div>
        <span className="text-[9px] text-gray-600 px-1">{timeStr(msg.sent_at)}</span>
      </div>
    </div>
  );
}

// ─── Main ChatDrawer ───────────────────────────────────────────────────────────
/**
 * Props:
 *   open        boolean
 *   onClose     () => void
 *   chatType    'team' | 'dm'
 *   chatId      number  (teamId for 'team', applicationId for 'dm')
 *   title       string  (e.g. "Alpha Squad" or "Chat with shivaay_dev")
 *   subtitle    string  optional
 */
export default function ChatDrawer({ open, onClose, chatType, chatId, title, subtitle }) {
  const { user } = useAuth();
  const { refresh: refreshBadges } = useChatContext();

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const lastIdRef   = useRef(0);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const intervalRef = useRef(null);
  const isInitRef   = useRef(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (initial = false) => {
    if (!chatId || !chatType) return;
    try {
      const after = initial ? 0 : lastIdRef.current;
      const res = chatType === "team"
        ? await getTeamMessages(chatId, after)
        : await getDmMessages(chatId, after);

      const msgs = res.data.messages || [];
      if (msgs.length === 0) return;

      if (initial) {
        setMessages(msgs);
      } else {
        setMessages(prev => [...prev, ...msgs]);
      }

      const newLast = msgs[msgs.length - 1].message_id;
      lastIdRef.current = newLast;

      // Mark as read + refresh badge count
      if (chatType === "team") markTeamRead(chatId, newLast).catch(() => {});
      else                     markDmRead(chatId, newLast).catch(() => {});
      refreshBadges();

    } catch (err) {
      if (initial) setError("Could not load messages");
    } finally {
      if (initial) setLoading(false);
    }
  }, [chatId, chatType, refreshBadges]);

  // ── Open / close lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !chatId) return;

    // Reset state each time a new chat opens
    setMessages([]);
    setLoading(true);
    setError(null);
    setInput("");
    lastIdRef.current = 0;
    isInitRef.current = false;

    // Initial load
    fetchMessages(true).then(() => { isInitRef.current = true; });

    // Start polling
    intervalRef.current = setInterval(() => fetchMessages(false), POLL_MS);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [open, chatId, chatType, fetchMessages]);

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ── Focus input when drawer opens ─────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = chatType === "team"
        ? await sendTeamMessage(chatId, text)
        : await sendDmMessage(chatId, text);
      const msg = res.data.message;
      setMessages(prev => [...prev, msg]);
      lastIdRef.current = msg.message_id;
      if (chatType === "team") markTeamRead(chatId, msg.message_id).catch(() => {});
      else                     markDmRead(chatId, msg.message_id).catch(() => {});
    } catch {
      setInput(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Date separator logic ──────────────────────────────────────────────────
  let lastDate = null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scrim — dims the rest of the page */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: "min(420px, 100vw)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          background: "linear-gradient(180deg, #12192e 0%, #0d1424 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
            style={{ background: "rgba(255,70,85,0.15)", border: "1px solid rgba(255,70,85,0.3)" }}
          >
            {chatType === "team" ? "🛡️" : "💬"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{title}</p>
            {subtitle && <p className="text-[10px] text-gray-500 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* DM notice banner */}
        {chatType === "dm" && (
          <div
            className="mx-3 mt-3 px-3 py-2 rounded-xl text-xs text-yellow-400 flex items-center gap-2 shrink-0"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
          >
            🔒 Draft chat — visible only while your application is under review
          </div>
        )}

        {/* ── Messages ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-2 border-surface-border border-t-red rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-gray-500 mt-8">{error}</p>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-600">
              <span className="text-3xl opacity-40">💬</span>
              <p className="text-sm">No messages yet — say hello!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const msgDate = dateLabel(msg.sent_at);
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;
            return (
              <div key={msg.message_id}>
                {showDate && (
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-[10px] text-gray-600 px-2">{msgDate}</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>
                )}
                <Bubble msg={msg} isMine={msg.sender_id === user?.id} />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ──────────────────────────────────────────────── */}
        <div
          className="px-3 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none leading-relaxed"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ maxHeight: "120px" }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
              style={{ background: input.trim() ? "rgba(255,70,85,0.8)" : "transparent", color: "#fff" }}
            >
              {sending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>
          </div>
          <p className="text-[9px] text-gray-700 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
