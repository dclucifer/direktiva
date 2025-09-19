import React from 'react';
import Card from './Card';

const SkeletonLoader: React.FC = () => {
    return (
        <Card className="p-4 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                </div>
            </div>
        </Card>
    );
};

export default SkeletonLoader;
