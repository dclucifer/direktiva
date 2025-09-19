
// FIX: Implemented the Image Generator page component.
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import ImageUploadBox from '../components/ImageUploadBox';
import { useTranslation } from '../hooks/useTranslation';
import { generateProductPhoto, editProductInImage } from '../services/geminiService';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import ImagePreviewModal from '../components/ImagePreviewModal';
import Select from '../components/ui/Select';
import { ASPECT_RATIOS, STYLE_PRESETS } from '../constants';

type GenerationMode = 'create' | 'edit';

const ImageGeneratorPage: React.FC = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<GenerationMode>('create');
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        subject: null,
        mainProduct: null,
        background: null,
        product2: null,
        product3: null,
        baseImage: null,
        replacementProduct: null,
    });
    const [prompt, setPrompt] = useState('');
    const [backgroundPrompt, setBackgroundPrompt] = useState('');
    const [stylePreset, setStylePreset] = useState('none');
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImages, setResultImages] = useState<string[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [isZipping, setIsZipping] = useState(false);
    const [singleDownloadIndex, setSingleDownloadIndex] = useState<number | null>(null);
    
    useEffect(() => {
        // Clear all files and results when mode changes to prevent using old data
        setFiles({
            subject: null, mainProduct: null, background: null, product2: null, product3: null,
            baseImage: null, replacementProduct: null,
        });
        setResultImages([]);
        setError(null);
        setPrompt('');
        setBackgroundPrompt('');
        setStylePreset('none');

        // When switching to create mode, if 'original' was selected, reset to a valid default.
        if (mode === 'create' && aspectRatio === 'original') {
            setAspectRatio('9:16');
        }
    }, [mode]);

    const handleFileSelect = (key: string) => (file: File | null) => {
        setFiles(prev => ({ ...prev, [key]: file }));
    };

    const fileToGenerativePart = (file: File): Promise<{ mimeType: string, data: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64 = (event.target.result as string).split(',')[1];
                    resolve({ mimeType: file.type, data: base64 });
                } else {
                    reject(new Error("Failed to read file"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const getImageAspectRatio = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve(`${img.width}:${img.height}`);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const cropImage = (base64Image: string, chosenAspectRatio: string, outputType: 'blob' | 'dataURL'): Promise<Blob | string | null> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = `data:image/png;base64,${base64Image}`;
            img.onload = () => {
                const sourceWidth = img.width;
                const sourceHeight = img.height;
                
                const [ratioWidth, ratioHeight] = chosenAspectRatio.split(':').map(Number);
                const targetAspectRatio = ratioWidth / ratioHeight;
    
                let sx, sy, sWidth, sHeight;
    
                if ((sourceWidth / sourceHeight) > targetAspectRatio) {
                    sHeight = sourceHeight;
                    sWidth = sourceHeight * targetAspectRatio;
                    sx = (sourceWidth - sWidth) / 2;
                    sy = 0;
                } 
                else {
                    sWidth = sourceWidth;
                    sHeight = sourceWidth / targetAspectRatio;
                    sx = 0;
                    sy = (sourceHeight - sHeight) / 2;
                }
    
                const canvas = document.createElement('canvas');
                canvas.width = sWidth;
                canvas.height = sHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }
                
                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
                
                if (outputType === 'blob') {
                    canvas.toBlob((blob) => resolve(blob), 'image/png');
                } else {
                    resolve(canvas.toDataURL('image/png'));
                }
            };
            img.onerror = () => resolve(null);
        });
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResultImages([]);
        setSelectedIndices(new Set());

        try {
            let finalAspectRatio = aspectRatio;
            if (aspectRatio === 'original') {
                if (mode === 'edit' && files.baseImage) {
                    finalAspectRatio = await getImageAspectRatio(files.baseImage);
                } else if (mode === 'create') {
                    finalAspectRatio = '9:16'; // Fallback for create mode
                } else {
                    setError('Please upload a base image to use original aspect ratio.');
                    setIsLoading(false);
                    return;
                }
            }

            if (mode === 'create') {
                if (!files.subject && !files.mainProduct) {
                    setError(t('upload_subject_or_product_error'));
                    setIsLoading(false);
                    return;
                }
                const createModeFiles = { ...files };
                delete createModeFiles.baseImage;
                delete createModeFiles.replacementProduct;

                const imageParts: { [key: string]: { mimeType: string, data: string } } = {};
                for (const key in createModeFiles) {
                    if (key === 'background' && backgroundPrompt.trim()) continue; // Skip background file if text prompt is used
                    if (createModeFiles[key]) {
                        imageParts[key] = await fileToGenerativePart(createModeFiles[key]!);
                    }
                }
                
                const finalBackgroundPrompt = backgroundPrompt.trim() || null;
                const finalStylePrompt = STYLE_PRESETS.find(p => p.value === stylePreset)?.promptFragment || null;

                const rawImages = await generateProductPhoto(imageParts, prompt, finalAspectRatio, finalBackgroundPrompt, finalStylePrompt);

                const croppedImagePromises = rawImages.map(rawImg => cropImage(rawImg, finalAspectRatio, 'dataURL'));
                const croppedDataUrls = await Promise.all(croppedImagePromises);
                
                const finalImages = croppedDataUrls
                    .map(url => url ? (url as string).split(',')[1] : null)
                    .filter((img): img is string => img !== null);

                if (finalImages.length > 0) {
                    setResultImages(finalImages);
                } else {
                    throw new Error("Failed to process final images after generation.");
                }

            } else { // mode === 'edit'
                if (!files.baseImage || !files.replacementProduct) {
                    setError(t('upload_base_and_replacement_error'));
                    setIsLoading(false);
                    return;
                }
                const baseImagePart = await fileToGenerativePart(files.baseImage);
                const replacementProductPart = await fileToGenerativePart(files.replacementProduct);
                const rawImage = await editProductInImage(baseImagePart, replacementProductPart, prompt, finalAspectRatio);
                
                const croppedDataUrl = await cropImage(rawImage, finalAspectRatio, 'dataURL');
                const finalImage = croppedDataUrl ? (croppedDataUrl as string).split(',')[1] : null;

                if (finalImage) {
                    setResultImages([finalImage]);
                } else {
                    throw new Error("Failed to process final image.");
                }
            }

        } catch (err: any) {
            console.error(err);
            let errorMessage = t('image_generation_error');
            const message = err.message || (typeof err === 'string' ? err : '');

            if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
                errorMessage = t('quota_exceeded_error');
            } else if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadZip = async (indices: number[]) => {
        if (indices.length === 0 || isZipping || singleDownloadIndex !== null) return;
        setIsZipping(true);
        try {
            let finalAspectRatio = aspectRatio;
             if (aspectRatio === 'original' && files.baseImage) {
                finalAspectRatio = await getImageAspectRatio(files.baseImage);
            }

            const zip = new JSZip();
            
            const imageBlobs = await Promise.all(indices.map(index => cropImage(resultImages[index], finalAspectRatio, 'blob')));

            imageBlobs.forEach((blob, i) => {
                 if (blob) {
                    zip.file(`direktiva-studio-image-${indices[i] + 1}.png`, blob);
                }
            });

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${t('zip_filename')}.zip`);
        } catch (e) {
            console.error("ZIP download failed", e);
        } finally {
            setIsZipping(false);
        }
    };
    
    const handleDownloadSingle = async (index: number) => {
        if (isZipping || singleDownloadIndex !== null) return;
        setSingleDownloadIndex(index);
        try {
            let finalAspectRatio = aspectRatio;
            if (aspectRatio === 'original' && files.baseImage) {
                finalAspectRatio = await getImageAspectRatio(files.baseImage);
            }
            const blob = await cropImage(resultImages[index], finalAspectRatio, 'blob') as Blob | null;
            if (blob) {
                saveAs(blob, `direktiva-studio-image-${index + 1}.png`);
            }
        } catch (err) {
            console.error("Single image download failed", err);
        } finally {
            setSingleDownloadIndex(null);
        }
    };

    const handleOpenPreview = async (base64Image: string) => {
        let finalAspectRatio = aspectRatio;
        if (aspectRatio === 'original' && files.baseImage) {
            finalAspectRatio = await getImageAspectRatio(files.baseImage);
        }
        const dataUrl = await cropImage(base64Image, finalAspectRatio, 'dataURL') as string;
        setPreviewSrc(dataUrl);
    };
    
    const handleToggleSelection = (index: number) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const SpinnerIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const isDownloading = isZipping || singleDownloadIndex !== null;
    
    let aspectStyle = { aspectRatio: '9 / 16' };
    if (aspectRatio !== 'original') {
        const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
        aspectStyle = { aspectRatio: `${ratioW} / ${ratioH}` };
    }
    

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('image_generator_title')}</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">{t('image_generator_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="p-6 space-y-6 lg:col-span-1">
                        <div className="flex w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <Button 
                                onClick={() => setMode('create')} 
                                variant={mode === 'create' ? 'primary' : 'ghost'} 
                                className="w-1/2 !rounded-md"
                            >
                                {t('create_new_scene')}
                            </Button>
                            <Button 
                                onClick={() => setMode('edit')} 
                                variant={mode === 'edit' ? 'primary' : 'ghost'} 
                                className="w-1/2 !rounded-md"
                            >
                                {t('edit_image')}
                            </Button>
                        </div>
                        
                        {mode === 'create' ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-4">
                                    <ImageUploadBox title={t('subject_model')} onFileSelect={handleFileSelect('subject')} helperText={t('upload_helper_subject')} />
                                    <ImageUploadBox title={t('main_product')} onFileSelect={handleFileSelect('mainProduct')} helperText={t('upload_helper_product')} />
                                    <ImageUploadBox title={t('background')} onFileSelect={handleFileSelect('background')} helperText={t('upload_helper_latar')} />
                                    <ImageUploadBox title={t('product_2')} onFileSelect={handleFileSelect('product2')} helperText={t('upload_helper_product')} />
                                    <ImageUploadBox title={t('product_3')} onFileSelect={handleFileSelect('product3')} helperText={t('upload_helper_product')} />
                                </div>
                                <Textarea
                                    label={t('or_describe_background')}
                                    value={backgroundPrompt}
                                    onChange={(e) => setBackgroundPrompt(e.target.value)}
                                    rows={3}
                                    placeholder={t('background_placeholder')}
                                    helperText={t('describe_background_helper')}
                                />
                            </div>
                        ) : (
                             <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                <ImageUploadBox title={t('base_image_to_edit')} onFileSelect={handleFileSelect('baseImage')} helperText={t('upload_helper_base_image')} />
                                <ImageUploadBox title={t('replacement_product')} onFileSelect={handleFileSelect('replacementProduct')} helperText={t('upload_helper_replacement_product')} />
                            </div>
                        )}

                        <Select label={t('aspect_ratio')} name="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
                            {ASPECT_RATIOS.filter(opt => mode === 'edit' || opt.value !== 'original').map(option => (
                                <option key={option.value} value={option.value}>{t(option.label)}</option>
                            ))}
                        </Select>
                        
                        {mode === 'create' && (
                             <Select label={t('style_preset')} value={stylePreset} onChange={e => setStylePreset(e.target.value)}>
                                {STYLE_PRESETS.map(p => <option key={p.value} value={p.value}>{t(p.label)}</option>)}
                            </Select>
                        )}

                        <Textarea
                            label={t('additional_instructions')}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            placeholder={mode === 'create' ? t('photomontage_instructions_placeholder') : t('edit_instructions_placeholder')}
                        />
                        <Button onClick={handleGenerate} disabled={isLoading || isDownloading} className="w-full" size="lg">
                            {isLoading ? t('generating_images') : t('generate_images')}
                        </Button>
                    </Card>

                    <Card className="p-6 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{t('results')}</h3>
                            {resultImages.length > 0 && !isLoading && (
                                <div className="flex items-center gap-2">
                                     {selectedIndices.size > 0 && (
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {t('n_selected', { count: selectedIndices.size })}
                                        </span>
                                    )}
                                    <Button onClick={() => handleDownloadZip(Array.from(selectedIndices))} size="sm" variant="secondary" disabled={selectedIndices.size === 0 || isDownloading} leftIcon={isZipping ? <SpinnerIcon className="h-4 w-4 mr-1" /> : null}>
                                        {isZipping ? t('zipping') : t('download_selected')}
                                    </Button>
                                    <Button onClick={() => handleDownloadZip([...Array(resultImages.length).keys()])} size="sm" variant="secondary" disabled={isDownloading} leftIcon={isZipping ? <SpinnerIcon className="h-4 w-4 mr-1" /> : null}>
                                        {isZipping ? t('zipping') : t('download_all')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isLoading && (
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {Array.from({ length: mode === 'create' ? 5 : 1 }).map((_, index) => (
                                    <div key={index} className="w-full object-cover rounded-lg shadow-md bg-slate-200 dark:bg-slate-700 animate-pulse" style={aspectStyle}>
                                        {/* Skeleton loader content can be empty as aspect ratio is handled by style */}
                                    </div>
                                ))}
                            </div>
                        )}
                        {error && <p className="text-red-500 p-4 text-center">{error}</p>}
                        
                        {!isLoading && resultImages.length === 0 && !error && (
                            <div className="w-full h-full min-h-[300px] bg-component-background border-2 border-dashed border-border-color rounded-lg flex items-center justify-center">
                                <p className="text-slate-400 dark:text-slate-500 text-center">Your generated images will appear here.</p>
                            </div>
                        )}

                        {resultImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {resultImages.map((img, index) => (
                                    <div key={index} className="relative group animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div
                                            className="absolute top-2 left-2 z-10 flex items-center justify-center p-1 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); if (!isDownloading) handleToggleSelection(index); }}
                                        >
                                            <input 
                                                type="checkbox"
                                                readOnly
                                                checked={selectedIndices.has(index)}
                                                className="h-5 w-5 rounded-full text-primary-600 bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-600 focus:ring-primary-500 cursor-pointer pointer-events-none"
                                            />
                                        </div>
                                        <div className="absolute top-2 right-2 z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownloadSingle(index); }}
                                                disabled={isDownloading}
                                                className="bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                                aria-label={`Download image ${index + 1}`}
                                            >
                                                {singleDownloadIndex === index ? (
                                                    <SpinnerIcon className="h-5 w-5" />
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <img 
                                            src={`data:image/png;base64,${img}`} 
                                            alt={`Generated result ${index + 1}`} 
                                            className="w-full object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                            style={aspectStyle}
                                            onClick={() => !isDownloading && handleOpenPreview(img)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {previewSrc && (
                <ImagePreviewModal
                    isOpen={!!previewSrc}
                    src={previewSrc}
                    onClose={() => setPreviewSrc(null)}
                />
            )}
        </>
    );
};

export default ImageGeneratorPage;
