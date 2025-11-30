// Exchange rates relative to KWD (Kuwaiti Dinar)
// Update these periodically or fetch from an API
export const EXCHANGE_RATES: Record<string, number> = {
    KWD: 1,
    USD: 3.25,
    EUR: 3.55,
    GBP: 4.15,
    SAR: 0.87,
    AED: 0.88,
    OMR: 8.45,
    QAR: 0.89,
    BHD: 8.62,
    JOD: 4.58,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
    KWD: 'KWD',
    USD: '$',
    EUR: '€',
    GBP: '£',
    SAR: 'SAR',
    AED: 'AED',
    OMR: 'OMR',
    QAR: 'QAR',
    BHD: 'BHD',
    JOD: 'JOD',
};

export function convertFromKWD(amountInKWD: number, targetCurrency: string): number {
    const rate = EXCHANGE_RATES[targetCurrency] || 1;
    return amountInKWD * rate;
}

export function formatCurrency(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${Math.round(amount).toLocaleString()} ${symbol}`;
}

export function getCurrencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] || currency;
}
