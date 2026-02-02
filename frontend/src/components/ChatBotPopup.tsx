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
    { icon: "✈️", text: "Flights to ", highlight: "Goa" },
    { icon: "🏨", text: "Hotels in ", highlight: "Mumbai" },
    { icon: "🗺️", text: "Plan trip to ", highlight: "Manali" },
    { icon: "🎯", text: "Best places in ", highlight: "Kerala" },
    { icon: "💰", text: "Budget trip to ", highlight: "Jaipur" },
  ];

  const quickActions = [
    { icon: "✈️", label: "Flights" },
    { icon: "🏨", label: "Hotels" },
    { icon: "🚗", label: "Transport" },
    { icon: "🎭", label: "Activities" },
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
            <div className="fab-robot">
              <svg viewBox="0 0 48 48" fill="none" className="robot-icon">
                {/* Antenna */}
                <circle className="antenna-dot" cx="24" cy="6" r="3" fill="#f97316"/>
                <line className="antenna-line" x1="24" y1="9" x2="24" y2="14" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                
                {/* Head */}
                <rect className="robot-head" x="10" y="14" width="28" height="20" rx="4" fill="white"/>
                
                {/* Eyes */}
                <circle className="robot-eye left-eye" cx="18" cy="24" r="4" fill="#0f172a"/>
                <circle className="robot-eye right-eye" cx="30" cy="24" r="4" fill="#0f172a"/>
                <circle className="eye-glow left-glow" cx="18" cy="24" r="2" fill="#f97316"/>
                <circle className="eye-glow right-glow" cx="30" cy="24" r="2" fill="#f97316"/>
                
                {/* Mouth */}
                <rect className="robot-mouth" x="18" y="29" width="12" height="3" rx="1.5" fill="#0f172a"/>
                
                {/* Ears/Sides */}
                <rect className="robot-ear left-ear" x="4" y="20" width="6" height="8" rx="2" fill="#8b5cf6"/>
                <rect className="robot-ear right-ear" x="38" y="20" width="6" height="8" rx="2" fill="#8b5cf6"/>
                
                {/* Body hint */}
                <path className="robot-body" d="M16 34 L16 40 L32 40 L32 34" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <span className="fab-pulse"></span>
          </>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-popup ${isOpen ? 'open' : ''}`}>
        {/* Ambient glow effects */}
        <div className="chatbot-ambient"></div>
        
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-logo">
              <span className="logo-icon">🧭</span>
              <div className="logo-text">
                <h4>Voyager</h4>
                <span className="status"><span className="status-dot"></span>Online</span>
              </div>
            </div>
          </div>
          <button className="chatbot-close-corner" onClick={onToggle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="chatbot-quick-actions">
            {quickActions.map((action, idx) => (
              <button 
                key={idx} 
                className="quick-action-btn"
                onClick={() => sendMessage(`Find ${action.label.toLowerCase()} for my trip`)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="chatbot-content">
          {messages.length === 0 ? (
            <div className="chatbot-welcome">
              <div className="welcome-greeting">
                <p className="welcome-text">Hi, I'm <strong>Voyager</strong> — your AI travel assistant.</p>
                <p className="welcome-subtext">Ask me anything about flights, hotels, destinations, or let me plan your perfect trip!</p>
              </div>

              {/* Prompts */}
              <div className="prompt-list">
                <p className="prompt-label">Try asking:</p>
                {prompts.map((p, idx) => (
                  <button key={idx} className="prompt-btn" onClick={() => sendMessage(p.text + p.highlight)}>
                    <span className="prompt-icon">{p.icon}</span>
                    <span className="prompt-text">{p.text}<span className="highlight">{p.highlight}</span></span>
                    <svg className="prompt-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
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
        <div className="chatbot-input-area">
          <div className="input-wrapper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your trip..."
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button className="voice-btn" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
          <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
