import { useCallback, useState } from "react";

import { planTrip } from "../api";
import type { ChatMessage } from "../types";

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const result = await planTrip(prompt);
      const reply =
        result.status === "success"
          ? result.trip_plan
          : `Error: ${result.error_message ?? "Something went wrong."}`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <div className="chatbot-panel-wrap">
      <div className="chatbot-panel">
        <h3>💬 Ask the travel assistant</h3>

        <div className="chat-messages" aria-label="Chat messages">
          {messages.length === 0 ? (
            <div className="chat-bubble assistant">
              Ask anything travel-related, or describe a trip and I’ll generate an itinerary.
            </div>
          ) : null}

          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a travel question (e.g. tips for Goa, budget for 3 days)..."
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            disabled={loading}
          />
          <button className="btn" onClick={() => void send()} disabled={loading || !input.trim()}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

