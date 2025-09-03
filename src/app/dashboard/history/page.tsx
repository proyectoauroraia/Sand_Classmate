import { MaterialsHistory } from '@/components/dashboard/materials-history';

export default function HistoryPage() {
    return (
        <div className="flex flex-col h-full space-y-6 p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mi Biblioteca de Cursos</h1>
            <p className="text-muted-foreground mt-2">Aquí puedes ver, filtrar y acceder a todos los análisis de cursos que has guardado.</p>
            <div className="flex-1 min-h-0">
                <MaterialsHistory isFullPage={true} />
            </div>
        </div>
    );
}
