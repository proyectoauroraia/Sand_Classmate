
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HistoryItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MaterialsHistoryProps {
    isFullPage?: boolean;
    onViewAnalysis?: (item: HistoryItem) => void;
}

const ITEMS_PER_PAGE = 3;

const buttonColors = [
    'bg-primary/80 hover:bg-primary',
    'bg-secondary/80 hover:bg-secondary',
    'bg-accent-foreground/80 hover:bg-accent-foreground',
];

export function MaterialsHistory({ isFullPage = false, onViewAnalysis }: MaterialsHistoryProps) {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
    
    // Filter states
    const [careerFilter, setCareerFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('');

    const [uniqueCareers, setUniqueCareers] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const storedHistory = localStorage.getItem('sand_classmate_history');
            if (storedHistory) {
                const items: HistoryItem[] = JSON.parse(storedHistory);

                // Deduplicate items, keeping the most recent one (first occurrence)
                const uniqueItemsMap = new Map<string, HistoryItem>();
                for (const item of items) {
                    if (!uniqueItemsMap.has(item.courseName)) {
                        uniqueItemsMap.set(item.courseName, item);
                    }
                }
                const uniqueItems = Array.from(uniqueItemsMap.values());
                
                setHistoryItems(uniqueItems);
                setFilteredItems(uniqueItems);
                
                const careers = new Set(uniqueItems.map(item => item.subjectArea).filter(Boolean));
                setUniqueCareers(['all', ...Array.from(careers)]);
            }
        } catch (error) {
            console.error("Could not parse history from localStorage", error);
            setHistoryItems([]);
            setFilteredItems([]);
        }
    }, []);

    useEffect(() => {
        let items = [...historyItems];
        if (careerFilter !== 'all') {
            items = items.filter(item => item.subjectArea === careerFilter);
        }
        if (courseFilter) {
            items = items.filter(item => item.courseName.toLowerCase().includes(courseFilter.toLowerCase()));
        }
        setFilteredItems(items);

    }, [careerFilter, courseFilter, historyItems]);
    
    if (!isClient) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Mis Cursos Guardados</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-grow flex flex-col justify-center items-center">
                    <p className="text-muted-foreground">Cargando historial...</p>
                </CardContent>
            </Card>
        );
    }

    const displayedHistory = isFullPage ? filteredItems : filteredItems.slice(0, ITEMS_PER_PAGE);

    const handleViewAnalysisClick = (item: HistoryItem) => {
        if (onViewAnalysis) {
            onViewAnalysis(item);
        } else {
            console.warn("onViewAnalysis handler is not provided on this page. Consider redirecting to restore state.");
        }
    };
    
    const renderFilters = () => (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select onValueChange={setCareerFilter} defaultValue="all">
                <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Filtrar por Carrera..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las Carreras</SelectItem>
                    {uniqueCareers.filter(c => c !== 'all').map(career => (
                        <SelectItem key={career} value={career}>{career}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input 
                className="w-full sm:w-[250px]"
                placeholder="Filtrar por Asignatura..."
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
            />
        </div>
    );

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
        <CardContent className="pt-0 flex-grow flex flex-col">
            {isFullPage && renderFilters()}
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 rounded-lg">
                    <TableHead className="text-sm text-foreground font-bold">Carrera / Área</TableHead>
                    <TableHead className="text-sm text-foreground font-bold">Asignatura</TableHead>
                    <TableHead className="text-center text-sm text-foreground font-bold">Ver Análisis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        {historyItems.length > 0 ? 'No hay resultados para los filtros aplicados.' : 'Aquí aparecerán tus análisis guardados.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedHistory.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium py-4 text-muted-foreground">{item.subjectArea || 'N/A'}</TableCell>
                        <TableCell className="font-medium py-4">{item.courseName || 'Nombre no disponible'}</TableCell>
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
