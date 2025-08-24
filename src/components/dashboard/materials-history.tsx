import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { HistoryItem } from '@/lib/types';

const mockHistory: HistoryItem[] = [
    { id: '1', fileName: 'CS101_Syllabus_Fall24.pdf', date: '2024-07-28', status: 'Completado' },
    { id: '2', fileName: 'Intro_to_Philosophy_Notes.docx', date: '2024-07-25', status: 'Completado' },
    { id: '3', fileName: 'Art_History_Week_1.pdf', date: '2024-07-22', status: 'Completado' },
];

export function MaterialsHistory() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Mis Materiales Generados</CardTitle>
          <CardDescription>Revisa y descarga los materiales de tu curso generados anteriormente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo Original</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha de Generación</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aún no se han generado materiales.
                  </TableCell>
                </TableRow>
              ) : (
                mockHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.fileName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.date}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Todo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
