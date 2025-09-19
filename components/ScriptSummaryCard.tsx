import React from 'react';
import { Script } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';

interface ScriptSummaryCardProps {
    script: Script;
    onViewDetails: () => void;
    onDelete: () => void;
}

const ScriptSummaryCard: React.FC<ScriptSummaryCardProps> = ({ script, onViewDetails, onDelete }) => {
    const { t } = useTranslation();
    const generatedDate = new Date(script.generatedAt).toLocaleString();

    return (
        <Card className="p-4 flex flex-col justify-between h-full">
            <div>
                <h3 className="font-bold text-lg truncate" title={script.title}>{script.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{script.inputSnapshot.productName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{generatedDate}</p>
            </div>
            <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="w-full" onClick={onViewDetails}>
                    {t('view_details')}
                </Button>
                <Button variant="danger" size="sm" onClick={onDelete}>
                    {t('delete')}
                </Button>
            </div>
        </Card>
    );
};

export default ScriptSummaryCard;