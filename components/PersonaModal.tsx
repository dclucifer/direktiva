import React, { useState, useEffect } from 'react';
import { AIPersona } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

interface PersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (persona: Omit<AIPersona, 'id'>, id: string | null) => void;
    personaToEdit: AIPersona | null;
}

const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, onClose, onSave, personaToEdit }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [systemInstruction, setSystemInstruction] = useState('');

    useEffect(() => {
        if (personaToEdit) {
            setName(personaToEdit.name);
            setDescription(personaToEdit.description);
            setSystemInstruction(personaToEdit.systemInstruction);
        } else {
            setName('');
            setDescription('');
            setSystemInstruction('');
        }
    }, [personaToEdit, isOpen]);

    const handleSave = () => {
        if (!name.trim() || !systemInstruction.trim()) {
            alert('Persona Name and System Instruction cannot be empty.'); // Replace with a better notification
            return;
        }
        onSave(
            { name, description, systemInstruction },
            personaToEdit ? personaToEdit.id : null
        );
    };

    const title = personaToEdit ? t('edit_persona') : t('create_new_persona');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <Input
                    label={t('persona_name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('persona_name_placeholder')}
                    required
                />
                <Input
                    label={t('persona_description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('persona_description_placeholder')}
                />
                <Textarea
                    label={t('system_instruction')}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    placeholder={t('persona_instruction_placeholder')}
                    rows={8}
                    required
                />
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button onClick={handleSave}>{t('save')}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PersonaModal;