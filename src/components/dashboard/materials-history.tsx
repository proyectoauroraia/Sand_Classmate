
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { HistoryItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MaterialsHistoryProps {
    isFullPage?: boolean;
    onViewAnalysis?: (item: HistoryItem) => void;
}

const ITEMS_PER_PAGE = 4;

const buttonColors = [
    'bg-primary/80 hover:bg-primary',
    'bg-secondary/80 hover:bg-secondary',
    'bg-accent-foreground/80 hover:bg-accent-foreground',
    'bg-primary/60 hover:bg-primary/90',
];

export function MaterialsHistory({ isFullPage = false, onViewAnalysis }: MaterialsHistoryProps) {
    const router = useRouter();
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
      try {
        const storedHistory = localStorage.getItem('sand_classmate_history');
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Could not parse history from localStorage", error);
        setHistoryItems([]);
      }
    }, []);

    const displayedHistory = isFullPage ? historyItems : historyItems.slice(0, ITEMS_PER_PAGE);

    const handleViewAnalysisClick = (item: HistoryItem) => {
        if (onViewAnalysis) {
            onViewAnalysis(item);
        } else {
            // Fallback for the full history page where the main page context might not exist
            // This could redirect to a specific view page in the future
            console.warn("onViewAnalysis handler is not provided on this page. Consider redirecting to restore state.");
        }
    };

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Mis Cursos Guardados</CardTitle>
            {!isFullPage && historyItems.length > ITEMS_PER_PAGE && (
                <Button asChild variant="ghost" className="text-primary font-semibold hover:underline">
                    <Link href="/dashboard/history">Ver todo</Link>
                </Button>
            )}
        </CardHeader>
        <CardContent className="pt-0 flex-grow">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 rounded-lg">
                    <TableHead className="text-sm text-foreground font-bold">Asignatura</TableHead>
                    {isFullPage && <TableHead className="hidden md:table-cell text-sm text-foreground font-bold">Carrera / Área</TableHead>}
                    <TableHead className="text-center text-sm text-foreground font-bold">Ver Análisis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isFullPage ? 3 : 2} className="h-24 text-center">
                        Aquí aparecerán tus análisis guardados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedHistory.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium py-4">
                            {item.courseName || (item as any).fileName || 'Nombre no disponible'}
                        </TableCell>
                        {isFullPage && <TableCell className="hidden md:table-cell text-muted-foreground">{item.subjectArea || 'N/A'}</TableCell>}
                        <TableCell className="text-center">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleViewAnalysisClick(item)}
                            className={cn('text-secondary-foreground transition-colors',buttonColors[index % buttonColors.length])}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
        </CardContent>
      </Card>
    );
}
