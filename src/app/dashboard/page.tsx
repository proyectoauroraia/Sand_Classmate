import { FileUploader } from '@/components/dashboard/file-uploader';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Generador de Material Educativo</h1>
                <p className="text-muted-foreground mt-1">Sube tu programa de estudios o apuntes (PDF) para comenzar.</p>
            </div>
            <FileUploader />
        </div>
    );
}
