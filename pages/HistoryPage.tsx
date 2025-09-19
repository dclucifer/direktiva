import React, { useState, useEffect } from 'react';
import { Script } from '../types';
import ScriptSummaryCard from '../components/ScriptSummaryCard';
import ScriptDetailModal from '../components/ScriptDetailModal';
import { useTranslation } from '../hooks/useTranslation';
import { DEFAULT_EXAMPLE_SCRIPT } from '../constants';

const HistoryPage: React.FC = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<Script[]>([]);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);

    // Load history from localStorage on component mount
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('scriptHistory');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (parsedHistory.length > 0) {
                    setHistory(parsedHistory);
                } else {
                    setHistory([DEFAULT_EXAMPLE_SCRIPT]); // Seed if history is an empty array
                }
            } else {
                // Seed if no history item exists at all
                const initialHistory = [DEFAULT_EXAMPLE_SCRIPT];
                setHistory(initialHistory);
                localStorage.setItem('scriptHistory', JSON.stringify(initialHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            setHistory([DEFAULT_EXAMPLE_SCRIPT]); // Fallback to default script on error
        }
    }, []);


    const handleViewDetails = (script: Script) => {
        setSelectedScript(script);
    };

    const handleDelete = (scriptId: string) => {
        const updatedHistory = history.filter(script => script.id !== scriptId);
        setHistory(updatedHistory);
        localStorage.setItem('scriptHistory', JSON.stringify(updatedHistory));
    };

    // fix: Implement the 'onUpdateScript' handler to update history when a script is changed in the detail modal.
    const handleScriptUpdate = (updatedScript: Script) => {
        const newHistory = history.map(s => s.id === updatedScript.id ? updatedScript : s);
        setHistory(newHistory);
        localStorage.setItem('scriptHistory', JSON.stringify(newHistory));
        if (selectedScript && selectedScript.id === updatedScript.id) {
            setSelectedScript(updatedScript);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('generation_history')}</h1>
            {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map(script => (
                        <ScriptSummaryCard
                            key={script.id}
                            script={script}
                            onViewDetails={() => handleViewDetails(script)}
                            onDelete={() => handleDelete(script.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">{t('no_history_title')}</h2>
                    <p className="text-gray-500 mt-2">{t('no_history_description')}</p>
                </div>
            )}
            {selectedScript && (
                <ScriptDetailModal
                    isOpen={!!selectedScript}
                    onClose={() => setSelectedScript(null)}
                    script={selectedScript}
                    onUpdateScript={handleScriptUpdate}
                />
            )}
        </div>
    );
};

export default HistoryPage;
