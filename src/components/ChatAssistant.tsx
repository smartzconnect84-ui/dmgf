import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Heart, HandHeart, HelpCircle, Sparkles } from "lucide-react";
import { chatWithAssistant } from "@/lib/chat.functions";
import logoAsset from "@/assets/dmgf-logo.png.asset.json";

type Mode = "faq" | "donor" | "volunteer";
type Msg = { role: "user" | "assistant"; content: string };

const MODES: { key: Mode; label: string; icon: typeof Heart; intro: string }[] = [
  {
    key: "faq",
    label: "Ask a question",
    icon: HelpCircle,
    intro:
      "Hi! I'm the DMGF assistant. Ask me anything about our mission, programs, events or how to reach us.",
  },
  {
    key: "donor",
    label: "Become a donor",
    icon: Heart,
    intro:
      "Thank you for considering a gift 🙏 I'll help you choose the right way to give. Which cause matters most to you — women, youth, children, healthcare, education, or community development?",
  },
  {
    key: "volunteer",
    label: "Volunteer with us",
    icon: HandHeart,
    intro:
      "Wonderful! Volunteers are the heartbeat of DMGF. To get started, could you share your name and where you're based (city / county)?",
  },
];

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(chatWithAssistant);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const pickMode = (m: Mode) => {
    setMode(m);
    const intro = MODES.find((x) => x.key === m)!.intro;
    setMessages([{ role: "assistant", content: intro }]);
  };

  const reset = () => {
    setMode(null);
    setMessages([]);
    setInput("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !mode || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await send({ data: { mode, messages: next } });
      const reply = "reply" in res ? res.reply : res.error;
      setMessages([...next, { role: "assistant", content: reply ?? "Sorry, please try again." }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Network error. Please try again, or email info24dmgf@gmail.com." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open DMGF assistant"
          className="fixed bottom-5 right-5 z-[60] group flex items-center gap-2 rounded-full bg-gradient-gold text-ink pl-2 pr-5 py-2 shadow-gold hover-lift"
        >
          <span className="relative h-10 w-10 rounded-full bg-ink grid place-items-center overflow-hidden">
            <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink" />
          </span>
          <span className="font-medium text-sm hidden sm:inline">Chat with DMGF</span>
          <Sparkles className="h-4 w-4" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 z-[60] w-auto sm:w-[380px] max-h-[85vh] rounded-2xl overflow-hidden bg-white shadow-2xl border border-gold/30 flex flex-col">
          <header className="bg-ink text-white px-4 py-3 flex items-center gap-3">
            <img src={logoAsset.url} alt="DMGF" className="h-9 w-9 object-contain" />
            <div className="flex-1 leading-tight">
              <div className="font-display text-base">DMGF Assistant</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold/80">
                {mode ? MODES.find((m) => m.key === mode)?.label : "How can we help?"}
              </div>
            </div>
            {mode && (
              <button
                onClick={reset}
                className="text-[11px] uppercase tracking-wider text-gold/80 hover:text-gold"
              >
                Switch
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {!mode ? (
            <div className="p-5 space-y-3 bg-cream/50">
              <p className="text-sm text-muted-foreground">
                Choose how I can help you today:
              </p>
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => pickMode(m.key)}
                  className="w-full text-left rounded-xl border border-input bg-white p-4 hover:border-gold hover:shadow-elegant transition flex items-start gap-3"
                >
                  <span className="h-10 w-10 grid place-items-center rounded-full bg-gradient-gold text-ink shrink-0">
                    <m.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-base text-ink">{m.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {m.key === "faq"
                        ? "Answers about DMGF, programs, events & contact."
                        : m.key === "donor"
                        ? "Guided onboarding for one-time or monthly giving."
                        : "Tell us how you'd like to serve."}
                    </span>
                  </span>
                </button>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                Replies are generated by AI using DMGF's published content. For sensitive matters,
                please email <a className="underline" href="mailto:info24dmgf@gmail.com">info24dmgf@gmail.com</a>.
              </p>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/40">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "bg-ink text-white rounded-br-sm"
                          : "bg-white border border-gold/20 text-foreground rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gold/20 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                      <span className="inline-flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-gold animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-gold animate-bounce [animation-delay:120ms]" />
                        <span className="h-2 w-2 rounded-full bg-gold animate-bounce [animation-delay:240ms]" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={onSubmit} className="border-t border-gold/20 bg-white p-2.5 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message…"
                  className="flex-1 rounded-full border border-input px-4 py-2.5 text-sm outline-none focus:border-gold"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="h-10 w-10 grid place-items-center rounded-full bg-gradient-gold text-ink disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
