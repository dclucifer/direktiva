import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppContextType } from '../types';
import { translations } from '../utils/translations';

export const useTranslation = () => {
    const { language } = useContext(AppContext) as AppContextType;

    const t = (key: string, params?: { [key: string]: string | number }) => {
        const langStrings = translations[language] || translations['en'];
        let template = langStrings[key] || key;

        if (params && typeof template === 'string') {
            return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
            }, template);
        }

        return template; // Fallback to key or untemplated string if no params
    };

    return { t, language };
};