import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

import type { HistoryItem } from '@/lib/types';

const mockHistory: HistoryItem[] = [
    { id: '1', fileName: 'Programa de Kinesiología 2024', date: '2024-07-28', status: 'Completado' },
    { id: '2', fileName: 'Apuntes de Filosofía Antigua', date: '2024-07-25', status: 'Completado' },
    { id: '3', fileName: 'Syllabus de Historia del Arte', date: '2024-07-22', status: 'Completado' },
];

export function MaterialsHistory() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Mis Cursos Analizados</CardTitle>
          <CardDescription>Aquí encontrarás todos los cursos que has analizado. Puedes editarlos o descargar los materiales generados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Curso/Archivo</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha de Análisis</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aún no se han analizado cursos.
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
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Análisis
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Todo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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
