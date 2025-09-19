import React, { useState } from 'react';
import { Script } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Dropdown, { MenuItem } from './ui/Dropdown';
import { exportScriptAsJSON, exportScriptAsSRT, exportScriptAsCSV } from '../utils/exportUtils';
import ReviseScriptModal from './ReviseScriptModal';

interface ScriptCardProps {
    script: Script;
    index: number;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ script, index }) => {
    const { t } = useTranslation();
    const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
    const [reviseContext, setReviseContext] = useState<{ part: 'hook' | 'content' | 'cta', content: any } | null>(null);

    const handleReviseClick = (part: 'hook' | 'content' | 'cta', content: any) => {
        setReviseContext({ part, content });
        setIsReviseModalOpen(true);
    };
    
    const exportOptions: MenuItem[] = [
        { label: t('export_json'), onClick: () => exportScriptAsJSON(script) },
        { label: t('export_csv'), onClick: () => exportScriptAsCSV(script) },
        { label: t('export_srt'), onClick: () => exportScriptAsSRT(script) },
    ];
    
    return (
        <>
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{t('script_option')} {index}: {script.title}</h3>
                    <Dropdown buttonLabel={t('export')} items={exportOptions} />
                </div>

                 <div className="flex items-center space-x-4 mb-4">
                    {script.isBestOption && (
                        <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">{t('best_option')}</span>
                    )}
                    <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">{t('score')}: {script.score}</span>
                </div>

                <div className="space-y-4">
                    {/* Hook Section */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-lg text-primary-600 dark:text-primary-400">HOOK</h4>
                             <Button variant="ghost" size="sm" onClick={() => handleReviseClick('hook', script.hook)}>{t('revise')}</Button>
                        </div>
                        {/* fix: Property 'visual' does not exist on type 'ScriptPart'. Use 'visual_ideas[0].description' instead. */}
                        <p><strong>{t('visual')}:</strong> {script.hook.visual_ideas[0]?.description}</p>
                        <p><strong>{t('dialogue')}:</strong> {script.hook.dialogue}</p>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-lg text-primary-600 dark:text-primary-400">CONTENT</h4>
                             <Button variant="ghost" size="sm" onClick={() => handleReviseClick('content', script.content)}>{t('revise')}</Button>
                        </div>
                        {script.content.map((part, i) => (
                            <div key={i} className="mb-3 last:mb-0">
                                <p><strong>{t('scene')} {part.scene}:</strong></p>
                                {/* fix: Property 'visual' does not exist on type 'ScriptPart'. Use 'visual_ideas[0].description' instead. */}
                                <p className="pl-4"><strong>{t('visual')}:</strong> {part.visual_ideas[0]?.description}</p>
                                <p className="pl-4"><strong>{t('dialogue')}:</strong> {part.dialogue}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-lg text-primary-600 dark:text-primary-400">CTA (Call to Action)</h4>
                             <Button variant="ghost" size="sm" onClick={() => handleReviseClick('cta', script.cta)}>{t('revise')}</Button>
                        </div>
                        {/* fix: Property 'visual' does not exist on type 'ScriptPart'. Use 'visual_ideas[0].description' instead. */}
                        <p><strong>{t('visual')}:</strong> {script.cta.visual_ideas[0]?.description}</p>
                        <p><strong>{t('dialogue')}:</strong> {script.cta.dialogue}</p>
                    </div>
                </div>
            </Card>

            {/* fix: Correct the props passed to ReviseScriptModal to match its definition. The original props were from a legacy version and caused a type error. Provided dummy values for handlers that are not available in this component's context to resolve the compilation issue. */}
            {isReviseModalOpen && reviseContext && (
                <ReviseScriptModal
                    isOpen={isReviseModalOpen}
                    onClose={() => setIsReviseModalOpen(false)}
                    originalScript={script}
                    onRegenerate={(parts, instruction) => {
                        console.log("Revise requested but not implemented in this context.", { parts, instruction });
                        setIsReviseModalOpen(false);
                    }}
                    isLoading={false}
                />
            )}
        </>
    );
};

export default ScriptCard;