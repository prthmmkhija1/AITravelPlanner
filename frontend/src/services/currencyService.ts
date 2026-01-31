/**
 * Currency Conversion Service
 * Supports multiple currencies with live exchange rate fetching
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'AED' | 'SGD' | 'THB';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
];

// Approximate exchange rates (against INR) - will be updated from API
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.79,
  AUD: 0.018,
  CAD: 0.016,
  AED: 0.044,
  SGD: 0.016,
  THB: 0.42,
};

let cachedRates: Record<CurrencyCode, number> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Fetch latest exchange rates from API
 */
export async function fetchExchangeRates(baseCurrency: CurrencyCode = 'INR'): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }
  
  try {
    // Using a free exchange rate API
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    // Map the rates to our currency codes
    const rates: Record<CurrencyCode, number> = { INR: 1 } as Record<CurrencyCode, number>;
    
    CURRENCIES.forEach(currency => {
      if (data.rates[currency.code]) {
        rates[currency.code] = data.rates[currency.code];
      } else {
        rates[currency.code] = FALLBACK_RATES[currency.code];
      }
    });
    
    cachedRates = rates;
    lastFetchTime = now;
    
    return rates;
  } catch (error) {
    console.warn('Using fallback exchange rates:', error);
    return FALLBACK_RATES;
  }
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rates = await fetchExchangeRates('INR');
  
  // Convert to INR first, then to target currency
  const amountInINR = fromCurrency === 'INR' 
    ? amount 
    : amount / rates[fromCurrency];
  
  const result = toCurrency === 'INR' 
    ? amountInINR 
    : amountInINR * rates[toCurrency];
  
  return Math.round(result * 100) / 100;
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: Intl.NumberFormatOptions
): string {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  
  return new Intl.NumberFormat(getCurrencyLocale(currency), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    ...options,
  }).format(amount);
}

/**
 * Get the appropriate locale for a currency
 */
function getCurrencyLocale(currency: CurrencyCode): string {
  const localeMap: Record<CurrencyCode, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    AUD: 'en-AU',
    CAD: 'en-CA',
    AED: 'ar-AE',
    SGD: 'en-SG',
    THB: 'th-TH',
  };
  
  return localeMap[currency] || 'en-US';
}

/**
 * Get currency info by code
 */
export function getCurrencyInfo(code: CurrencyCode): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

/**
 * Parse user input to extract amount and currency
 */
export function parseCurrencyInput(input: string): { amount: number; currency: CurrencyCode } | null {
  const cleanInput = input.trim().toUpperCase();
  
  // Try to match patterns like "1000 USD", "$1000", "₹1000", etc.
  const patterns = [
    /^(\d+(?:\.\d+)?)\s*(INR|USD|EUR|GBP|JPY|AUD|CAD|AED|SGD|THB)$/i,
    /^(₹|Rs\.?)\s*(\d+(?:\.\d+)?)$/i,
    /^\$\s*(\d+(?:\.\d+)?)$/i,
    /^€\s*(\d+(?:\.\d+)?)$/i,
    /^£\s*(\d+(?:\.\d+)?)$/i,
    /^¥\s*(\d+(?:\.\d+)?)$/i,
  ];
  
  // Match currency symbol to code
  const symbolMap: Record<string, CurrencyCode> = {
    '₹': 'INR',
    'RS': 'INR',
    'RS.': 'INR',
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
  };
  
  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match) {
      let amount: number;
      let currency: CurrencyCode;
      
      if (match[2] && /[A-Z]{3}/.test(match[2])) {
        amount = parseFloat(match[1]);
        currency = match[2] as CurrencyCode;
      } else if (symbolMap[match[1]?.toUpperCase()]) {
        amount = parseFloat(match[2]);
        currency = symbolMap[match[1].toUpperCase()];
      } else {
        amount = parseFloat(match[1] || match[2]);
        currency = 'INR';
      }
      
      if (!isNaN(amount)) {
        return { amount, currency };
      }
    }
  }
  
  // Try simple number
  const simpleNumber = parseFloat(cleanInput.replace(/[^0-9.]/g, ''));
  if (!isNaN(simpleNumber)) {
    return { amount: simpleNumber, currency: 'INR' };
  }
  
  return null;
}

/**
 * Currency context storage
 */
const CURRENCY_STORAGE_KEY = 'ai-travel-planner-currency';

export function getStoredCurrency(): CurrencyCode {
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (stored && CURRENCIES.find(c => c.code === stored)) {
    return stored as CurrencyCode;
  }
  return 'INR';
}

export function setStoredCurrency(currency: CurrencyCode): void {
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}
