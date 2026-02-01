/**
 * Welcome Popup - Shows on first visit
 * Like Myra assistant in MakeMyTrip
 */
import { useState, useEffect } from 'react';
import './WelcomePopup.css';

interface WelcomePopupProps {
  onClose: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: '✈️',
    text: 'Cheapest flight',
    highlight: 'from Delhi to Spain'
  },
  {
    icon: '🏖️',
    text: 'Plan a relaxing getaway for',
    highlight: 'my parents...'
  },
  {
    icon: '🏔️',
    text: 'Best hill stations',
    highlight: 'near Mumbai'
  }
];

export default function WelcomePopup({ onClose, onOpenChat, onOpenSettings }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Check if user has seen popup before
    const hasSeenPopup = sessionStorage.getItem('welcomePopupSeen');
    if (!hasSeenPopup) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('welcomePopupSeen', 'true');
    onClose();
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    handleClose();
    onOpenChat();
  };

  const handleSearch = () => {
    if (input.trim()) {
      handleClose();
      onOpenChat();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-popup-container">
      <div className="welcome-popup">
        {/* Close Button */}
        <button className="welcome-close" onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Settings Button */}
        <button className="welcome-settings" onClick={onOpenSettings}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Avatar */}
        <div className="welcome-avatar">
          <div className="avatar-robot">
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="AI Assistant" />
          </div>
        </div>

        {/* Greeting */}
        <div className="welcome-greeting">
          <span className="greeting-hi">Hi I am</span>
          <h2 className="greeting-name">Voyager</h2>
        </div>

        {/* Suggested Prompts */}
        <div className="welcome-prompts">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              className="prompt-card"
              onClick={() => handlePromptClick(`${prompt.text} ${prompt.highlight}`)}
            >
              <span className="prompt-text">{prompt.text}</span>
              <span className="prompt-highlight">{prompt.highlight}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="welcome-search">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you looking for?"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
