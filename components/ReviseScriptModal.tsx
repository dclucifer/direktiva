import React, { useState } from 'react';
import Card from './ui/Card';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Script, ScriptPart } from '../types';

interface ScriptPartPreviewProps {
    part: ScriptPart | ScriptPart[];
    t: (key: string) => string;
}

const ScriptPartPreview: React.FC<ScriptPartPreviewProps> = ({ part, t }) => {
    const formatPart = (p: ScriptPart) => {
        const visualIdeas = p.visual_ideas.map(idea => `${t('visual_idea_prefix')}: ${idea.description}`).join('\n');
        return `${t('script_text_prefix')}: ${p.dialogue}\n${visualIdeas}`;
    };

    if (Array.isArray(part)) {
        return <>{part.map(p => formatPart(p)).join('\n\n')}</>;
    }
    return <>{formatPart(part)}</>;
};

// fix: Added missing props interface for the ReviseScriptModal component.
interface ReviseScriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalScript: Script;
    onRegenerate: (partsToRevise: Array<'hook' | 'content' | 'cta'>, instruction: string) => void;
    isLoading: boolean;
}

const ReviseScriptModal: React.FC<ReviseScriptModalProps> = ({ isOpen, onClose, originalScript, onRegenerate, isLoading }) => {
    const { t } = useTranslation();
    const [instruction, setInstruction] = useState('');
    const [partsToRevise, setPartsToRevise] = useState<Set<'hook' | 'content' | 'cta'>>(new Set(['hook', 'content', 'cta']));

    const handleCheckboxChange = (part: 'hook' | 'content' | 'cta') => {
        setPartsToRevise(prev => {
            const newSet = new Set(prev);
            if (newSet.has(part)) {
                newSet.delete(part);
            } else {
                newSet.add(part);
            }
            return newSet;
        });
    };

    const handleRegenerateClick = () => {
        onRegenerate(Array.from(partsToRevise), instruction);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
            <Card className="w-full max-w-3xl p-6 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('refine_script')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">{t('original_version_reference')}</h3>
                    <div className="p-3 bg-slate-800/50 rounded-md max-h-40 overflow-y-auto text-sm text-slate-300 whitespace-pre-wrap font-mono">
                        {t('script_title_prefix')}{originalScript.title}
                        <br/><br/>{t('hook_section_title')}<br/>
                        <ScriptPartPreview part={originalScript.hook} t={t} />
                        <br/><br/>{t('content_section_title')}<br/>
                        <ScriptPartPreview part={originalScript.content} t={t} />
                        <br/><br/>{t('cta_section_title')}<br/>
                        <ScriptPartPreview part={originalScript.cta} t={t} />
                    </div>
                </div>

                <p className="text-xs text-yellow-400/80 bg-yellow-900/30 p-2 rounded-md mb-4">{t('important_notice')}</p>

                <div className="mb-4">
                    <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-md">
                        {([ 'hook', 'content', 'cta' ] as const).map(part => (
                            <label key={part} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={partsToRevise.has(part)}
                                    onChange={() => handleCheckboxChange(part)}
                                    className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="font-semibold">{t(part)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <Textarea
                    label={t('revision_instruction')}
                    placeholder={t('revision_placeholder')}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    rows={2}
                    className="bg-slate-800/50"
                />

                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('cancel')}</Button>
                    <Button onClick={handleRegenerateClick} disabled={!instruction || partsToRevise.size === 0 || isLoading}>
                        {isLoading ? t('revising') : t('regenerate')}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ReviseScriptModal;