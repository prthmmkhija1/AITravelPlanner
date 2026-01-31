import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  CurrencyCode,
  Currency,
  CURRENCIES,
  formatCurrency,
  convertCurrency,
  getStoredCurrency,
  setStoredCurrency,
  fetchExchangeRates,
} from '../services/currencyService';

interface CurrencyContextType {
  currency: CurrencyCode;
  currencies: Currency[];
  setCurrency: (code: CurrencyCode) => void;
  format: (amount: number, currencyCode?: CurrencyCode) => string;
  convert: (amount: number, from: CurrencyCode, to?: CurrencyCode) => Promise<number>;
  rates: Record<CurrencyCode, number> | null;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getStoredCurrency);
  const [rates, setRates] = useState<Record<CurrencyCode, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch exchange rates on mount
  useEffect(() => {
    const loadRates = async () => {
      setIsLoading(true);
      try {
        const fetchedRates = await fetchExchangeRates('INR');
        setRates(fetchedRates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRates();
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    setStoredCurrency(code);
  }, []);

  const format = useCallback((amount: number, currencyCode?: CurrencyCode) => {
    return formatCurrency(amount, currencyCode || currency);
  }, [currency]);

  const convert = useCallback(async (amount: number, from: CurrencyCode, to?: CurrencyCode) => {
    return convertCurrency(amount, from, to || currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencies: CURRENCIES,
        setCurrency,
        format,
        convert,
        rates,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
