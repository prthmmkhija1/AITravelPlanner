/**
 * Welcome Popup - MakeMyTrip style simple input bar
 */
import { useState, useEffect, useRef } from 'react';
import './WelcomePopup.css';

interface WelcomePopupProps {
  onClose: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

export default function WelcomePopup({ onClose, onOpenChat }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const phrases = [
    "Where do you want to go?",
    "What are you looking for?",
    "Plan your dream vacation",
    "Discover new destinations"
  ];

  useEffect(() => {
    // Show popup after a short delay for smooth appearance
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let animationId: ReturnType<typeof setTimeout>;
    
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseBeforeDelete = 1500;
    const pauseBeforeNextPhrase = 500;
    
    const animate = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (!isDeleting) {
        // Typing forward
        if (charIndex <= currentPhrase.length) {
          setPlaceholder(currentPhrase.slice(0, charIndex));
          charIndex++;
          animationId = setTimeout(animate, typeSpeed);
        } else {
          // Finished typing, pause then start deleting
          animationId = setTimeout(() => {
            isDeleting = true;
            charIndex = currentPhrase.length;
            animate();
          }, pauseBeforeDelete);
        }
      } else {
        // Deleting backward
        if (charIndex >= 0) {
          setPlaceholder(currentPhrase.slice(0, charIndex));
          charIndex--;
          animationId = setTimeout(animate, deleteSpeed);
        } else {
          // Finished deleting, move to next phrase
          phraseIndex = (phraseIndex + 1) % phrases.length;
          animationId = setTimeout(() => {
            isDeleting = false;
            charIndex = 0;
            animate();
          }, pauseBeforeNextPhrase);
        }
      }
    };
    
    animationId = setTimeout(animate, typeSpeed);

    return () => clearTimeout(animationId);
  }, [isVisible]);

  const handleSubmit = () => {
    if (input.trim()) {
      // Open the main chat with the query
      onOpenChat();
    } else {
      onOpenChat();
    }
  };

  const handleInputClick = () => {
    // Open main chat when clicking the input
    onOpenChat();
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-popup-container">
      <div className="welcome-input-bar">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onClick={handleInputClick}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="welcome-input"
        />
        <button className="welcome-ai-btn" onClick={handleSubmit} aria-label="AI Assistant">
          <svg viewBox="0 0 24 24" fill="none" className="ai-sparkle-icon">
            <path d="M12 2L13.09 8.26L19 7L14.74 11.74L21 14L14.74 14.74L19 21L12 16L5 21L9.26 14.74L3 14L9.26 11.74L5 7L10.91 8.26L12 2Z" 
              fill="url(#sparkleGradient)" />
            <defs>
              <linearGradient id="sparkleGradient" x1="3" y1="2" x2="21" y2="21">
                <stop offset="0%" stopColor="#4285f4"/>
                <stop offset="50%" stopColor="#9b72cb"/>
                <stop offset="100%" stopColor="#d96570"/>
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
}
