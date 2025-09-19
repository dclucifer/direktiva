import React, { useState, useEffect, useCallback } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { VoiceOverDirections } from '../types';

interface VoiceOverPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    directions: VoiceOverDirections;
}

const VoiceOverPreviewModal: React.FC<VoiceOverPreviewModalProps> = ({ isOpen, onClose, directions }) => {
    const { t, language } = useTranslation();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

    const handleStop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentlySpeakingIndex(null);
    }, []);

    // Cleanup speech synthesis on component unmount or close
    useEffect(() => {
        return () => {
            handleStop();
        };
    }, [handleStop, isOpen]);

    const speak = (line: string, index: number, rate = 1, pitch = 1, onEndCallback: () => void) => {
        handleStop();
        const utterance = new SpeechSynthesisUtterance(line);
        utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
        utterance.rate = rate;
        utterance.pitch = pitch;
        
        utterance.onstart = () => {
            setIsSpeaking(true);
            setCurrentlySpeakingIndex(index);
        };
        
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingIndex(null);
            onEndCallback();
        };

        window.speechSynthesis.speak(utterance);
    };

    const handlePlayLine = (index: number) => {
        const line = directions.lines[index];
        speak(line.dialogue, index, line.rate, line.pitch, () => {});
    };

    const handlePlayAll = () => {
        let currentIndex = 0;
        
        const playNextLine = () => {
            if (currentIndex < directions.lines.length) {
                const line = directions.lines[currentIndex];
                speak(line.dialogue, currentIndex, line.rate, line.pitch, () => {
                    currentIndex++;
                    playNextLine();
                });
            }
        };
        
        playNextLine();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4 animate-fadeIn">
            <Card className="w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold">{t('voice_over_directions')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-1">{t('overall_direction')}</h3>
                        <p className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md text-sm text-slate-700 dark:text-slate-300 italic">
                            "{directions.overallDirection}"
                        </p>
                    </div>

                     <div className="flex gap-2 mb-4">
                        <Button onClick={handlePlayAll} disabled={isSpeaking}>{t('play_all')}</Button>
                        <Button onClick={handleStop} disabled={!isSpeaking} variant="secondary">{t('stop')}</Button>
                    </div>


                    <div className="w-full text-sm">
                        <div className="grid grid-cols-[auto,1fr,2fr] gap-4 font-bold border-b border-border-color pb-2 mb-2">
                            <span>{/* Play Icon Column */}</span>
                            <div>{t('line')}</div>
                            <div>{t('direction')}</div>
                        </div>
                        <div className="space-y-3">
                            {directions.lines.map((line, index) => (
                                <div key={index} className="grid grid-cols-[auto,1fr,2fr] gap-4 items-start">
                                    <button onClick={() => handlePlayLine(index)} disabled={isSpeaking && currentlySpeakingIndex !== index} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {currentlySpeakingIndex === index ? (
                                            <svg className="w-5 h-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M18 3a1 1 0 00-1.447-.894L4 7.424V4a1 1 0 00-2 0v12a1 1 0 002 0v-3.424l12.553 5.318A1 1 0 0018 17V3z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        )}
                                    </button>
                                    <p className={`text-slate-200 bg-slate-800/40 p-2 rounded-md font-mono text-xs ${currentlySpeakingIndex === index ? 'ring-2 ring-primary-500' : ''}`}>{line.dialogue}</p>
                                    <p className="text-slate-300">{line.direction}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default VoiceOverPreviewModal;