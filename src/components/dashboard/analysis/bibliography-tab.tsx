
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';

interface BibliographyTabProps {
    analysisResult: AnalysisResult;
}

const BibliographyList: React.FC<{ title: string; items?: string[] }> = ({ title, items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div>
            <h4 className="font-semibold mb-2">{title}</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg space-y-2 break-words">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
    );
};


export const BibliographyTab: React.FC<BibliographyTabProps> = React.memo(({ analysisResult }) => {
    const { bibliography } = analysisResult;

    if (!bibliography || (!bibliography.mentioned?.length && !bibliography.recommended?.length)) {
        return <p className="text-muted-foreground p-8 text-center">No se encontró bibliografía en el documento.</p>;
    }

    return (
        <div className="pt-4">
            <h3 className="font-semibold text-lg md:text-xl mb-3">Bibliografía</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BibliographyList title="Mencionada en el Documento" items={bibliography.mentioned} />
                <BibliographyList title="Recomendada por Sand Classmate" items={bibliography.recommended} />
            </div>
        </div>
    );
});

BibliographyTab.displayName = 'BibliographyTab';
