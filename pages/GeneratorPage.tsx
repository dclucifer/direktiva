import React, { useState, useEffect } from 'react';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import { GenerationInput, Script, AIPersona } from '../types';
import { generateScripts, reviseScript, fetchTrendingTopics } from '../services/geminiService';
import { useTranslation } from '../hooks/useTranslation';
import ScriptDetailModal from '../components/ScriptDetailModal';
import ReviseScriptModal from '../components/ReviseScriptModal';
import RevisionComparisonModal from '../components/EditScriptModal';
import { DEFAULT_PERSONA } from '../constants';

const GeneratorPage: React.FC = () => {
    const [generationInput, setGenerationInput] = useState<GenerationInput | null>(null);
    const [generatedScripts, setGeneratedScripts] = useState<Script[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t, language } = useTranslation();

    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([DEFAULT_PERSONA]);

    // State for the new revision flow
    const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [scriptToRevise, setScriptToRevise] = useState<Script | null>(null);
    const [revisedScript, setRevisedScript] = useState<Script | null>(null);
    const [revisionInstruction, setRevisionInstruction] = useState('');
    const [isRevising, setIsRevising] = useState(false);

    useEffect(() => {
        try {
            const storedPersonas = localStorage.getItem('direktiva_ai_personas');
            if (storedPersonas) {
                setAiPersonas([DEFAULT_PERSONA, ...JSON.parse(storedPersonas)]);
            }
        } catch (error) {
            console.error("Failed to load AI personas from localStorage", error);
        }
    }, []);

    const handleGenerate = async (input: GenerationInput) => {
        setIsLoading(true);
        setError(null);
        setGeneratedScripts([]);
        setGenerationInput(input);
        try {
            const selectedPersona = aiPersonas.find(p => p.id === input.aiPersonaId) || DEFAULT_PERSONA;
            
            let trends = "";
            if (input.useTrendAnalysis) {
                trends = await fetchTrendingTopics(input, language);
            }

            const scripts = await generateScripts(input, language, selectedPersona.systemInstruction, trends);
            setGeneratedScripts(scripts);
        } catch (err) {
            if (err instanceof Error && err.message === 'GENERATION_TIMEOUT') {
                setError(t('generation_error_timeout'));
            } else {
                setError(t('generation_error'));
            }
            console.error("Generation failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenReviseModal = (script: Script) => {
        setScriptToRevise(script);
        setSelectedScript(null); // Close detail modal
        setIsReviseModalOpen(true);
    };

    const handleRevisionSubmit = async (partsToRevise: Array<'hook' | 'content' | 'cta'>, instruction: string) => {
        if (!scriptToRevise) return;
        
        setIsRevising(true);
        setRevisionInstruction(instruction); // Save instruction for potential re-generation
        try {
             const selectedPersona = aiPersonas.find(p => p.id === scriptToRevise.inputSnapshot.aiPersonaId) || DEFAULT_PERSONA;
            const result = await reviseScript(scriptToRevise, partsToRevise, instruction, language, selectedPersona.systemInstruction);
            setRevisedScript(result);
            setIsReviseModalOpen(false);
            setIsComparisonModalOpen(true);
        } catch (err) {
            setError(t('generation_error'));
            console.error(err);
        } finally {
            setIsRevising(false);
        }
    };

    const handleScriptUpdate = (updatedScript: Script) => {
        const newScripts = generatedScripts.map(s => s.id === updatedScript.id ? updatedScript : s);
        setGeneratedScripts(newScripts);
        if (selectedScript && selectedScript.id === updatedScript.id) {
            setSelectedScript(updatedScript);
        }
    };


    const handleApplyRevision = () => {
        if (revisedScript) {
            handleScriptUpdate(revisedScript);
        }
        handleCloseComparisonModal();
    };

    const handleRegenerateAgain = () => {
        setIsComparisonModalOpen(false);
        handleRevisionSubmit(['hook', 'content', 'cta'], revisionInstruction); // Re-run with the same instruction
    };
    
    const handleCloseComparisonModal = () => {
        setIsComparisonModalOpen(false);
        setScriptToRevise(null);
        setRevisedScript(null);
        setRevisionInstruction('');
    };

    const handleCloseDetailModal = () => {
        setSelectedScript(null);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
                <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
            <div className="lg:w-2/3">
                <OutputPanel 
                    scripts={generatedScripts} 
                    isLoading={isLoading} 
                    error={error}
                    input={generationInput}
                    onSelectScript={setSelectedScript}
                />
            </div>

            {selectedScript && (
                <ScriptDetailModal
                    isOpen={!!selectedScript}
                    onClose={handleCloseDetailModal}
                    script={selectedScript}
                    onRevise={() => handleOpenReviseModal(selectedScript)}
                    onUpdateScript={handleScriptUpdate}
                />
            )}
            
            {isReviseModalOpen && scriptToRevise && (
                <ReviseScriptModal
                    isOpen={isReviseModalOpen}
                    onClose={() => setIsReviseModalOpen(false)}
                    originalScript={scriptToRevise}
                    onRegenerate={handleRevisionSubmit}
                    isLoading={isRevising}
                />
            )}

            {isComparisonModalOpen && scriptToRevise && revisedScript && (
                <RevisionComparisonModal
                    isOpen={isComparisonModalOpen}
                    onClose={handleCloseComparisonModal}
                    originalScript={scriptToRevise}
                    revisedScript={revisedScript}
                    onApply={handleApplyRevision}
                    onRegenerateAgain={handleRegenerateAgain}
                    revisionInstruction={revisionInstruction}
                    isLoading={isRevising}
                />
            )}
        </div>
    );
};

export default GeneratorPage;