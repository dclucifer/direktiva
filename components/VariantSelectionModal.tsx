import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { ScriptPart } from '../types';

interface VariantSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalPart: ScriptPart | ScriptPart[];
    variants: (ScriptPart | ScriptPart[])[];
    onSelectVariant: (variant: ScriptPart | ScriptPart[]) => void;
    partName: string;
}

const PartPreview: React.FC<{ part: ScriptPart | ScriptPart[], title: string, onSelect?: () => void }> = ({ part, title, onSelect }) => {
    const { t } = useTranslation();
    const partsArray = Array.isArray(part) ? part : [part];
    
    const dialogueText = partsArray.map(p => p.dialogue).join('\n\n');

    return (
        <div className="w-full p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col">
            <h4 className="font-bold text-center mb-2">{title}</h4>
            <div className="text-xs text-slate-300 whitespace-pre-wrap font-mono h-48 overflow-y-auto flex-grow">
                {dialogueText}
            </div>
            {onSelect && (
                <Button size="sm" onClick={onSelect} className="mt-3 w-full">
                    {t('use_this_version')}
                </Button>
            )}
        </div>
    );
};

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({ isOpen, onClose, originalPart, variants, onSelectVariant, partName }) => {
    const { t } = useTranslation();
   
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4 animate-fadeIn">
            <Card className="w-full max-w-4xl p-6 relative">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold">{t('variant_selection')} - <span className="uppercase text-primary-400">{t(partName)}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex gap-4 mb-4">
                    <PartPreview part={originalPart} title={t('original')} />
                    {variants.map((variant, index) => (
                        <PartPreview 
                            key={index} 
                            part={variant} 
                            title={`${t('variant')} ${index + 1}`}
                            onSelect={() => onSelectVariant(variant)}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default VariantSelectionModal;