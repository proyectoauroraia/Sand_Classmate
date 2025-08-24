import { MaterialsHistory } from '@/components/dashboard/materials-history';

export default function HistoryPage() {
    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold tracking-tight">Mi Biblioteca de Cursos</h1>
            <MaterialsHistory />
        </div>
    );
}
