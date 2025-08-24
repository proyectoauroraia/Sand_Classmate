import { FileUploader } from '@/components/dashboard/file-uploader';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Generador de Material Educativo</h1>
                <p className="text-muted-foreground mt-2">Comienza subiendo tu programa de estudios o apuntes (en formato PDF) para analizarlos.</p>
            </div>
            <FileUploader />
        </div>
    );
}
