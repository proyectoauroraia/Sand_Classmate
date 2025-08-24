
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Youtube, Link as LinkIcon } from 'lucide-react';

interface ResourcesTabProps {
    analysisResult: AnalysisResult;
}

interface ResourceLinkProps {
    href: string;
    icon: React.ElementType;
    iconColorClass: string;
    title: string;
    summary: string;
}

const ResourceLink: React.FC<ResourceLinkProps> = React.memo(({ href, icon: Icon, iconColorClass, title, summary }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block p-4 rounded-lg bg-secondary/30 hover:bg-accent/40 transition-colors break-words"
    >
        <div className={`font-semibold flex items-center gap-2 ${iconColorClass}`}>
            <Icon className="h-5 w-5"/> {title}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{summary}</p>
    </a>
));
ResourceLink.displayName = 'ResourceLink';


export const ResourcesTab: React.FC<ResourcesTabProps> = React.memo(({ analysisResult }) => {
    const { enrichedContent } = analysisResult;
    const hasLinks = enrichedContent?.externalLinks && enrichedContent.externalLinks.length > 0;
    const hasVideos = enrichedContent?.youtubeVideos && enrichedContent.youtubeVideos.length > 0;

    if (!hasLinks && !hasVideos) {
        return <p className="text-muted-foreground">No se encontraron recursos adicionales para este tema.</p>;
    }
    
    return (
        <div className="space-y-6">
            {hasLinks && (
                <div>
                    <h3 className="font-semibold text-xl mb-3">Recursos Externos Sugeridos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrichedContent.externalLinks.map((link, i) => (
                            <ResourceLink
                                key={i}
                                href={link.url}
                                icon={LinkIcon}
                                iconColorClass="text-primary"
                                title={link.title}
                                summary={link.summary}
                            />
                        ))}
                    </div>
                </div>
            )}
            {hasVideos && (
                <div>
                    <h3 className="font-semibold text-xl mb-3">Videos de YouTube Recomendados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrichedContent.youtubeVideos.map((video, i) => (
                            <ResourceLink
                                key={i}
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                icon={Youtube}
                                iconColorClass="text-red-600"
                                title={video.title}
                                summary={video.summary}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

ResourcesTab.displayName = 'ResourcesTab';
