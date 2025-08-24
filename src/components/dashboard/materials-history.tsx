
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { HistoryItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';


const mockHistory: HistoryItem[] = [
    { id: '1', fileName: 'Programa de Curso', date: '2024-07-28', status: 'Completado' },
    { id: '2', fileName: 'Programa de Kinesiología 2024', date: '2024-07-25', status: 'Completado' },
    { id: '3', fileName: 'Apuntes de Filosofía Antigua', date: '2024-07-22', status: 'Completado' },
    { id: '4', fileName: 'Syllabus de Historia del Arte', date: '2024-07-20', status: 'Completado' },
    { id: '5', fileName: 'Planificación de Nutrición', date: '2024-07-18', status: 'Completado' },
    { id: '6', fileName: 'Examen de Cálculo I', date: '2024-07-15', status: 'Completado' },
];

const ITEMS_PER_PAGE = 4;

const buttonColors = [
    'bg-primary/80 hover:bg-primary',
    'bg-secondary/80 hover:bg-secondary',
    'bg-accent-foreground/80 hover:bg-accent-foreground',
    'bg-primary/60 hover:bg-primary/90',
];

export function MaterialsHistory({ isFullPage = false }: { isFullPage?: boolean}) {
    const router = useRouter();

    const displayedHistory = isFullPage ? mockHistory : mockHistory.slice(0, ITEMS_PER_PAGE);

    const handleViewAnalysis = (id: string) => {
        // TODO: Implement logic to fetch and display the analysis for the given ID.
        console.log(`Navigating to analysis for ID: ${id}`);
        // Example navigation: router.push(`/dashboard/analysis/${id}`);
    };

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Cursos Recientes</CardTitle>
            {!isFullPage && (
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
                    <TableHead className="text-sm text-foreground font-bold">Nombre del Curso</TableHead>
                    {isFullPage && <TableHead className="hidden md:table-cell text-sm text-foreground font-bold">Fecha</TableHead>}
                    <TableHead className="text-center text-sm text-foreground font-bold">Ver Análisis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isFullPage ? 3: 2} className="h-24 text-center">
                        Aún no se han analizado cursos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedHistory.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium py-4">
                            {item.fileName}
                        </TableCell>
                        {isFullPage && <TableCell className="hidden md:table-cell">{item.date}</TableCell>}
                        <TableCell className="text-center">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleViewAnalysis(item.id)}
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
