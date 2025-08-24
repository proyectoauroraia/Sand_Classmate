
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
    { id: '5', fileName: 'Plan de Estudios de Psicología', date: '2024-07-18', status: 'Completado' },
    { id: '6', fileName: 'Material de Nutrición I', date: '2024-07-15', status: 'Completado' },
    { id: '7', fileName: 'Guía de Laboratorio de Química', date: '2024-07-12', status: 'Completado' },
    { id: '8', fileName: 'Curso de Cálculo Avanzado', date: '2024-07-10', status: 'Completado' },
];

const ITEMS_PER_PAGE = 4;

const buttonColors = [
    'bg-gradient-to-br from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700', // Green
    'bg-gradient-to-br from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600', // Yellow
    'bg-gradient-to-br from-teal-400 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-600', // Teal/Cyan
    'bg-gradient-to-br from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600', // Blue
];

export function MaterialsHistory() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(0);

    const pageCount = Math.ceil(mockHistory.length / ITEMS_PER_PAGE);
    const paginatedHistory = mockHistory.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handleViewAnalysis = (id: string) => {
        // TODO: Implement logic to fetch and display the analysis for the given ID.
        console.log(`Navigating to analysis for ID: ${id}`);
        // Example navigation: router.push(`/dashboard/analysis/${id}`);
    };

    return (
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6 flex-grow">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm text-foreground">Nombre del Curso</TableHead>
                    <TableHead className="text-right text-sm text-foreground">Ver Análisis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        Aún no se han analizado cursos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHistory.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium py-4">
                            {item.fileName}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleViewAnalysis(item.id)}
                            className={cn('shadow-md hover:shadow-lg transition-shadow',buttonColors[((currentPage * ITEMS_PER_PAGE) + index) % buttonColors.length])}
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
         <CardFooter className="justify-center pt-4">
            <div className="flex items-center gap-3">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    'h-2 w-2 rounded-full bg-muted transition-all duration-300 ease-in-out hover:bg-muted-foreground/50',
                    currentPage === index && 'w-4 bg-primary'
                  )}
                  aria-label={`Ir a la página ${index + 1}`}
                />
              ))}
            </div>
        </CardFooter>
      </Card>
    );
}
