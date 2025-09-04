
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HistoryItem } from '@/lib/types';
import Link from 'next/link';

interface MaterialsHistoryProps {
    isFullPage?: boolean;
    onViewAnalysis?: (item: HistoryItem) => void;
}

const ITEMS_PER_PAGE_DASHBOARD = 3;

export function MaterialsHistory({ isFullPage = false, onViewAnalysis }: MaterialsHistoryProps) {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
    
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
            <div className="h-full flex flex-col justify-center items-center">
                <p className="text-muted-foreground">Cargando historial...</p>
            </div>
        );
    }

    const displayedHistory = isFullPage ? filteredItems : filteredItems.slice(0, ITEMS_PER_PAGE_DASHBOARD);

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

    if(isFullPage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mi Biblioteca de Cursos</CardTitle>
                    <CardDescription>Aquí puedes ver, filtrar y acceder a todos los análisis de cursos que has guardado.</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFilters()}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Carrera / Área</TableHead>
                                <TableHead>Asignatura</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
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
                                displayedHistory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-muted-foreground">{item.subjectArea || 'N/A'}</TableCell>
                                        <TableCell className="font-semibold">{item.courseName || 'Nombre no disponible'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handleViewAnalysisClick(item)}>
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
        )
    }

    return (
        <div>
            {displayedHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    Aquí aparecerán tus análisis guardados.
                </div>
            ) : (
                <div className="space-y-3">
                    {displayedHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                            <div>
                                <p className="font-semibold text-sm">{item.courseName}</p>
                                <p className="text-xs text-muted-foreground">{item.subjectArea}</p>
                            </div>
                            <Button size="sm" variant="link" className="text-accent-foreground" onClick={() => handleViewAnalysisClick(item)}>
                                Ver
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            {!isFullPage && historyItems.length > ITEMS_PER_PAGE_DASHBOARD && (
                <Button asChild variant="link" className="w-full mt-4">
                    <Link href="/dashboard/history">Ver todo</Link>
                </Button>
            )}
        </div>
    );
}
