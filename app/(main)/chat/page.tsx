"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/education/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-84px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h1 className="text-[18px] font-extrabold">AI Nutrition Coach</h1>
        <p className="text-[11px] text-tx2">Powered by Claude AI</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[48px] mb-3">🤖</div>
            <p className="text-[14px] font-bold mb-2">Hi! I&apos;m your nutrition coach.</p>
            <p className="text-[12px] text-tx2 mb-4 max-w-[280px] mx-auto">
              Ask me anything about nutrition, meal planning, macros, or healthy eating habits.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "How much protein do I need?",
                "What should I eat before working out?",
                "Is intermittent fasting effective?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="text-[11px] py-1.5 px-3 rounded-full bg-surface border border-border text-tx2 active:border-mint"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] ${msg.role === "user" ? "self-end" : "self-start"}`}
          >
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-[1.6] ${
                msg.role === "user"
                  ? "bg-mint text-background rounded-br-sm"
                  : "bg-surface border border-border rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="self-start max-w-[85%]">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13px] text-tx2">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about nutrition..."
          className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-tx3 outline-none focus:border-mint"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="py-2.5 px-4 rounded-xl bg-mint text-background text-[13px] font-bold disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
