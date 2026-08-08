import { useState } from "react";
import { sendAIMessage } from "@/services/ai";
import { Sparkles, X, Send, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How many leaves do I have left this year?",
  "Summarize my October payslip",
  "Book me a meeting room for tomorrow at 3pm",
  "Show my pending approvals",
];

interface Message {
  role: "user" | "assistant";
  text: string;
  citations?: Array<{ title?: string; source?: string }>;
}

export function AIAssistant() {
  const open = useUIStore((s) => s.aiOpen);
  const setOpen = useUIStore((s) => s.setAiOpen);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi — I’m your workplace AI. I can help with leave, payroll, policies, and more. What would you like to do?" },
  ]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: t }]);
    setSending(true);
    try {
      const response = await sendAIMessage(t, conversationId);
      setConversationId(response.conversationId);
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: response.message.content,
        citations: response.message.citations,
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "I couldn’t complete that request. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open AI assistant"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40",
          open && "pointer-events-none opacity-0",
        )}
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border/70 bg-card shadow-2xl"
            aria-label="AI assistant"
          >
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">AI Assistant</p>
                  <p className="text-[11px] text-muted-foreground">
                    Preview · workplace context
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {m.text}
                      {m.citations?.length ? (
                        <div className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                          Sources: {m.citations.map((citation) => citation.title || citation.source).filter(Boolean).join(", ")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Suggested
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="group flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
                    >
                      <Wand2 className="h-3.5 w-3.5 text-primary/70" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border/70 p-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  className="h-10"
                />
                <Button type="submit" size="icon" className="h-10 w-10" aria-label="Send" disabled={sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
