import React, { useState, useEffect, useContext } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { GeneralPreset, CharacterPreset, AppContextType, AIPersona } from '../types';
import { AppContext } from '../contexts/AppContext';
import PersonaModal from '../components/PersonaModal';
import { v4 as uuidv4 } from 'uuid';

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useContext(AppContext) as AppContextType;
    const [generalPresets, setGeneralPresets] = useState<GeneralPreset[]>([]);
    const [characterPresets, setCharacterPresets] = useState<CharacterPreset[]>([]);
    const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([]);
    
    const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
    const [personaToEdit, setPersonaToEdit] = useState<AIPersona | null>(null);

    useEffect(() => {
        try {
            const storedGeneral = localStorage.getItem('direktiva_presets');
            if (storedGeneral) setGeneralPresets(JSON.parse(storedGeneral));

            const storedCharacter = localStorage.getItem('direktiva_character_presets');
            if (storedCharacter) setCharacterPresets(JSON.parse(storedCharacter));

            const storedPersonas = localStorage.getItem('direktiva_ai_personas');
            if (storedPersonas) setAiPersonas(JSON.parse(storedPersonas));
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);


    const handleDeleteGeneralPreset = (id: string) => {
        if (window.confirm(t('delete_preset_confirm'))) {
            const updatedPresets = generalPresets.filter(p => p.id !== id);
            setGeneralPresets(updatedPresets);
            localStorage.setItem('direktiva_presets', JSON.stringify(updatedPresets));
            addToast(t('preset_deleted'), 'success');
        }
    };

    const handleDeleteCharacterPreset = (id: string) => {
        if (window.confirm(t('delete_preset_confirm'))) {
            const updatedPresets = characterPresets.filter(p => p.id !== id);
            setCharacterPresets(updatedPresets);
            localStorage.setItem('direktiva_character_presets', JSON.stringify(updatedPresets));
            addToast(t('preset_deleted'), 'success');
        }
    };

    const handleOpenPersonaModal = (persona: AIPersona | null = null) => {
        setPersonaToEdit(persona);
        setIsPersonaModalOpen(true);
    };
    
    const handleSavePersona = (persona: Omit<AIPersona, 'id'>, id: string | null) => {
        let updatedPersonas;
        if (id) { // Editing existing persona
            updatedPersonas = aiPersonas.map(p => p.id === id ? { ...p, ...persona } : p);
            addToast(t('persona_updated'), 'success');
        } else { // Creating new persona
            updatedPersonas = [...aiPersonas, { id: uuidv4(), ...persona }];
            addToast(t('persona_saved'), 'success');
        }
        setAiPersonas(updatedPersonas);
        localStorage.setItem('direktiva_ai_personas', JSON.stringify(updatedPersonas));
        setIsPersonaModalOpen(false);
    };

    const handleDeletePersona = (id: string) => {
        if (window.confirm(t('delete_persona_confirm'))) {
            const updatedPersonas = aiPersonas.filter(p => p.id !== id);
            setAiPersonas(updatedPersonas);
            localStorage.setItem('direktiva_ai_personas', JSON.stringify(updatedPersonas));
            addToast(t('persona_deleted'), 'success');
        }
    };


    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">{t('settings')}</h1>
                
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">{t('manage_presets')}</h2>
                    <p className="text-sm text-subtext mb-6">
                        Untuk mengedit konten preset, silakan muat preset di halaman Generator, lakukan perubahan, lalu simpan dengan nama yang sama untuk menimpanya.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* General Settings Presets */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">{t('settings_presets')}</h3>
                            <div className="space-y-3">
                                {generalPresets.length > 0 ? (
                                    generalPresets.map(preset => (
                                        <Card key={preset.id} className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                                            <span className="font-medium">{preset.name}</span>
                                            <div className="flex gap-2">
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteGeneralPreset(preset.id)}>{t('delete')}</Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-sm text-subtext">{t('no_presets_found')}</p>
                                )}
                            </div>
                        </div>
                        {/* Character Presets */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">{t('character_presets')}</h3>
                            <div className="space-y-3">
                                {characterPresets.length > 0 ? (
                                    characterPresets.map(preset => (
                                        <Card key={preset.id} className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                                        <div>
                                                <p className="font-medium">{preset.name}</p>
                                                <p className="text-xs text-subtext">{preset.character.identity.name}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteCharacterPreset(preset.id)}>{t('delete')}</Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-sm text-subtext">{t('no_presets_found')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('manage_ai_personas')}</h2>
                        <Button onClick={() => handleOpenPersonaModal()}>{t('create_new_persona')}</Button>
                    </div>
                    <div className="space-y-4">
                        {aiPersonas.length > 0 ? (
                            aiPersonas.map(persona => (
                                <Card key={persona.id} className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                                    <div>
                                        <h3 className="font-semibold">{persona.name}</h3>
                                        <p className="text-sm text-gray-500">{persona.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenPersonaModal(persona)}>{t('edit')}</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeletePersona(persona.id)}>{t('delete')}</Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p className="text-sm text-subtext">{t('no_presets_found')}</p>
                        )}
                    </div>
                </Card>
            </div>
            
            {isPersonaModalOpen && (
                <PersonaModal
                    isOpen={isPersonaModalOpen}
                    onClose={() => setIsPersonaModalOpen(false)}
                    onSave={handleSavePersona}
                    personaToEdit={personaToEdit}
                />
            )}
        </>
    );
};

export default SettingsPage;