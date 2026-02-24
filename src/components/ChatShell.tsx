"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  theme: "light" | "dark";
  onClose: () => void;
};

type Source = {
  id: string;
  document_id: string | null;
  similarity: number | null;
  content: string;
};

type Msg =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; sources?: Source[] };

export default function ChatShell({ open, theme, onClose }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask me anything about Yoav. I’ll answer using the portfolio knowledge base.",
    },
  ]);

  const [openSourcesFor, setOpenSourcesFor] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const isDark = theme === "dark";

  // lock background scroll when chat is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, open]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("/api/rag/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, match_count: 6 }),
      });

      const json = await r.json().catch(() => null);

      if (!r.ok) {
        const errMsg =
          json?.error ||
          `Request failed (${r.status}). Check /api/rag/answer logs.`;
        setMsgs((m) => [...m, { role: "assistant", text: `Error: ${errMsg}` }]);
        return;
      }

      const answer = typeof json?.answer === "string" ? json.answer : "";
      const sources = Array.isArray(json?.sources)
        ? (json.sources as Source[])
        : [];

      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: answer || "I couldn’t generate an answer (empty response).",
          sources,
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMsgs((m) => [...m, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
            }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel (slides from bottom) */}
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-4xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div
              className="mx-4 mb-4 overflow-hidden rounded-3xl border shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
              style={{
                borderColor: "rgba(var(--border))",
                background: "rgba(var(--card))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <div className="text-lg font-semibold">Chat</div>
                  <div
                    className="text-sm"
                    style={{ color: "rgba(var(--muted))" }}
                  >
                    Ask about Yoav
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 place-items-center rounded-full border transition hover:opacity-90"
                  style={{
                    borderColor: "rgba(var(--border))",
                    background: "rgba(var(--card))",
                    color: "rgb(var(--fg))",
                  }}
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>

              {/* Messages */}
              <div
                ref={listRef}
                className="max-h-[55vh] overflow-auto px-6 pb-4"
              >
                <div className="flex flex-col gap-3">
                  {msgs.map((m, i) => {
                    const isUser = m.role === "user";
                    const bubbleBg = isUser
                      ? isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.08)"
                      : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.7)";

                    return (
                      <div
                        key={i}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[80%]">
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
                            style={{
                              background: bubbleBg,
                              border: `1px solid rgba(var(--border))`,
                              color: "rgb(var(--fg))",
                            }}
                          >
                            {m.text}
                          </div>

                          {/* Sources (only for assistant msgs) */}
                          {"sources" in m &&
                            m.sources &&
                            m.sources.length > 0 && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenSourcesFor((cur) =>
                                      cur === i ? null : i,
                                    )
                                  }
                                  className="text-xs underline opacity-80 hover:opacity-100"
                                  style={{ color: "rgba(var(--muted))" }}
                                >
                                  {openSourcesFor === i
                                    ? "Hide sources"
                                    : "Show sources"}
                                </button>

                                {openSourcesFor === i && (
                                  <div
                                    className="mt-2 rounded-2xl border p-3 text-xs whitespace-pre-wrap"
                                    style={{
                                      borderColor: "rgba(var(--border))",
                                      background: isDark
                                        ? "rgba(0,0,0,0.28)"
                                        : "rgba(255,255,255,0.55)",
                                    }}
                                  >
                                    {m.sources.map((s, idx) => (
                                      <div
                                        key={s.id}
                                        className={
                                          idx ? "mt-3 pt-3 border-t" : ""
                                        }
                                        style={{
                                          borderColor: "rgba(var(--border))",
                                        }}
                                      >
                                        <div
                                          style={{
                                            color: "rgba(var(--muted))",
                                          }}
                                        >
                                          #{idx + 1} • sim{" "}
                                          {s.similarity?.toFixed?.(3) ?? "?"}
                                        </div>
                                        <div className="mt-1">{s.content}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex justify-start">
                      <div
                        className="rounded-2xl rounded-bl-md px-4 py-3 text-sm"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(255,255,255,0.7)",
                          border: `1px solid rgba(var(--border))`,
                          color: "rgba(var(--muted))",
                        }}
                      >
                        Thinking…
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="px-6 pb-6">
                <div
                  className="flex w-full items-center gap-4 rounded-full border px-6 py-5 backdrop-blur"
                  style={{
                    borderColor: "rgba(var(--border))",
                    background: isDark
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(255,255,255,0.7)",
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send();
                    }}
                    placeholder="Ask about Yoav..."
                    className="w-full bg-transparent outline-none text-base"
                    style={{ color: "rgb(var(--fg))" }}
                  />

                  <button
                    type="button"
                    onClick={send}
                    disabled={loading}
                    className="grid h-11 w-16 place-items-center rounded-full transition hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(0,0,0,0.9)",
                      color: isDark ? "#000" : "#fff",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
