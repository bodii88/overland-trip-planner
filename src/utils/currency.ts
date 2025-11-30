// Free currency API - exchangerate-api.com provides free tier
const API_BASE = 'https://api.exchangerate-api.com/v4/latest/KWD';

// Cache for exchange rates
let cachedRates: Record<string, number> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// All world currencies (major ones)
export const ALL_CURRENCIES = {
    // Middle East & Gulf
    KWD: 'Kuwaiti Dinar',
    SAR: 'Saudi Riyal',
    AED: 'UAE Dirham',
    QAR: 'Qatari Riyal',
    OMR: 'Omani Rial',
    BHD: 'Bahraini Dinar',
    JOD: 'Jordanian Dinar',

    // Major Currencies
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CHF: 'Swiss Franc',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    NZD: 'New Zealand Dollar',

    // Asian Currencies
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    KRW: 'South Korean Won',
    THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit',
    IDR: 'Indonesian Rupiah',
    PHP: 'Philippine Peso',
    VND: 'Vietnamese Dong',

    // European Currencies
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    CZK: 'Czech Koruna',
    HUF: 'Hungarian Forint',
    RON: 'Romanian Leu',
    BGN: 'Bulgarian Lev',
    HRK: 'Croatian Kuna',
    RUB: 'Russian Ruble',
    TRY: 'Turkish Lira',

    // African Currencies
    ZAR: 'South African Rand',
    EGP: 'Egyptian Pound',
    NGN: 'Nigerian Naira',
    KES: 'Kenyan Shilling',
    MAD: 'Moroccan Dirham',
    TND: 'Tunisian Dinar',

    // Latin American Currencies
    BRL: 'Brazilian Real',
    MXN: 'Mexican Peso',
    ARS: 'Argentine Peso',
    CLP: 'Chilean Peso',
    COP: 'Colombian Peso',
    PEN: 'Peruvian Sol',

    // Other
    ILS: 'Israeli Shekel',
    PKR: 'Pakistani Rupee',
    BDT: 'Bangladeshi Taka',
    LKR: 'Sri Lankan Rupee',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF',
    CAD: 'C$', AUD: 'A$', NZD: 'NZ$', CNY: '¥', INR: '₹',
    SGD: 'S$', HKD: 'HK$', KRW: '₩', THB: '฿', MYR: 'RM',
    IDR: 'Rp', PHP: '₱', VND: '₫', SEK: 'kr', NOK: 'kr',
    DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei',
    BGN: 'лв', HRK: 'kn', RUB: '₽', TRY: '₺', ZAR: 'R',
    EGP: 'E£', NGN: '₦', KES: 'KSh', MAD: 'MAD', TND: 'TND',
    BRL: 'R$', MXN: 'Mex$', ARS: '$', CLP: '$', COP: '$',
    PEN: 'S/', ILS: '₪', PKR: '₨', BDT: '৳', LKR: 'Rs',
    KWD: 'KWD', SAR: 'SAR', AED: 'AED', QAR: 'QAR', OMR: 'OMR',
    BHD: 'BHD', JOD: 'JOD',
};

/**
 * Fetch live exchange rates from API
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();
        cachedRates = data.rates;
        lastFetchTime = Date.now();

        // Store in localStorage for offline use
        localStorage.setItem('exchangeRates', JSON.stringify(cachedRates));
        localStorage.setItem('exchangeRatesTime', lastFetchTime.toString());

        return cachedRates!;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);

        // Fallback to cached rates from localStorage
        const stored = localStorage.getItem('exchangeRates');
        if (stored) {
            cachedRates = JSON.parse(stored);
            return cachedRates!;
        }

        // Ultimate fallback to static rates
        return getStaticRates();
    }
}

/**
 * Get exchange rates (from cache or fetch if needed)
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
    const now = Date.now();

    // Return cached rates if still valid
    if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedRates;
    }

    // Try to load from localStorage first
    const storedRates = localStorage.getItem('exchangeRates');
    const storedTime = localStorage.getItem('exchangeRatesTime');

    if (storedRates && storedTime) {
        const time = parseInt(storedTime, 10);
        if ((now - time) < CACHE_DURATION) {
            cachedRates = JSON.parse(storedRates);
            lastFetchTime = time;
            return cachedRates!;
        }
    }

    // Fetch new rates
    return await fetchExchangeRates();
}

/**
 * Static fallback rates (relative to KWD)
 */
function getStaticRates(): Record<string, number> {
    return {
        KWD: 1,
        USD: 3.25, EUR: 3.55, GBP: 4.15, JPY: 0.022, CHF: 3.68,
        CAD: 2.32, AUD: 2.11, NZD: 1.95, CNY: 0.45, INR: 0.039,
        SGD: 2.42, HKD: 0.42, KRW: 0.0024, THB: 0.094, MYR: 0.73,
        IDR: 0.00021, PHP: 0.056, VND: 0.00013, SEK: 0.31, NOK: 0.30,
        DKK: 0.48, PLN: 0.82, CZK: 0.14, HUF: 0.0084, RON: 0.71,
        BGN: 1.82, HRK: 0.47, RUB: 0.034, TRY: 0.094, ZAR: 0.18,
        EGP: 0.066, NGN: 0.0021, KES: 0.025, MAD: 0.33, TND: 1.06,
        BRL: 0.55, MXN: 0.16, ARS: 0.0033, CLP: 0.0034, COP: 0.00077,
        PEN: 0.86, ILS: 0.89, PKR: 0.012, BDT: 0.027, LKR: 0.011,
        SAR: 0.87, AED: 0.88, QAR: 0.89, OMR: 8.45, BHD: 8.62, JOD: 4.58,
    };
}

/**
 * Convert amount from KWD to target currency
 */
export function convertFromKWD(amountInKWD: number, targetCurrency: string, rates?: Record<string, number>): number {
    if (!rates) {
        rates = cachedRates || getStaticRates();
    }

    const rate = rates[targetCurrency] || 1;
    return amountInKWD * rate;
}

/**
 * Format currency with proper symbol and formatting
 */
export function formatCurrency(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const rounded = Math.round(amount);
    return `${rounded.toLocaleString()} ${symbol}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Get currency name
 */
export function getCurrencyName(code: string): string {
    return ALL_CURRENCIES[code as keyof typeof ALL_CURRENCIES] || code;
}

/**
 * Initialize currency system (call on app start)
 */
export async function initializeCurrency(): Promise<void> {
    try {
        await getExchangeRates();
        console.log('✅ Exchange rates loaded');
    } catch (error) {
        console.error('❌ Failed to load exchange rates:', error);
    }
}
