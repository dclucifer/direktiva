import React, { useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ImageUploadBoxProps {
    title: string;
    onFileSelect: (file: File | null) => void;
    helperText?: string;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ title, onFileSelect, helperText }) => {
    const { t } = useTranslation();
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [onFileSelect]);

    const handleRemoveImage = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPreview(null);
        onFileSelect(null);
        // Reset file input value
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    }, [onFileSelect]);

    const inputId = `file-upload-${title.replace(/\s+/g, '-')}`;

    return (
        <div className="flex flex-col items-center space-y-1">
            <h4 className="font-semibold text-sm text-center">{title}</h4>
            {helperText && <p className="text-xs text-subtext text-center mb-1 h-10">{helperText}</p>}
            <label htmlFor={inputId} className="relative w-full aspect-[4/5] bg-component-background border-2 border-dashed border-border-color rounded-lg flex items-center justify-center overflow-hidden cursor-pointer group hover:border-primary-500 transition-colors duration-200">
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700 transition-colors z-10"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div className="text-center text-slate-400 dark:text-slate-500 px-2 flex flex-col items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300 dark:text-slate-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="text-sm font-medium">{t('upload_placeholder')}</span>
                    </div>
                )}
                 <input
                    id={inputId}
                    type="file"
                    className="sr-only"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
};

export default ImageUploadBox;