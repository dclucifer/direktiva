import React, { useState, useEffect, useRef } from 'react';
import { Script, ScriptPart, VisualIdea, MarketingAssets, VoiceOverDirections, ProductImage } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { exportScriptAsJSON, exportScriptAsCSV, exportScriptAsSRT } from '../utils/exportUtils';
// fix: Removed unused import 'downloadGeneratedImage' as it is not exported from geminiService.
import { generateImageFromPrompt, generateScriptPartVariants, generateMarketingAssets, generateVoiceOverDirections, generateVideoFromScript } from '../services/geminiService';
import Dropdown, { MenuItem } from './ui/Dropdown';
import VariantSelectionModal from './VariantSelectionModal';
import VoiceOverPreviewModal from './VoiceOverPreviewModal';
import JSZip from 'jszip';
import saveAs from 'file-saver';


interface ScriptDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    script: Script;
    onRevise?: () => void;
    onUpdateScript: (updatedScript: Script) => void;
}

const PromptDisplay: React.FC<{ label: string; prompt: string; }> = ({ label, prompt }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="mt-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-mono bg-slate-100 dark:bg-slate-900/50 p-2 rounded-md my-1 text-slate-700 dark:text-slate-300">{prompt}</p>
            <div className="flex items-center gap-2">
                <button title="Info" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></button>
                <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h4a1 1 0 100-2H5z" /></svg>
                    {copied ? t('copied') : t('copy')}
                </button>
            </div>
        </div>
    );
};

