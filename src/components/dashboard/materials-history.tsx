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
    { id: '1', fileName: 'CS101_Syllabus_Fall24.pdf', date: '2024-07-28', status: 'Completed' },
    { id: '2', fileName: 'Intro_to_Philosophy_Notes.docx', date: '2024-07-25', status: 'Completed' },
    { id: '3', fileName: 'Art_History_Week_1.pdf', date: '2024-07-22', status: 'Completed' },
];

export function MaterialsHistory() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Generated Materials</CardTitle>
          <CardDescription>Review and download your previously generated course materials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original File</TableHead>
                <TableHead className="hidden sm:table-cell">Date Generated</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No materials generated yet.
                  </TableCell>
                </TableRow>
              ) : (
                mockHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.fileName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.date}</TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">{item.status}</Badge></TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download All
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
