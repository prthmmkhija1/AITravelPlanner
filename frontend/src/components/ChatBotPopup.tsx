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
    { icon: "✈️", text: "Cheapest flight ", highlight: "from Delhi to Spain" },
    { icon: "🏖️", text: "Plan a relaxing getaway for ", highlight: "my parents" },
    { icon: "🏔️", text: "Best hill stations ", highlight: "near Mumbai" },
  ];

  const travelTabs = [
    { icon: "✈️", label: "Flights", active: true },
    { icon: "🏨", label: "Hotels" },
    { icon: "🚂", label: "Trains" },
    { icon: "🚌", label: "Bus" },
    { icon: "🎫", label: "Holiday" },
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
              <div className="logo-avatar">
                <svg viewBox="0 0 32 32" fill="none" className="logo-svg">
                  <circle cx="16" cy="16" r="14" fill="url(#logoGradient)" opacity="0.2"/>
                  <path d="M16 8 L20 12 L16 16 L12 12 Z" fill="url(#logoGradient)"/>
                  <circle cx="16" cy="16" r="2" fill="#f97316"/>
                  <path d="M16 18 L19 24 M16 18 L13 24" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="logo-text">
                <h4>Voyager AI</h4>
                <span className="status">
                  <span className="status-dot"></span>
                  Ready to assist
                </span>
              </div>
            </div>
          </div>
          <button className="chatbot-close-corner" onClick={onToggle} aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Travel Tabs - MakeMyTrip Style */}
        {messages.length === 0 && (
          <div className="mmt-travel-tabs">
            {travelTabs.map((tab, idx) => (
              <button 
                key={idx} 
                className={`travel-tab ${tab.active ? 'active' : ''}`}
                onClick={() => sendMessage(`Find ${tab.label.toLowerCase()} for my trip`)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="chatbot-content">
          {messages.length === 0 ? (
            <div className="chatbot-welcome mmt-style">
              {/* Search Header */}
              <div className="mmt-search-header">
                <h2 className="mmt-title">Where do you want to go?</h2>
                <p className="mmt-subtitle">Let Voyager AI plan your perfect trip</p>
              </div>

              {/* Suggestion Prompts */}
              <div className="mmt-prompts">
                <p className="prompts-label">Popular searches</p>
                {prompts.map((p, idx) => (
                  <button key={idx} className="mmt-prompt-btn" onClick={() => sendMessage(p.text + p.highlight)}>
                    <span className="prompt-icon">{p.icon}</span>
                    <span className="prompt-content">
                      <span className="prompt-text">{p.text}</span>
                      <span className="prompt-highlight">{p.highlight}</span>
                    </span>
                    <span className="prompt-arrow">→</span>
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
              placeholder="What are you looking for?"
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button className="search-btn-icon" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>
          <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()} aria-label="Send message">
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