const ScriptPartDisplay: React.FC<{ partName: string; part: ScriptPart | ScriptPart[]; aspectRatio: string; onGenerateVariants: () => void, isGeneratingVariants: boolean, storyboardImages: { [id: string]: string | 'loading' | 'error' }; }> = ({ partName, part, aspectRatio, onGenerateVariants, isGeneratingVariants, storyboardImages }) => {
    const { t } = useTranslation();
    
    const partsArray = Array.isArray(part) ? part : [part];

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg text-primary-600 flex items-center gap-2">
                    <span className="text-2xl">
                        {partName === 'HOOK' ? '🎣' : partName === 'CONTENT' ? '🎬' : '📢'}
                    </span>
                    {t(partName.toLowerCase())}
                </h4>
                <Button variant="ghost" size="sm" onClick={onGenerateVariants} disabled={isGeneratingVariants}>
                    {isGeneratingVariants ? t('generating_variants') : t('ab_variants')}
                </Button>
            </div>
            {partsArray.map((p, i) => (
                <div key={i} className="mb-4 last:mb-0">
                    <p className="mb-4">{p.dialogue}</p>
                    <div className="space-y-4">
                        {p.visual_ideas.map((idea, index) => {
                            const imageState = storyboardImages[idea.id];
                            return (
                                <div key={index} className="p-3 bg-slate-50 dark:bg-component-background/50 rounded-lg border border-border-color/50 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <div>
                                        <h5 className="font-bold">{t('visual_idea')} {index + 1}: <span className="font-normal">{idea.description}</span></h5>
                                        <PromptDisplay label={t('image_prompt')} prompt={idea.image_prompt} />
                                        <PromptDisplay label={t('video_prompt')} prompt={idea.video_prompt} />
                                    </div>
                                    <div className="flex items-center justify-center w-full aspect-[9/16] bg-slate-100 dark:bg-slate-900/50 rounded-md overflow-hidden">
                                        {imageState === 'loading' && (
                                            <div className="animate-pulse text-slate-500">{t('generating_image')}</div>
                                        )}
                                        {imageState === 'error' && (
                                            <div className="text-red-500 p-2 text-center text-xs">Failed to generate image.</div>
                                        )}
                                        {typeof imageState === 'string' && imageState !== 'loading' && imageState !== 'error' && (
                                            <img src={`data:image/jpeg;base64,${imageState}`} alt={idea.description} className="w-full h-full object-cover"/>
                                        )}
                                        {!imageState && (
                                             <div className="text-slate-500 text-sm">{t('image_preview')}</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};


const ScriptDetailModal: React.FC<ScriptDetailModalProps> = ({ isOpen, onClose, script, onRevise, onUpdateScript }) => {
    const { t, language } = useTranslation();
    const [assets, setAssets] = useState<MarketingAssets | null>(script.assets || null);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    
    const [storyboardImages, setStoryboardImages] = useState<{ [id: string]: string | 'loading' | 'error' }>(script.storyboard || {});
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);


    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [variants, setVariants] = useState<any[]>([]);
    const [originalPart, setOriginalPart] = useState<any>(null);
    const [partToVary, setPartToVary] = useState<'hook' | 'content' | 'cta' | null>(null);
    const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);

    const [isVoModalOpen, setIsVoModalOpen] = useState(false);
    const [isGeneratingVo, setIsGeneratingVo] = useState(false);
    const [voDirections, setVoDirections] = useState<VoiceOverDirections | null>(null);

    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState('');
    const [currentClipIndex, setCurrentClipIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        const clips = script.generatedVideoClips || [];
        // Cleanup the object URLs when the component unmounts or the script changes
        return () => {
            clips.forEach(clipUrl => {
                if (clipUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(clipUrl);
                }
            });
        };
    }, [script.generatedVideoClips]);

     useEffect(() => {
        // Reset to the first clip when a new set of clips is loaded
        setCurrentClipIndex(0);
    }, [script.id, script.generatedVideoClips]);

    if (!isOpen) return null;

    const copyFullScript = () => {
        let fullText = `${script.title}\n\n`;
        const addPart = (name: string, p: ScriptPart) => {
            fullText += `--- ${name} ---\n`;
            fullText += `${p.dialogue}\n`;
            p.visual_ideas.forEach((v, i) => {
                fullText += `  Visual Idea ${i+1}: ${v.description}\n`;
            });
            fullText += '\n';
        };
        addPart('HOOK', script.hook);
        script.content.forEach((c, i) => addPart(`CONTENT ${i+1}`, c));
        addPart('CTA', script.cta);
        navigator.clipboard.writeText(fullText);
    };
    
    const handleGenerateAllStoryboard = async () => {
        setIsGeneratingAll(true);
        const allVisualIdeas = [
            ...script.hook.visual_ideas,
            ...script.content.flatMap(p => p.visual_ideas),
            ...script.cta.visual_ideas
        ];
        
        const primaryProductImage = script.inputSnapshot.productImages?.[0];
        let baseCharacterImage: { mimeType: string, data: string } | undefined = undefined;

        // Set initial loading state for all un-generated images
        setStoryboardImages(prev => {
            const newState = {...prev};
            allVisualIdeas.forEach(idea => {
                if (!newState[idea.id] || newState[idea.id] === 'error') newState[idea.id] = 'loading';
            });
            return newState;
        });

        // 1. Generate Hook image first to establish the character
        const hookIdea = script.hook.visual_ideas[0];
        if (hookIdea) {
            try {
                // Determine if the product should be included based on the prompt
                const productName = script.inputSnapshot.productName.toLowerCase();
                const promptText = hookIdea.image_prompt.toLowerCase();
                const productInPrompt = productName && promptText.includes(productName);
                const productImageToSend = productInPrompt ? primaryProductImage : undefined;

                const image = await generateImageFromPrompt(hookIdea.image_prompt, script.inputSnapshot.aspectRatio, productImageToSend);
                setStoryboardImages(prev => ({ ...prev, [hookIdea.id]: image }));
                // Use the successful hook image as the base for character consistency
                baseCharacterImage = { mimeType: 'image/jpeg', data: image };
            } catch (error) {
                console.error(`Failed to generate hook image:`, error);
                setStoryboardImages(prev => ({ ...prev, [hookIdea.id]: 'error' }));
                setIsGeneratingAll(false);
                // Stop if the primary character image fails
                return;
            }
        }

        // 2. Generate the rest of the images using the hook image as a visual reference
        const remainingIdeas = [
            ...script.content.flatMap(p => p.visual_ideas),
            ...script.cta.visual_ideas
        ];

        for (const idea of remainingIdeas) {
             try {
                const productName = script.inputSnapshot.productName.toLowerCase();
                const promptText = idea.image_prompt.toLowerCase();
                const productInPrompt = productName && promptText.includes(productName);
                const productImageToSend = productInPrompt ? primaryProductImage : undefined;

                const image = await generateImageFromPrompt(idea.image_prompt, script.inputSnapshot.aspectRatio, productImageToSend, baseCharacterImage);
                setStoryboardImages(prev => ({ ...prev, [idea.id]: image }));
            } catch (error) {
                console.error(`Failed to generate image for prompt: ${idea.image_prompt}`, error);
                setStoryboardImages(prev => ({ ...prev, [idea.id]: 'error' }));
            }
        }

        // Use a functional update to ensure we have the latest state before updating the parent
        setStoryboardImages(currentImages => {
            onUpdateScript({ ...script, storyboard: currentImages });
            return currentImages;
        });

        setIsGeneratingAll(false);
    };


    const handleDownloadStoryboardZip = async () => {
        const zip = new JSZip();
        let imageCount = 0;
        for (const id in storyboardImages) {
            const imageData = storyboardImages[id];
            if (typeof imageData === 'string' && imageData !== 'loading' && imageData !== 'error') {
                zip.file(`scene_${imageCount + 1}.jpg`, imageData, { base64: true });
                imageCount++;
            }
        }
        if (imageCount > 0) {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${script.title.replace(/\s+/g, '_')}_storyboard.zip`);
        }
    };


    const handleGenerateAssets = async () => {
        setIsLoadingAssets(true);
        try {
            const result = await generateMarketingAssets(script, language);
            setAssets(result);
            onUpdateScript({ ...script, assets: result });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingAssets(false);
        }
    };
    
    const handleGenerateVariants = async (partName: 'hook' | 'content' | 'cta') => {
        setIsGeneratingVariants(true);
        setPartToVary(partName);
        const partData = script[partName];
        setOriginalPart(partData);
        try {
            const result = await generateScriptPartVariants(partData, script, partName, language);
            setVariants(result);
            setVariantModalOpen(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingVariants(false);
        }
    };
    
    const handleSelectVariant = (selectedVariant: any) => {
        if(partToVary) {
            const updatedScript = { ...script, [partToVary]: selectedVariant };
            onUpdateScript(updatedScript);
        }
        setVariantModalOpen(false);
        setPartToVary(null);
        setVariants([]);
        setOriginalPart(null);
    };

    const handlePreviewVo = async () => {
        setIsGeneratingVo(true);
        try {
            const directions = await generateVoiceOverDirections(script, language);
            setVoDirections(directions);
            setIsVoModalOpen(true);
        } catch(error) {
            console.error("Failed to generate voice over directions", error);
        } finally {
            setIsGeneratingVo(false);
        }
    };
    
    const handleGenerateVideo = async () => {
        setIsGeneratingVideo(true);
        setVideoGenerationStatus('');
        try {
            const videoUrls = await generateVideoFromScript(script, (statusKey, params) => {
                setVideoGenerationStatus(t(statusKey, params));
            });
            onUpdateScript({ ...script, generatedVideoClips: videoUrls });
        } catch (error) {
            console.error("Video generation failed:", error);
            const err = error as Error;
            let finalMessage = '';

            if (err.message === 'VIDEO_QUOTA_EXCEEDED') {
                finalMessage = t('video_gen_error_quota');
            } else if (err.message.startsWith('VIDEO_FAILED_SCENE:')) {
                const sceneNum = err.message.split(':')[1];
                finalMessage = t('video_gen_error_scene', { scene: sceneNum });
            } else {
                finalMessage = t('video_gen_error');
            }
            setVideoGenerationStatus(finalMessage);
        } finally {
            setIsGeneratingVideo(false);
        }
    };
    
    const handleVideoEnded = () => {
        if (script.generatedVideoClips && currentClipIndex < script.generatedVideoClips.length - 1) {
            setCurrentClipIndex(currentClipIndex + 1);
        }
    };
    
     useEffect(() => {
        if (videoRef.current && script.generatedVideoClips && script.generatedVideoClips[currentClipIndex]) {
            videoRef.current.src = script.generatedVideoClips[currentClipIndex];
            videoRef.current.play().catch(e => console.error("Video autoplay failed:", e));
        }
    }, [currentClipIndex, script.generatedVideoClips]);
    
    const handleDownloadClipsZip = async () => {
        if (!script.generatedVideoClips || script.generatedVideoClips.length === 0) return;

        const zip = new JSZip();
        for (let i = 0; i < script.generatedVideoClips.length; i++) {
            try {
                const response = await fetch(script.generatedVideoClips[i]);
                const blob = await response.blob();
                zip.file(`scene_${i + 1}.mp4`, blob);
            } catch (error) {
                console.error(`Failed to fetch and zip clip ${i + 1}:`, error);
            }
        }
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${script.title.replace(/\s+/g, '_')}_video_clips.zip`);
    };


    const exportOptions: MenuItem[] = [
        { label: t('export_prompt_pack_json'), onClick: () => exportScriptAsJSON(script) },
        { label: t('export_prompt_pack_csv'), onClick: () => exportScriptAsCSV(script) },
        { isDivider: true },
        { label: t('export_capcut_srt'), onClick: () => exportScriptAsSRT(script) },
    ];
    
    const { character: char } = script.inputSnapshot;
    const hasGeneratedImages = Object.values(storyboardImages).some(s => typeof s === 'string' && s !== 'loading' && s !== 'error');
    const hasGeneratedVideo = script.generatedVideoClips && script.generatedVideoClips.length > 0;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fadeIn">
                <Card className="w-full max-w-6xl p-6 relative max-h-[90vh] flex flex-col animate-slideUp">
                    <div className="flex-shrink-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="text-2xl font-bold">{script.title}</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1.5 text-base font-bold text-green-900 bg-green-200 dark:bg-green-300 dark:text-green-900 rounded-full">
                                    {t('score')} {script.score}
                                </span>
                                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <Button size="sm" variant="secondary" onClick={copyFullScript}>{t('copy_full_script')}</Button>
                            <Dropdown buttonLabel={t('export')} items={exportOptions} />
                            <Button size="sm" variant="secondary" onClick={handlePreviewVo} disabled={isGeneratingVo}>
                                {isGeneratingVo ? t('generating_voice_over') : t('listen_voice_over')}
                            </Button>
                             <Button size="sm" variant="secondary" onClick={handleGenerateAllStoryboard} disabled={isGeneratingAll}>
                                {isGeneratingAll ? t('generating_all_storyboard') : t('generate_all_storyboard')}
                            </Button>
                            {hasGeneratedImages && (
                                <Button size="sm" variant="secondary" onClick={handleDownloadStoryboardZip}>{t('download_storyboard_zip')}</Button>
                            )}
                             <Button size="sm" variant="primary" onClick={handleGenerateVideo} disabled={isGeneratingVideo || !hasGeneratedImages} title={!hasGeneratedImages ? "Generate storyboard images first" : "Create video"}>
                                {isGeneratingVideo ? t('creating_video') : `✨ ${t('create_video')}`}
                            </Button>
                            {onRevise && <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900" onClick={onRevise}>{t('edit')}</Button>}
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto pr-2 space-y-6 flex-grow">
                        {script.inputSnapshot.modelStrategy === 'character' && char && (
                            <div>
                                <h3 className="text-lg font-bold mb-2">{t('character_sheet')}</h3>
                                <div className="text-sm p-3 bg-slate-50 dark:bg-component-background/50 rounded-lg">
                                    <strong>{char.identity.name}</strong> ({char.identity.age}, {char.identity.gender}, {char.identity.ethnicity}).
                                </div>
                            </div>
                        )}
                        
                        {(isGeneratingVideo || hasGeneratedVideo || videoGenerationStatus) && (
                            <div className="pt-4 border-t border-border-color">
                                <h3 className="text-lg font-bold mb-2">{t('video_result')}</h3>
                                {isGeneratingVideo && (
                                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>{videoGenerationStatus || t('creating_video')}</span>
                                    </div>
                                )}
                                {!isGeneratingVideo && hasGeneratedVideo && (
                                    <div className="space-y-3">
                                        <video
                                            ref={videoRef}
                                            key={script.generatedVideoClips?.[currentClipIndex]}
                                            controls
                                            onEnded={handleVideoEnded}
                                            className="w-full max-w-md mx-auto rounded-lg bg-black"
                                            autoPlay
                                        />
                                        <Button variant="secondary" onClick={handleDownloadClipsZip} className="w-full">{t('download_clips_zip')}</Button>
                                    </div>
                                )}
                                {!isGeneratingVideo && !hasGeneratedVideo && videoGenerationStatus && (
                                    <p className="text-red-500 p-2 text-center">{videoGenerationStatus}</p>
                                )}
                            </div>
                        )}


                        <ScriptPartDisplay partName="HOOK" part={script.hook} aspectRatio={script.inputSnapshot.aspectRatio} onGenerateVariants={() => handleGenerateVariants('hook')} isGeneratingVariants={isGeneratingVariants && partToVary === 'hook'} storyboardImages={storyboardImages} />

                        <ScriptPartDisplay partName="CONTENT" part={script.content} aspectRatio={script.inputSnapshot.aspectRatio} onGenerateVariants={() => handleGenerateVariants('content')} isGeneratingVariants={isGeneratingVariants && partToVary === 'content'} storyboardImages={storyboardImages} />
                        
                        <ScriptPartDisplay partName="CTA" part={script.cta} aspectRatio={script.inputSnapshot.aspectRatio} onGenerateVariants={() => handleGenerateVariants('cta')} isGeneratingVariants={isGeneratingVariants && partToVary === 'cta'} storyboardImages={storyboardImages} />

                        <div className="pt-4 border-t border-border-color">
                            <h3 className="text-lg font-bold mb-2">{t('marketing_assets')}</h3>
                            {!assets && (
                                <Button onClick={handleGenerateAssets} disabled={isLoadingAssets}>
                                    {isLoadingAssets ? t('generating_assets') : t('generate_assets')}
                                </Button>
                            )}
                            {assets && (
                                <div className="space-y-4 text-sm p-3 bg-slate-50 dark:bg-component-background/50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold">{t('title_caption_options')}</h4>
                                        <ul className="list-disc list-inside pl-2">
                                            {assets.titles.map((title, i) => <li key={i}>{title}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('hashtag_recommendations')}</h4>
                                        <p><strong>{t('general')}:</strong> {assets.hashtags.general.join(' ')}</p>
                                        <p><strong>{t('platform_specific')}:</strong> {assets.hashtags.platform_specific.join(' ')}</p>
                                        <p><strong>{t('trending_suggestions')}:</strong> {assets.hashtags.trending_suggestions.join(' ')}</p>
                                    </div>
                                     <div>
                                        <h4 className="font-semibold">{t('thumbnail_text_ideas')}</h4>
                                        <ul className="list-disc list-inside pl-2">
                                            {assets.thumbnail_text_ideas.map((idea, i) => <li key={i}>{idea}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            {variantModalOpen && (
                <VariantSelectionModal
                    isOpen={variantModalOpen}
                    onClose={() => setVariantModalOpen(false)}
                    originalPart={originalPart}
                    variants={variants}
                    onSelectVariant={handleSelectVariant}
                    partName={partToVary || ''}
                />
            )}
             {isVoModalOpen && voDirections && (
                <VoiceOverPreviewModal
                    isOpen={isVoModalOpen}
                    onClose={() => setIsVoModalOpen(false)}
                    directions={voDirections}
                />
            )}
        </>
    );
};

export default ScriptDetailModal;