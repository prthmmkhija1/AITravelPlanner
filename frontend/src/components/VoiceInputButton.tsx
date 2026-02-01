import { useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function VoiceInputButton({ 
  onTranscript, 
  disabled = false,
  className = '',
  size = 'medium'
}: VoiceInputButtonProps) {
  const {
    isListening,
    isSupported,
    transcript,
    error,
    toggleListening,
    clearTranscript,
  } = useVoiceInput({
    continuous: false,
    language: 'en-US',
  });

  // When we get a final transcript, pass it to parent
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      clearTranscript();
    }
  }, [transcript, isListening, onTranscript, clearTranscript]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  const sizeClasses = {
    small: 'voice-btn-small',
    medium: 'voice-btn-medium',
    large: 'voice-btn-large'
  };

  return (
    <div className={`voice-input-container ${className}`}>
      <button
        type="button"
        className={`voice-input-btn ${sizeClasses[size]} ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Voice input'}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        {isListening ? (
          // Animated microphone with waves
          <svg viewBox="0 0 24 24" fill="none" className="voice-icon listening">
            <path 
              d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" 
              fill="currentColor"
            />
            <path 
              d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.5v3.5M8 22h8" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            {/* Sound waves */}
            <circle className="voice-wave voice-wave-1" cx="12" cy="11" r="5" />
            <circle className="voice-wave voice-wave-2" cx="12" cy="11" r="8" />
            <circle className="voice-wave voice-wave-3" cx="12" cy="11" r="11" />
          </svg>
        ) : (
          // Static microphone icon
          <svg viewBox="0 0 24 24" fill="none" className="voice-icon">
            <path 
              d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" 
              fill="currentColor"
            />
            <path 
              d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.5v3.5M8 22h8" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
        
        {isListening && (
          <span className="voice-status-dot"></span>
        )}
      </button>
      
      {/* Error tooltip */}
      {error && (
        <div className="voice-error-tooltip">
          {error}
        </div>
      )}
      
      {/* Listening indicator */}
      {isListening && (
        <div className="voice-listening-indicator">
          <span className="voice-listening-text">Listening...</span>
        </div>
      )}
    </div>
  );
}
