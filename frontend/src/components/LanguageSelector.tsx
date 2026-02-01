import { useState, useRef, useEffect } from 'react';
import { useLanguage, SupportedLanguage } from '../i18n';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline' | 'navbar';
  showFlags?: boolean;
  showNativeName?: boolean;
}

export default function LanguageSelector({ 
  variant = 'dropdown',
  showFlags = true,
  showNativeName = true 
}: LanguageSelectorProps) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(l => l.code === language);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Navbar variant - compact, same size as currency selector
  if (variant === 'navbar') {
    return (
      <div className="language-selector-navbar" ref={dropdownRef}>
        <button 
          className="navbar-selector-btn"
          onClick={() => setIsOpen(!isOpen)}
          title={currentLanguage?.name}
        >
          <span className="selector-flag">{currentLanguage?.flag}</span>
          <svg className={`selector-chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isOpen && (
          <div className="navbar-dropdown language-dropdown-navbar">
            <div className="navbar-dropdown-header">
              <span>🌍</span> Select Language
            </div>
            <div className="navbar-dropdown-list">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`navbar-dropdown-option ${language === lang.code ? 'selected' : ''}`}
                  onClick={() => handleSelect(lang.code)}
                >
                  <span className="option-flag">{lang.flag}</span>
                  <div className="option-info">
                    <span className="option-native">{lang.nativeName}</span>
                    <span className="option-name">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <svg className="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="language-selector-inline">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`lang-btn ${language === lang.code ? 'active' : ''}`}
            title={lang.name}
          >
            {showFlags && <span className="flag">{lang.flag}</span>}
            <span className="code">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className="language-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showFlags && <span className="flag">{currentLanguage?.flag}</span>}
        <span className="lang-name">
          {showNativeName ? currentLanguage?.nativeName : currentLanguage?.name}
        </span>
        <svg 
          className={`chevron ${isOpen ? 'open' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown" role="listbox">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'selected' : ''}`}
              onClick={() => handleSelect(lang.code)}
              role="option"
              aria-selected={language === lang.code}
            >
              {showFlags && <span className="flag">{lang.flag}</span>}
              <div className="lang-info">
                <span className="native-name">{lang.nativeName}</span>
                <span className="english-name">{lang.name}</span>
              </div>
              {language === lang.code && (
                <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
