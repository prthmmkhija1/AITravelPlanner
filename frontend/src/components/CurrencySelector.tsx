import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { CurrencyCode } from '../services/currencyService';
import './CurrencySelector.css';

interface CurrencySelectorProps {
  variant?: 'dropdown' | 'compact';
}

export default function CurrencySelector({ variant = 'dropdown' }: CurrencySelectorProps) {
  const { currency, currencies, setCurrency, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = currencies.find(c => c.code === currency);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="currency-selector-compact" ref={dropdownRef}>
        <button 
          className="currency-trigger-compact"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <span className="currency-flag">{currentCurrency?.flag}</span>
          <span className="currency-code">{currency}</span>
          <svg className={`chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isOpen && (
          <div className="currency-dropdown-compact">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                className={`currency-option-compact ${currency === curr.code ? 'selected' : ''}`}
                onClick={() => handleSelect(curr.code)}
              >
                <span className="currency-flag">{curr.flag}</span>
                <span className="currency-code">{curr.code}</span>
                <span className="currency-symbol">{curr.symbol}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="currency-selector" ref={dropdownRef}>
      <button 
        className="currency-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-expanded={isOpen}
      >
        <span className="currency-flag">{currentCurrency?.flag}</span>
        <div className="currency-info">
          <span className="currency-code">{currency}</span>
          <span className="currency-name">{currentCurrency?.name}</span>
        </div>
        <svg className={`chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          <div className="currency-dropdown-header">
            <span>Select Currency</span>
          </div>
          <div className="currency-list">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                className={`currency-option ${currency === curr.code ? 'selected' : ''}`}
                onClick={() => handleSelect(curr.code)}
              >
                <span className="currency-flag">{curr.flag}</span>
                <div className="currency-details">
                  <span className="currency-code">{curr.code}</span>
                  <span className="currency-name">{curr.name}</span>
                </div>
                <span className="currency-symbol">{curr.symbol}</span>
                {currency === curr.code && (
                  <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
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
