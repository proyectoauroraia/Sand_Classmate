
'use client';
import * as React from 'react';

interface ResultCardProps {
    title: string;
    description: string;
}

export const ResultCard: React.FC<ResultCardProps> = React.memo(({ title, description }) => {
    return (
        <div className="p-4 rounded-lg bg-secondary/30 break-words">
            <div className="font-semibold">{title}</div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
    );
});

ResultCard.displayName = 'ResultCard';
