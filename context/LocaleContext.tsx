
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Locale = 'pt' | 'en';

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, ...args: any[]) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Um cache simples para evitar buscar novamente os arquivos de tradução
const translationsCache: Record<string, any> = {};

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>('pt');
    const [currentTranslations, setCurrentTranslations] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        const loadTranslations = async () => {
            // Garante que a tradução de fallback 'en' seja carregada e cacheada primeiro
            if (!translationsCache['en']) {
                try {
                    const response = await fetch('/locales/en.json');
                    if (!response.ok) throw new Error('Network response was not ok');
                    translationsCache['en'] = await response.json();
                } catch (e) {
                    console.error('Failed to load English translations', e);
                    translationsCache['en'] = {}; // Define como vazio para evitar nova busca em caso de erro
                }
            }
            
            // Carrega as traduções para o local atual se ainda não estiverem em cache
            if (!translationsCache[locale]) {
                 try {
                    const response = await fetch(`/locales/${locale}.json`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    translationsCache[locale] = await response.json();
                } catch (e) {
                    console.error(`Failed to load ${locale} translations`, e);
                    translationsCache[locale] = {}; // Define como vazio para evitar nova busca em caso de erro
                }
            }
            
            setCurrentTranslations(translationsCache[locale]);
        };
        
        loadTranslations();
    }, [locale]);

    const t = (key: string): string => {
        const keys = key.split('.');
        
        // Tenta obter a tradução do local atual
        let result: any = currentTranslations;
        if (result) {
            for (const k of keys) {
                result = result?.[k];
                if (result === undefined) break;
            }
        }

        // Se a tradução não for encontrada, recorre ao inglês
        if (result === undefined) {
             let fallbackResult: any = translationsCache['en'];
             if (fallbackResult) {
                 for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                    if (fallbackResult === undefined) break;
                 }
             }
             result = fallbackResult;
        }
        
        // Se ainda não for encontrado em nenhum idioma, retorna a própria chave
        return result || key;
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = (): LocaleContextType => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
