import React from 'react';
import { Script, GenerationInput } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Card from './ui/Card';
import ScriptOptionCard from './ScriptOptionCard';
import Button from './ui/Button';
import SkeletonLoader from './ui/SkeletonLoader';

interface OutputPanelProps {
    scripts: Script[];
    isLoading: boolean;
    error: string | null;
    input: GenerationInput | null;
    onSelectScript: (script: Script) => void;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ scripts, isLoading, error, input, onSelectScript }) => {
    const { t } = useTranslation();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
                    {Array(3).fill(0).map((_, index) => (
                        <SkeletonLoader key={index} />
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
                    <h3 className="text-xl font-semibold">{t('error_occurred')}</h3>
                    <p>{error}</p>
                </div>
            );
        }

        if (scripts.length > 0) {
            return (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{t('script_options_title')}</h2>
                        <Button variant="secondary">{t('sort_by_score')}</Button>
                    </div>
                    <div className="space-y-4">
                        {scripts.map((script, index) => (
                            <ScriptOptionCard 
                                key={script.id} 
                                script={script} 
                                index={index + 1} 
                                onClick={() => onSelectScript(script)}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <Card className="p-8 text-center border-2 border-dashed border-border-color">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">{t('output_panel_title')}</h3>
                <p className="text-gray-500 mt-2">{t('output_panel_description')}</p>
            </Card>
        );
    };

    return (
        <div className="w-full">
            {renderContent()}
        </div>
    );
};

export default OutputPanel;