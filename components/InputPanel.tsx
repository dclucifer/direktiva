import React, { useState, useMemo, useCallback, useEffect, useContext, useRef } from 'react';
import { GenerationInput, ProductImage, CharacterDetails, GeneralPreset, CharacterPreset, AppContextType, AIPersona } from '../types';
import { 
    PLATFORMS, PRODUCT_CATEGORIES, FASHION_CATEGORIES, TARGET_AUDIENCES, PLATFORM_CONTENT_MODES, VISUAL_STRATEGIES, 
    MODEL_STRATEGIES, ASPECT_RATIOS, WRITING_STYLES, TONES, PLATFORM_SPECIFIC_OPTIONS,
    FACE_SHAPES, HAIR_STYLES, DEFAULT_PERSONA
} from '../constants';
import Card from './ui/Card';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from './ui/Modal';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../contexts/AppContext';
import Toggle from './ui/Toggle';
import { analyzeProductUrl } from '../services/geminiService';


interface InputPanelProps {
    onGenerate: (input: GenerationInput) => void;
    isLoading: boolean;
}

const initialCharacter: CharacterDetails = {
    identity: { name: '', gender: 'female', age: '', ethnicity: '' },
    facialFeatures: { faceShape: 'oval', eyeColor: '', hairStyle: 'long_wavy', customHairStyle: '', hairColor: '' },
    physique: { skinTone: '', bodyShape: '', height: '' },
    styleAndAesthetics: { clothingStyle: '', dominantColor: '' },
    personality: { dominantAura: '', additionalNotes: '' }
};

const initialInput: GenerationInput = {
    productName: '',
    productType: '',
    productCategory: 'womens_fashion',
    productDescription: '',
    targetAudience: 'gen_z',
    brandVoice: '',
    platform: 'tiktok',
    contentMode: 'single_video',
    visualStrategy: 'user_generated',
    modelStrategy: 'none',
    writingStyle: 'casual',
    tone: 'entertaining',
    hookType: 'problem_solution_2025',
    ctaType: 'comment_challenge',
    duration: 30,
    aspectRatio: '9:16',
    useTrendAnalysis: false,
    character: initialCharacter,
    aiPersonaId: 'default', // Default Persona
    productImages: [],
    referenceVideo: null,
    numberOfScripts: 2,
};

