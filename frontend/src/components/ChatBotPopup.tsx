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

  // Handle initial message from search or other sources
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

  const quickPrompts = [
    "🏖️ Beach vacation ideas",
    "🏔️ Mountain getaways",
    "💰 Budget trip tips",
    "✈️ Best travel deals"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {!isOpen && <span className="chatbot-fab-pulse"></span>}
      </button>

      {/* Chat Panel Slide-out */}
      <div className={`chatbot-popup ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-popup-header">
          <div className="chatbot-popup-title">
            <span className="chatbot-avatar">🌍</span>
            <div>
              <h4>Travel Assistant</h4>
              <span className="chatbot-status">● Online</span>
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={onToggle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="chatbot-popup-messages">
          {messages.length === 0 ? (
            <div className="chatbot-welcome">
              <div className="welcome-icon">✈️</div>
              <h5>Hello! I'm your Travel Assistant</h5>
              <p>Ask me anything about travel planning, destinations, or let me create a personalized itinerary for you!</p>
              <div className="quick-prompts">
                {quickPrompts.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    className="quick-prompt-btn"
                    onClick={() => setInput(prompt.replace(/^[^\s]+\s/, ''))}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`chatbot-message ${m.role}`}>
                {m.role === 'assistant' && <span className="message-avatar">🌍</span>}
                <div className="message-content">{m.content}</div>
              </div>
            ))
          )}
          {loading && (
            <div className="chatbot-message assistant">
              <span className="message-avatar">🌍</span>
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-popup-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about destinations, trips..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            disabled={loading}
          />
          <button 
            className="chatbot-send-btn" 
            onClick={() => void send()} 
            disabled={loading || !input.trim()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay when chat is open on mobile */}
      {isOpen && <div className="chatbot-overlay" onClick={onToggle}></div>}
    </>
  );
}
