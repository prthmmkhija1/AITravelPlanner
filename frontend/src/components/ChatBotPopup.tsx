import { useCallback, useState, useRef, useEffect } from "react";
import { planTrip } from "../api";
import type { ChatMessage } from "../types";

interface ChatBotPopupProps {
  isOpen: boolean;
  onToggle: () => void;
  initialMessage?: string;
  onInitialMessageHandled?: () => void;
}

export default function ChatBotPopup({ isOpen, onToggle, initialMessage, onInitialMessageHandled }: ChatBotPopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && isOpen && initialMessage !== lastProcessedMessage && !loading) {
      setLastProcessedMessage(initialMessage);
      sendMessage(initialMessage);
      if (onInitialMessageHandled) {
        onInitialMessageHandled();
      }
    }
  }, [initialMessage, isOpen, lastProcessedMessage, loading]);

  const sendMessage = useCallback(async (prompt: string) => {
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
  }, [loading]);

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    await sendMessage(prompt);
  }, [input, loading, sendMessage]);

  const prompts = [
    { text: "Flights to ", highlight: "Goa" },
    { text: "Hotels in ", highlight: "Mumbai" },
    { text: "Plan trip to ", highlight: "Manali" },
  ];

  return (
    <>
      {/* FAB Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        aria-label="Chat"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <div className="fab-avatar">
              <svg viewBox="0 0 36 36" fill="none">
                {/* Chat bubble head */}
                <path d="M6 8C6 5.8 7.8 4 10 4H26C28.2 4 30 5.8 30 8V20C30 22.2 28.2 24 26 24H14L8 30V24H10C7.8 24 6 22.2 6 20V8Z" fill="white"/>
                {/* Dots */}
                <circle cx="12" cy="14" r="2" fill="#3b82f6"/>
                <circle cx="18" cy="14" r="2" fill="#3b82f6"/>
                <circle cx="24" cy="14" r="2" fill="#3b82f6"/>
              </svg>
            </div>
            <span className="fab-pulse"></span>
          </>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-popup ${isOpen ? 'open' : ''}`}>
        <button className="chatbot-close-corner" onClick={onToggle}>×</button>

        {/* Content */}
        <div className="chatbot-content">
          {messages.length === 0 ? (
            <div className="chatbot-welcome">
              <p className="welcome-text">Hi, I'm <strong>Voyager</strong> — your AI travel assistant.</p>

              {/* Prompts */}
              <div className="prompt-list">
                {prompts.map((p, idx) => (
                  <button key={idx} className="prompt-btn" onClick={() => sendMessage(p.text + p.highlight)}>
                    {p.text}<span className="highlight">{p.highlight}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chatbot-messages">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-msg ${m.role}`}>
                  <div className="msg-bubble">{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-msg assistant">
                  <div className="msg-bubble typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chatbot-input-simple">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you looking for?"
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading}
          />
          <button className="search-btn" onClick={() => send()} disabled={loading || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
