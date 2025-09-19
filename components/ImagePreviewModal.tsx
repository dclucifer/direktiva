import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ImagePreviewModalProps {
    isOpen: boolean;
    src: string;
    onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, src, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-preview-title"
        >
            <div 
                className="relative max-w-screen-lg max-h-screen-lg w-auto h-auto"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
            >
                <img 
                    src={src} 
                    alt={t('image_preview_alt')} 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
                 <button 
                    onClick={onClose} 
                    className="absolute -top-4 -right-4 bg-component-background text-basetext rounded-full p-2 hover:scale-110 transition-transform duration-200"
                    aria-label={t('close')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ImagePreviewModal;