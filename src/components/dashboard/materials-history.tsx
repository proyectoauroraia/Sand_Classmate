
'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { HistoryItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';


const mockHistory: HistoryItem[] = [
    { id: '1', fileName: 'Programa de Kinesiología 2024', date: '2024-07-28', status: 'Completado' },
    { id: '2', fileName: 'Apuntes de Filosofía Antigua', date: '2024-07-25', status: 'Completado' },
    { id: '3', fileName: 'Syllabus de Historia del Arte', date: '2024-07-22', status: 'Completado' },
    { id: '4', fileName: 'Guía de Nutrición Deportiva', date: '2024-07-20', status: 'Completado' },
    { id: '5', fileName: 'Plan de Estudios de Psicología', date: '2024-07-18', status: 'Completado' },
];

export function MaterialsHistory() {
    const router = useRouter();

    const handleViewAnalysis = (id: string) => {
        // TODO: Implement logic to fetch and display the analysis for the given ID.
        // For now, it can log to the console.
        console.log(`Navigating to analysis for ID: ${id}`);
        // Example navigation: router.push(`/dashboard/analysis/${id}`);
    };

    return (
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Curso</TableHead>
                    <TableHead className="text-left">Ver Análisis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        Aún no se han analizado cursos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                            {item.fileName}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleViewAnalysis(item.id)}
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
         <CardFooter>
            {/* Footer can be used for pagination or other actions in the future */}
        </CardFooter>
      </Card>
    );
}
