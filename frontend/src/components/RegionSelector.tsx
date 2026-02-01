import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage, SupportedLanguage } from '../i18n';
import { CurrencyCode } from '../services/currencyService';
import './RegionSelector.css';

interface RegionSelectorProps {
  variant?: 'navbar' | 'compact';
}

// Map language codes to country codes for flag images
const languageToCountry: Record<string, string> = {
  en: 'us',
  hi: 'in',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ar: 'sa',
  zh: 'cn',
  ja: 'jp',
};

// Map currency codes to country codes for flag images
const currencyToCountry: Record<string, string> = {
  INR: 'in',
  USD: 'us',
  EUR: 'eu',
  GBP: 'gb',
  AED: 'ae',
  THB: 'th',
  SGD: 'sg',
  MYR: 'my',
};

export default function RegionSelector({ variant = 'navbar' }: RegionSelectorProps) {
  const { currency, currencies, setCurrency } = useCurrency();
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = currencies.find(c => c.code === currency);
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

  const handleCurrencySelect = (code: CurrencyCode) => {
    setCurrency(code);
  };

  const handleLanguageSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  return (
    <div className="region-selector" ref={dropdownRef}>
      <button 
        className="region-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={`https://flagcdn.com/24x18/${currencyToCountry[currency] || 'in'}.png`}
          alt=""
          className="region-flag-img"
        />
        <span className="region-info">
          <span className="region-currency">{currency}</span>
          <span className="region-divider">|</span>
          <span className="region-language">{currentLanguage?.name || 'English'}</span>
        </span>
        <svg className={`region-chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="region-dropdown">
          {/* Language Section - First */}
          <div className="region-section">
            <div className="region-section-header">
              <span className="section-icon">🌐</span>
              <span>Language</span>
            </div>
            <div className="region-options-grid">
              {/* Reorder: Hindi first, then others */}
              {[...languages].sort((a, b) => a.code === 'hi' ? -1 : b.code === 'hi' ? 1 : 0).slice(0, 6).map((lang) => (
                <button
                  key={lang.code}
                  className={`region-option ${language === lang.code ? 'selected' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <img 
                    src={`https://flagcdn.com/20x15/${languageToCountry[lang.code] || 'in'}.png`}
                    alt=""
                    className="option-flag-img"
                  />
                  <span className="option-code">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="region-divider-line"></div>

          {/* Currency Section - Second */}
          <div className="region-section">
            <div className="region-section-header">
              <span className="section-icon">💱</span>
              <span>Currency</span>
            </div>
            <div className="region-options-grid">
              {currencies.slice(0, 6).map((curr) => (
                <button
                  key={curr.code}
                  className={`region-option ${currency === curr.code ? 'selected' : ''}`}
                  onClick={() => handleCurrencySelect(curr.code)}
                >
                  <img 
                    src={`https://flagcdn.com/20x15/${currencyToCountry[curr.code] || 'in'}.png`}
                    alt=""
                    className="option-flag-img"
                  />
                  <span className="option-code">{curr.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
