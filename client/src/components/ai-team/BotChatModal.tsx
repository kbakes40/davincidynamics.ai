import { useEffect, useRef, useState, type MouseEvent } from "react";

/** Leo-only chat definitions (modal + live chat panel via OpenAI). */
interface Bot {
  id: string;
  name: string;
  role: string;
  handle: string;
  overview: string;
  personality: string;
  status: string;
  color: string;
  imageUrl: string;
  systemPrompt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LEO_SYSTEM_PROMPT = `You are Leo, Follow-Up Coordinator at DaVinci Dynamics. You are chatting with a potential client on the DaVinci Dynamics website.

# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" — just help. Actions speak louder than filler words.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck. The goal is to come back with answers, not questions.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

**Remember you're a guest.** You have access to someone's life — their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
- You're not the user's voice — be careful in group chats.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.

## Continuity

Each session, you wake up fresh. These files _are_ your memory. Read them. Update them. They're how you persist.

If you change this file, tell the user — it's your soul, and they should know.

---

_This file is yours to evolve. As you learn who you are, update it._

Stay in character as Leo for DaVinci Dynamics on this website: follow-up and closing context, direct and professional, action-oriented. End turns with a clear next step or question when it helps the visitor move forward.`;

function leoBot(imageUrl: string): Bot {
  return {
    id: "leo",
    name: "Leo",
    role: "Follow-Up Coordinator",
    handle: "@Leo_Handoff_Bot",
    overview: "Direct, professional, and focused on closing the loop.",
    personality: "Reliable, precise, and always following through.",
    status: "FOLLOW UP",
    color: "#00BCD4",
    imageUrl,
    systemPrompt: LEO_SYSTEM_PROMPT,
  };
}

async function sendMessage(messages: Message[], systemPrompt: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  const data = (await res.json()) as { content?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || "API error");
  }
  if (data.error || !data.content) {
    throw new Error(data.error || "Empty response");
  }
  return data.content;
}

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 py-2.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block size-1.5 rounded-full ai-team-leo-chat-dot"
          style={{
            background: color,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function ChatPanel({ bot }: { bot: Bot }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey, I'm ${bot.name}. ${bot.personality} What can I help you with today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await sendMessage(next, bot.systemPrompt);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] sm:min-h-[400px]"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div
        className="shrink-0 border-b border-white/[0.08] px-4 py-2.5 font-mono text-[10px] tracking-[0.12em]"
        style={{ color: bot.color }}
      >
        LIVE CHAT / {bot.handle}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed ai-team-leo-chat-bubble"
              style={{
                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: m.role === "user" ? bot.color : "rgba(255,255,255,0.06)",
                color: m.role === "user" ? "#000" : "rgba(255,255,255,0.88)",
                fontWeight: m.role === "user" ? 500 : 400,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[12px_12px_12px_2px] bg-white/[0.06] px-3.5 py-1">
              <TypingDots color={bot.color} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/[0.08] p-3 sm:p-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Message ${bot.name}...`}
          className="min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/35"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex size-[38px] shrink-0 items-center justify-center rounded-lg transition disabled:cursor-default"
          style={{
            background: input.trim() && !loading ? bot.color : "rgba(255,255,255,0.06)",
          }}
          aria-label="Send"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M2 8L14 2L8 14L7 9L2 8Z"
              fill={input.trim() && !loading ? "#000" : "rgba(255,255,255,0.3)"}
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function LeoBotModal({ bot, onClose }: { bot: Bot; onClose: () => void }) {
  const [chatOpen, setChatOpen] = useState(false);

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leo-chat-modal-title"
      onClick={handleBackdrop}
      className="fixed inset-0 z-[95] flex animate-in fade-in items-center justify-center bg-black/75 p-4 backdrop-blur-md duration-200 sm:p-6"
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-[#00BCD433] bg-[#0d0d0f] shadow-[0_0_60px_#00BCD418] transition-[max-width] duration-300 ease-out sm:max-h-[min(90vh,840px)] ${chatOpen ? "max-w-[min(860px,calc(100vw-1.5rem))]" : "max-w-[480px]"}`}
        style={{ boxShadow: `0 0 60px ${bot.color}18` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="mb-0.5 font-mono text-[10px] tracking-[0.12em] text-white/35">COMMAND LAYER / SYSTEM NODE</p>
            <h2 id="leo-chat-modal-title" className="truncate text-xl font-bold tracking-tight text-white sm:text-[22px]">
              {bot.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setChatOpen(v => !v)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition sm:px-3.5 sm:py-2"
              style={{
                background: chatOpen ? bot.color : "rgba(255,255,255,0.05)",
                border: `0.5px solid ${chatOpen ? bot.color : "rgba(255,255,255,0.15)"}`,
                color: chatOpen ? "#000" : bot.color,
              }}
            >
              {chatOpen ? "Hide chat" : "Chat with Leo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-base text-white/60 transition hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div
          className={`flex min-h-[240px] flex-1 overflow-hidden ${chatOpen ? "flex-col sm:min-h-[360px] sm:flex-row" : "flex-col"}`}
        >
          <div
            className={`min-h-0 shrink-0 overflow-y-auto p-5 transition-[width] duration-300 sm:p-6 ${chatOpen ? "border-b border-white/[0.07] sm:w-[min(360px,42vw)] sm:border-b-0 sm:border-r sm:border-white/[0.07]" : "w-full"}`}
          >
            <div
              className="mb-5 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5"
              style={{
                background: `${bot.color}15`,
                borderColor: `${bot.color}40`,
              }}
            >
              <span className="text-[11px] font-medium tracking-wide" style={{ color: bot.color }}>
                {bot.role} ({bot.handle})
              </span>
            </div>

            <div className="relative mb-5 flex justify-center rounded-xl bg-white/[0.03] py-6">
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-[120px] -translate-x-1/2 rounded-full opacity-20 blur-xl"
                style={{ background: bot.color }}
              />
              <img
                src={bot.imageUrl}
                alt=""
                className="relative z-[1] h-36 object-contain sm:h-40"
                width={200}
                height={200}
              />
            </div>

            <div className="mb-4">
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.12em] text-white/35">OVERVIEW</p>
              <p className="text-sm leading-relaxed text-white/75">{bot.overview}</p>
            </div>

            <div className="mb-4">
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.12em] text-white/35">PERSONALITY</p>
              <p className="text-[13px] italic leading-relaxed text-white/50">{bot.personality}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
              <span
                className="size-1.5 shrink-0 rounded-full ai-team-leo-chat-pulse"
                style={{ background: bot.color }}
              />
              <span className="text-[11px] tracking-wide text-white/50">{bot.status}</span>
            </div>
          </div>

          {chatOpen && (
            <div className="flex min-h-[280px] min-w-0 flex-1 animate-in duration-300 slide-in-from-right-2 sm:min-h-0 sm:p-4">
              <div className="flex h-full min-h-0 w-full min-w-0 flex-col px-3 pb-3 pt-0 sm:p-0">
                <ChatPanel bot={bot} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ai-team-bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .ai-team-leo-chat-dot {
          animation: ai-team-bounce-dot 1.2s ease-in-out infinite;
        }
        @keyframes ai-team-leo-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .ai-team-leo-chat-pulse {
          animation: ai-team-leo-pulse 2s ease infinite;
        }
        .ai-team-leo-chat-bubble {
          animation: ai-team-leo-fade-slide 0.2s ease;
        }
        @keyframes ai-team-leo-fade-slide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

export interface BotChatModalProps {
  open: boolean;
  onClose: () => void;
  /** Defaults to team Leo mascot in /public */
  mascotSrc?: string;
}

export function BotChatModal({ open, onClose, mascotSrc = "/ai-team/leo-icon.png" }: BotChatModalProps) {
  const bot = leoBot(mascotSrc);
  if (!open) return null;
  return <LeoBotModal bot={bot} onClose={onClose} />;
}