const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
    const [step, setStep] = useState(1);
    const [input, setInput] = useState(initialInput);
    const [productImages, setProductImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [referenceVideoFile, setReferenceVideoFile] = useState<File | null>(null);
    const { t, language } = useTranslation();
    const { addToast } = useContext(AppContext) as AppContextType;

    const [generalPresets, setGeneralPresets] = useState<GeneralPreset[]>([]);
    const [characterPresets, setCharacterPresets] = useState<CharacterPreset[]>([]);
    const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([DEFAULT_PERSONA]);

    const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false);
    const [isSaveCharModalOpen, setIsSaveCharModalOpen] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    
    const [isExpressMode, setIsExpressMode] = useState(false);

    const [animationClass, setAnimationClass] = useState('animate-fadeIn');
    const prevStepRef = useRef(step);
    
    const [productUrl, setProductUrl] = useState('');
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);


    useEffect(() => {
        if (prevStepRef.current < step) {
            setAnimationClass('animate-slideInFromRight');
        } else if (prevStepRef.current > step) {
            setAnimationClass('animate-slideInFromLeft');
        }
        prevStepRef.current = step;
    }, [step]);


    useEffect(() => {
        try {
            const storedGeneral = localStorage.getItem('direktiva_presets');
            if (storedGeneral) setGeneralPresets(JSON.parse(storedGeneral));

            const storedCharacter = localStorage.getItem('direktiva_character_presets');
            if (storedCharacter) setCharacterPresets(JSON.parse(storedCharacter));

            const storedPersonas = localStorage.getItem('direktiva_ai_personas');
            if (storedPersonas) setAiPersonas([DEFAULT_PERSONA, ...JSON.parse(storedPersonas)]);

        } catch (error) {
            console.error("Failed to load presets from localStorage", error);
        }
    }, []);

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setInput(prev => ({ ...prev, [name]: checked }));
            return;
        }
        
        if (name === 'platform') {
            const newPlatform = value as keyof typeof PLATFORM_SPECIFIC_OPTIONS;
            const newContentMode = PLATFORM_CONTENT_MODES[newPlatform][0].value;
            const newHookType = PLATFORM_SPECIFIC_OPTIONS[newPlatform as keyof typeof PLATFORM_SPECIFIC_OPTIONS].hooks[0].value;
            const newCtaType = PLATFORM_SPECIFIC_OPTIONS[newPlatform as keyof typeof PLATFORM_SPECIFIC_OPTIONS].ctas[0].value;
            setInput(prev => ({ ...prev, platform: value, contentMode: newContentMode, hookType: newHookType, ctaType: newCtaType }));
        } else if (name === 'duration' || name === 'numberOfScripts') {
             setInput(prev => ({ ...prev, [name]: parseInt(value, 10) }));
        } else {
            setInput(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCharacterChange = useCallback((section: keyof CharacterDetails | 'identity' | 'facialFeatures' | 'physique' | 'styleAndAesthetics' | 'personality' , field: string, value: string) => {
        setInput(prev => {
            const newCharacter = { ...prev.character };
            (newCharacter[section as keyof CharacterDetails] as any)[field] = value;

            if (section === 'identity' && field === 'gender') {
                const newGender = value as keyof typeof HAIR_STYLES;
                const newHairStyles = HAIR_STYLES[newGender] || HAIR_STYLES.other;
                newCharacter.facialFeatures.hairStyle = newHairStyles[0].value;
            }

            return { ...prev, character: newCharacter };
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProductImages(prev => [...prev, ...files]);

            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...previews]);
        }
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReferenceVideoFile(e.target.files[0]);
        } else {
            setReferenceVideoFile(null);
        }
    };

    const removeImage = (index: number) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };
    
    const handleFetchUrlDetails = async () => {
        if (!productUrl.trim()) return;
        setIsFetchingUrl(true);
        try {
            const result = await analyzeProductUrl(productUrl, language);
            setInput(prev => ({
                ...prev,
                productName: result.productName || prev.productName,
                productDescription: result.productDescription || prev.productDescription,
                productCategory: result.productCategory || prev.productCategory,
                targetAudience: result.targetAudience || prev.targetAudience,
            }));
            addToast(t('fetch_success'), 'success');
        } catch (error) {
            console.error(error);
            addToast(t('fetch_error'), 'error');
        } finally {
            setIsFetchingUrl(false);
        }
    };

    const handleSaveGeneralPreset = () => {
        if (!newPresetName.trim()) return;
        const trimmedName = newPresetName.trim();
        const { productName, productType, productDescription, productImages, character, numberOfScripts, referenceVideo, ...settingsToSave } = input;

        const existingPreset = generalPresets.find(p => p.name === trimmedName);

        if (existingPreset) {
            if (window.confirm(t('preset_exists_confirm', { name: trimmedName }))) {
                const updatedPresets = generalPresets.map(p =>
                    p.id === existingPreset.id ? { ...p, settings: settingsToSave } : p
                );
                setGeneralPresets(updatedPresets);
                localStorage.setItem('direktiva_presets', JSON.stringify(updatedPresets));
                addToast(t('preset_overwritten', { name: trimmedName }), 'success');
            } else {
                return; // User cancelled overwrite
            }
        } else {
            const newPreset: GeneralPreset = {
                id: uuidv4(),
                name: trimmedName,
                settings: settingsToSave
            };
            const updatedPresets = [...generalPresets, newPreset];
            setGeneralPresets(updatedPresets);
            localStorage.setItem('direktiva_presets', JSON.stringify(updatedPresets));
            addToast(t('preset_saved'), 'success');
        }

        setIsSavePresetModalOpen(false);
        setNewPresetName('');
    };
    
    const handleLoadGeneralPreset = (id: string) => {
        if (!id) return;
        const preset = generalPresets.find(p => p.id === id);
        if (preset) {
            setInput(prev => ({ ...prev, ...preset.settings }));
            addToast(t('preset_loaded', { name: preset.name }), 'success');
        }
    };
    
    const handleSaveCharacterPreset = () => {
        if (!newPresetName.trim()) return;
        const trimmedName = newPresetName.trim();
        
        const existingPreset = characterPresets.find(p => p.name === trimmedName);

        if (existingPreset) {
            if (window.confirm(t('preset_exists_confirm', { name: trimmedName }))) {
                const updatedPresets = characterPresets.map(p => 
                    p.id === existingPreset.id ? { ...p, character: input.character } : p
                );
                setCharacterPresets(updatedPresets);
                localStorage.setItem('direktiva_character_presets', JSON.stringify(updatedPresets));
                addToast(t('preset_overwritten', { name: trimmedName }), 'success');
            } else {
                return; // User cancelled overwrite
            }
        } else {
            const newPreset: CharacterPreset = {
                id: uuidv4(),
                name: trimmedName,
                character: input.character
            };
            const updatedPresets = [...characterPresets, newPreset];
            setCharacterPresets(updatedPresets);
            localStorage.setItem('direktiva_character_presets', JSON.stringify(updatedPresets));
            addToast(t('character_preset_saved'), 'success');
        }

        setIsSaveCharModalOpen(false);
        setNewPresetName('');
    };
    
    const handleLoadCharacterPreset = (id: string) => {
        if (!id) return;
        const preset = characterPresets.find(p => p.id === id);
        if (preset) {
            setInput(prev => ({ ...prev, character: preset.character }));
            addToast(t('character_preset_loaded', { name: preset.name }), 'success');
        }
    };
    
    const fileToProductImage = (file: File) => {
        return new Promise<ProductImage>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve({ name: file.name, type: file.type, data: (event.target.result as string).split(',')[1] });
                } else { reject(new Error('Failed to read file')); }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const imagePayload = await Promise.all(productImages.map(fileToProductImage));
        let videoPayload = null;
        if (referenceVideoFile) {
            videoPayload = await fileToProductImage(referenceVideoFile);
        }

        onGenerate({ ...input, productImages: imagePayload, referenceVideo: videoPayload });
    };

    const { availableContentModes, availableHooks, availableCtas, hairStyleOptions } = useMemo(() => {
        const platformKey = input.platform as keyof typeof PLATFORM_SPECIFIC_OPTIONS;
        const genderKey = input.character.identity.gender as keyof typeof HAIR_STYLES;
        return {
            availableContentModes: PLATFORM_CONTENT_MODES[platformKey as keyof typeof PLATFORM_CONTENT_MODES] || [],
            availableHooks: PLATFORM_SPECIFIC_OPTIONS[platformKey]?.hooks || [],
            availableCtas: PLATFORM_SPECIFIC_OPTIONS[platformKey]?.ctas || [],
            hairStyleOptions: HAIR_STYLES[genderKey] || HAIR_STYLES.other,
        };
    }, [input.platform, input.character.identity.gender]);
    
    const showStyleSection = !FASHION_CATEGORIES.includes(input.productCategory);

    const TOTAL_STEPS = 3;

    return (
        <>
            <Card className="p-6 sticky top-24">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">{t('input_panel_title')}</h2>
                    <div className="mt-2">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-200">
                                        {t('step')} {step} / {TOTAL_STEPS}
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                                <div style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-500"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className={`space-y-6 ${animationClass}`}>
                            <h3 className="text-xl font-semibold">{t('step_1_title')}</h3>
                            
                            <div className="p-4 border border-dashed border-border-color rounded-lg space-y-3 bg-slate-50 dark:bg-slate-800/30">
                                <label className="font-semibold text-primary-600 dark:text-primary-400">{t('import_from_url')}</label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        name="productUrl" 
                                        value={productUrl}
                                        onChange={(e) => setProductUrl(e.target.value)}
                                        placeholder={t('product_url_placeholder')}
                                    />
                                    <Button type="button" onClick={handleFetchUrlDetails} disabled={isFetchingUrl || !productUrl.trim()}>
                                        {isFetchingUrl ? t('fetching_details') : t('fetch_details')}
                                    </Button>
                                </div>
                            </div>

                             <Select label={t('load_preset')} onChange={(e) => handleLoadGeneralPreset(e.target.value)} value="">
                                <option value="" disabled>{t('select_preset')}</option>
                                {generalPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                            <Input label={t('product_name')} name="productName" value={input.productName} onChange={handleGeneralChange} required />
                            <Select label={t('product_category')} name="productCategory" value={input.productCategory} onChange={handleGeneralChange}>
                            {PRODUCT_CATEGORIES.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                            </Select>
                            <Input label={t('product_type')} name="productType" value={input.productType} onChange={handleGeneralChange} placeholder={t('product_type_placeholder')} required />
                            <Textarea label={t('product_description')} name="productDescription" value={input.productDescription} onChange={handleGeneralChange} rows={4} required />
                            <Textarea label={t('brand_voice')} name="brandVoice" value={input.brandVoice} onChange={handleGeneralChange} rows={3} placeholder={t('brand_voice_placeholder')} />
                            <Select label={t('target_audience')} name="targetAudience" value={input.targetAudience} onChange={handleGeneralChange}>
                            {TARGET_AUDIENCES.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                            </Select>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={`space-y-6 ${animationClass}`}>
                            <h3 className="text-xl font-semibold">{t('step_2_title')}</h3>

                            <div className="p-4 border border-dashed border-border-color rounded-lg space-y-2 bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-primary-600 dark:text-primary-400">{t('express_mode')}</label>
                                    <Toggle enabled={isExpressMode} onChange={() => setIsExpressMode(p => !p)} srText={t('express_mode')} />
                                </div>
                                <p className="text-xs text-subtext">{t('express_mode_desc')}</p>
                            </div>

                            <Select label={t('platform')} name="platform" value={input.platform} onChange={handleGeneralChange}>
                                {PLATFORMS.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                            </Select>
                             <Select label={t('select_ai_persona')} name="aiPersonaId" value={input.aiPersonaId} onChange={handleGeneralChange}>
                                {aiPersonas.map(p => <option key={p.id} value={p.id}>{p.name === 'Direktiva Default' ? t('default_persona') : p.name}</option>)}
                            </Select>

                            {!isExpressMode && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="p-4 border border-dashed border-border-color rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="font-medium">{t('use_trend_analysis')}</label>
                                            <Toggle enabled={input.useTrendAnalysis} onChange={() => setInput(prev => ({...prev, useTrendAnalysis: !prev.useTrendAnalysis}))} srText={t('use_trend_analysis')} />
                                        </div>
                                        <p className="text-xs text-subtext">{t('use_trend_analysis_desc')}</p>
                                    </div>
                                    <Select label={t('content_mode')} name="contentMode" value={input.contentMode} onChange={handleGeneralChange}>
                                        {availableContentModes.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <Select label={t('visual_strategy')} name="visualStrategy" value={input.visualStrategy} onChange={handleGeneralChange}>
                                        {VISUAL_STRATEGIES.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <Select label={t('model_strategy')} name="modelStrategy" value={input.modelStrategy} onChange={handleGeneralChange}>
                                        {MODEL_STRATEGIES.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>

                                    {input.modelStrategy === 'character' && (
                                        <div className="p-4 border border-border-color rounded-lg space-y-4 animate-fadeIn">
                                            <h4 className="font-semibold">{t('character_details')}</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-color">
                                                <Select label={t('load_character')} onChange={(e) => handleLoadCharacterPreset(e.target.value)} value="">
                                                    <option value="" disabled>{t('select_preset')}</option>
                                                    {characterPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </Select>
                                                <Button type="button" variant="secondary" size="sm" onClick={() => { setNewPresetName(''); setIsSaveCharModalOpen(true); }} className="self-end h-10">{t('save_current_character')}</Button>
                                            </div>

                                            <h5 className="font-medium text-sm pt-2 border-t border-border-color">{t('character_identity_title')}</h5>
                                            <Input label={t('character_name')} value={input.character.identity.name} onChange={e => handleCharacterChange('identity', 'name', e.target.value)} />
                                            <Select label={t('character_gender')} value={input.character.identity.gender} onChange={e => handleCharacterChange('identity', 'gender', e.target.value)}>
                                                <option value="female">{t('female')}</option><option value="male">{t('male')}</option><option value="other">{t('other')}</option>
                                            </Select>
                                            <Input label={t('character_age')} value={input.character.identity.age} onChange={e => handleCharacterChange('identity', 'age', e.target.value)} placeholder="e.g., 28 years old" />
                                            <Input label={t('character_ethnicity')} value={input.character.identity.ethnicity} onChange={e => handleCharacterChange('identity', 'ethnicity', e.target.value)} placeholder="e.g., Javanese, Chinese-Indonesian"/>

                                            <h5 className="font-medium text-sm pt-2 border-t border-border-color">{t('character_facial_title')}</h5>
                                            <Select label={t('character_face_shape')} value={input.character.facialFeatures.faceShape} onChange={e => handleCharacterChange('facialFeatures', 'faceShape', e.target.value)}>
                                                {FACE_SHAPES.map(o=><option key={o.value} value={o.value}>{t(o.label)}</option>)}
                                            </Select>
                                            <Input label={t('character_eye_color')} value={input.character.facialFeatures.eyeColor} onChange={e => handleCharacterChange('facialFeatures', 'eyeColor', e.target.value)} placeholder="e.g., dark brown, warm hazel" />
                                            <Select label={t('character_hair_style')} value={input.character.facialFeatures.hairStyle} onChange={e => handleCharacterChange('facialFeatures', 'hairStyle', e.target.value)}>
                                                {hairStyleOptions.map(o=><option key={o.value} value={o.value}>{t(o.label)}</option>)}
                                            </Select>
                                            <Input label={t('character_custom_hair_style')} value={input.character.facialFeatures.customHairStyle || ''} onChange={e => handleCharacterChange('facialFeatures', 'customHairStyle', e.target.value)} placeholder="e.g., sleek ponytail with curtain bangs" />
                                            <Input label={t('character_hair_color')} value={input.character.facialFeatures.hairColor} onChange={e => handleCharacterChange('facialFeatures', 'hairColor', e.target.value)} placeholder="e.g., jet black with subtle blue highlights" />
                                            
                                            <h5 className="font-medium text-sm pt-2 border-t border-border-color">{t('character_physique_title')}</h5>
                                            <Input label={t('character_skin_tone')} value={input.character.physique.skinTone} onChange={e => handleCharacterChange('physique', 'skinTone', e.target.value)} placeholder="e.g., light brown with warm undertone" />
                                            <Input label={t('character_body_shape')} value={input.character.physique.bodyShape} onChange={e => handleCharacterChange('physique', 'bodyShape', e.target.value)} placeholder="e.g., athletic hourglass, lean" />
                                            <Input label={t('character_height')} value={input.character.physique.height} onChange={e => handleCharacterChange('physique', 'height', e.target.value)} placeholder="e.g., 165cm"/>

                                            {showStyleSection && (<>
                                            <h5 className="font-medium text-sm pt-2 border-t border-border-color">{t('character_style_title')}</h5>
                                            <Input label={t('character_clothing_style')} value={input.character.styleAndAesthetics.clothingStyle} onChange={e => handleCharacterChange('styleAndAesthetics', 'clothingStyle', e.target.value)} placeholder="e.g., minimalist, modern, chic" />
                                            <Input label={t('character_dominant_color')} value={input.character.styleAndAesthetics.dominantColor} onChange={e => handleCharacterChange('styleAndAesthetics', 'dominantColor', e.target.value)} placeholder="e.g., neutral colors, black, white" />
                                            </>)}

                                            <h5 className="font-medium text-sm pt-2 border-t border-border-color">{t('character_personality_title')}</h5>
                                            <Input label={t('character_dominant_aura')} value={input.character.personality.dominantAura} onChange={e => handleCharacterChange('personality', 'dominantAura', e.target.value)} placeholder="e.g., confident, elegant, cheerful" />
                                            <Textarea label={t('character_additional_notes')} value={input.character.personality.additionalNotes} onChange={e => handleCharacterChange('personality', 'additionalNotes', e.target.value)} rows={2}/>
                                        </div>
                                    )}
                                    
                                    <Select label={t('aspect_ratio')} name="aspectRatio" value={input.aspectRatio} onChange={handleGeneralChange}>
                                        {ASPECT_RATIOS.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <Select label={t('hook_type')} name="hookType" value={input.hookType} onChange={handleGeneralChange}>
                                        {availableHooks.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <Select label={t('cta_type')} name="ctaType" value={input.ctaType} onChange={handleGeneralChange}>
                                        {availableCtas.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <Select label={t('writing_style')} name="writingStyle" value={input.writingStyle} onChange={handleGeneralChange}>
                                        {WRITING_STYLES.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <Select label={t('tone')} name="tone" value={input.tone} onChange={handleGeneralChange}>
                                        {TONES.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                                    </Select>
                                    <div>
                                        <label htmlFor="duration" className="block text-sm font-medium mb-1">{t('duration_seconds')}: {input.duration}s</label>
                                        <input type="range" id="duration" name="duration" min="15" max="90" step="5" value={input.duration} onChange={handleGeneralChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className={`space-y-6 ${animationClass}`}>
                            <h3 className="text-xl font-semibold">{t('step_3_title')}</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('product_images')}</label>
                                <label htmlFor="file-upload" className="relative cursor-pointer mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md hover:border-primary-500 transition-colors duration-200">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <div className="flex text-sm"><p className="font-medium text-primary-600 hover:text-primary-500">{t('upload_files')}</p><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} /><p className="pl-1">{t('drag_drop')}</p></div>
                                        <p className="text-xs text-gray-500">{t('image_file_types')}</p>
                                    </div>
                                </label>
                                {imagePreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative group animate-fadeIn">
                                                <img src={src} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                                                <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 leading-none text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('reference_video')}</label>
                                <label htmlFor="video-upload" className="relative cursor-pointer mt-1 flex items-center justify-center px-6 py-4 border-2 border-dashed rounded-md hover:border-primary-500 transition-colors duration-200">
                                    <div className="text-center">
                                        <svg className="mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>
                                        <div className="flex text-sm mt-2"><p className="font-medium text-primary-600 hover:text-primary-500">{t('upload_video')}</p><input id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleVideoFileChange} /></div>
                                        {referenceVideoFile ? <p className="text-xs text-slate-300 mt-1 truncate">{referenceVideoFile.name}</p> : <p className="text-xs text-gray-500">{t('video_file_types')}</p>}
                                    </div>
                                </label>
                            </div>
                            <div>
                                <label htmlFor="numberOfScripts" className="block text-sm font-medium mb-1">{t('number_of_scripts')}: {input.numberOfScripts}</label>
                                <input type="range" id="numberOfScripts" name="numberOfScripts" min="1" max="5" step="1" value={input.numberOfScripts} onChange={handleGeneralChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                            </div>
                            <div className="pt-4 border-t border-border-color">
                                 <Button type="button" variant="secondary" className="w-full" onClick={() => { setNewPresetName(''); setIsSavePresetModalOpen(true); }}>{t('save_as_new_preset')}</Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-6">
                        <div>
                            {step > 1 && <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)}>{t('back')}</Button>}
                        </div>
                        <div>
                            {step < TOTAL_STEPS && <Button type="button" onClick={() => setStep(s => s + 1)}>{t('next')}</Button>}
                            {step === TOTAL_STEPS && 
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? t('generating') : t('generate')}
                                </Button>
                            }
                        </div>
                    </div>
                </form>
            </Card>

            <Modal isOpen={isSavePresetModalOpen} onClose={() => setIsSavePresetModalOpen(false)} title={t('save_as_new_preset')}>
                <div className="space-y-4">
                    <Input label={t('preset_name')} value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="e.g., Skincare Launch Strategy" />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsSavePresetModalOpen(false)}>{t('cancel')}</Button>
                        <Button onClick={handleSaveGeneralPreset}>{t('save')}</Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isSaveCharModalOpen} onClose={() => setIsSaveCharModalOpen(false)} title={t('save_current_character')}>
                <div className="space-y-4">
                    <Input label={t('preset_name')} value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="e.g., Young Professional Persona" />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsSaveCharModalOpen(false)}>{t('cancel')}</Button>
                        <Button onClick={handleSaveCharacterPreset}>{t('save')}</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default InputPanel;