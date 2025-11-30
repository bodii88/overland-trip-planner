import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<string>(() => {
        return localStorage.getItem('selectedCurrency') || 'KWD';
    });

    useEffect(() => {
        localStorage.setItem('selectedCurrency', currency);
    }, [currency]);

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
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
