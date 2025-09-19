import React from 'react';
import { Script } from '../types';
import Card from './ui/Card';
import { useTranslation } from '../hooks/useTranslation';

interface ScriptOptionCardProps {
    script: Script;
    index: number;
    onClick: () => void;
}

const ScriptOptionCard: React.FC<ScriptOptionCardProps> = ({ script, index, onClick }) => {
    const { t } = useTranslation();

    return (
        <Card 
            onClick={onClick}
            className="p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary-700/20 dark:hover:shadow-primary-600/30 hover:border-primary-500/50 cursor-pointer border-2 border-transparent"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold truncate pr-4">
                    {t('script_option')} #{index}: {script.title}
                </h3>
                <div className="flex items-center space-x-3 flex-shrink-0">
                    {script.isBestOption && (
                        <span className="px-3 py-1 text-xs font-bold text-amber-900 bg-amber-300 dark:bg-amber-400 dark:text-amber-900 rounded-full">
                            {t('best_option')}
                        </span>
                    )}
                    <span className="px-3 py-1 text-xs font-bold text-green-900 bg-green-200 dark:bg-green-300 dark:text-green-900 rounded-full">
                        {t('score')} {script.score}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default ScriptOptionCard;