import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeCurrency, getExchangeRates } from '../utils/currency';

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    exchangeRates: Record<string, number> | null;
    refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<string>(() => {
        return localStorage.getItem('selectedCurrency') || 'KWD';
    });

    const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);

    // Initialize currency rates on mount
    useEffect(() => {
        initializeCurrency().then(() => {
            getExchangeRates().then(setExchangeRates);
        });
    }, []);

    useEffect(() => {
        localStorage.setItem('selectedCurrency', currency);
    }, [currency]);

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency);
    };

    const refreshRates = async () => {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, refreshRates }}>
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
