
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { HistoryItem } from '@/lib/types';
import { useRouter } from 'next/navigation';


const mockHistory: HistoryItem[] = [
    { id: '1', fileName: 'Programa de Kinesiología 2024', date: '2024-07-28', status: 'Completado' },
    { id: '2', fileName: 'Apuntes de Filosofía Antigua', date: '2024-07-25', status: 'Completado' },
    { id: '3', fileName: 'Syllabus de Historia del Arte', date: '2024-07-22', status: 'Completado' },
];

export function MaterialsHistory() {
    const router = useRouter();

    const handleViewAnalysis = (id: string) => {
        // TODO: Implement logic to fetch and display the analysis for the given ID.
        // For now, it can navigate to a placeholder or log to the console.
        console.log(`Navigating to analysis for ID: ${id}`);
        // Example navigation: router.push(`/dashboard/analysis/${id}`);
    };

    return (
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="border-border/80">
                <TableHead>Nombre del Curso</TableHead>
                <TableHead className="text-right">Ver Análisis</TableHead>
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
                  <TableRow key={item.id} className="border-border/80">
                    <TableCell className="font-medium">
                        <div>{item.fileName}</div>
                        <div className="text-xs text-muted-foreground sm:hidden mt-1">{item.date}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewAnalysis(item.id)}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Ver Análisis
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}
