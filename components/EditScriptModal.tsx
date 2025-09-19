import React from 'react';
import Card from './ui/Card';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Script, ScriptPart } from '../types';

interface RevisionComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalScript: Script;
    revisedScript: Script;
    onApply: () => void;
    onRegenerateAgain: () => void;
    revisionInstruction: string;
    isLoading: boolean;
}

const ScriptPreview: React.FC<{ script: Script; title: string; borderColor?: string }> = ({ script, title, borderColor = 'border-gray-700' }) => {
    const { t } = useTranslation();
    return (
        <div className={`w-1/2 p-3 bg-slate-800/50 rounded-lg border ${borderColor}`}>
            <h4 className="font-bold text-center mb-2">{title}</h4>
            <div className="text-xs text-slate-300 whitespace-pre-wrap font-mono h-64 overflow-y-auto">
                 {t('modal_title_prefix')}{script.title}
                <br/><br/>{t('modal_hook_section_title')}<br/>
                {script.hook.dialogue}
                <br/><br/>{t('modal_content_section_title')}<br/>
                {script.content.map(p => p.dialogue).join('\n')}
                <br/><br/>{t('modal_cta_section_title')}<br/>
                {script.cta.dialogue}
            </div>
        </div>
    );
};

const RevisionComparisonModal: React.FC<RevisionComparisonModalProps> = ({ isOpen, onClose, originalScript, revisedScript, onApply, onRegenerateAgain, revisionInstruction, isLoading }) => {
    const { t } = useTranslation();
   
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
            <Card className="w-full max-w-5xl p-6 relative">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold">{t('revision_comparison')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex gap-4 mb-4">
                    <ScriptPreview script={originalScript} title={t('original_version')} />
                    <ScriptPreview script={revisedScript} title={t('new_version_result')} borderColor="border-green-500" />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t('improve_instruction')}</label>
                    <div className="p-3 bg-slate-800/50 rounded-md text-slate-300">
                        {revisionInstruction}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('cancel')}</Button>
                    <Button variant="secondary" onClick={onRegenerateAgain} disabled={isLoading}>
                        {isLoading ? t('revising') : t('regenerate_again')}
                    </Button>
                    <Button onClick={onApply} disabled={isLoading}>
                        {t('apply_changes')}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default RevisionComparisonModal;