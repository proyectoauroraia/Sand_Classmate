
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
];

const ITEMS_TO_SHOW = 4;

const buttonColors = [
    'bg-gradient-to-br from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700', // Green
    'bg-gradient-to-br from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600', // Yellow
    'bg-gradient-to-br from-teal-400 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-600', // Teal/Cyan
    'bg-gradient-to-br from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600', // Blue
];

export function MaterialsHistory() {
    const router = useRouter();

    const displayedHistory = mockHistory.slice(0, ITEMS_TO_SHOW);

    const handleViewAnalysis = (id: string) => {
        // TODO: Implement logic to fetch and display the analysis for the given ID.
        console.log(`Navigating to analysis for ID: ${id}`);
        // Example navigation: router.push(`/dashboard/analysis/${id}`);
    };

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight">Cursos Recientes</CardTitle>
             <Button asChild variant="link" className="text-primary font-semibold">
                <Link href="/dashboard/history">Ver todo</Link>
            </Button>
        </CardHeader>
        <CardContent className="pt-0 flex-grow">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 rounded-lg">
                    <TableHead className="text-sm text-foreground font-bold">Nombre del Curso</TableHead>
                    <TableHead className="text-center text-sm text-foreground font-bold">Ver Análisis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        Aún no se han analizado cursos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedHistory.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium py-4">
                            {item.fileName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            size="sm" 
                            onClick={() => handleViewAnalysis(item.id)}
                            className={cn('shadow-md hover:shadow-lg transition-shadow',buttonColors[index % buttonColors.length])}
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
