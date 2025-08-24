import { FileUploader } from '@/components/dashboard/file-uploader';
import { MaterialsHistory } from '@/components/dashboard/materials-history';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Generate New Course Materials</h1>
                <p className="text-muted-foreground mt-1">Upload your syllabus or class notes (PDF) to get started.</p>
            </div>

            <FileUploader />

            <MaterialsHistory />
        </div>
    );
}
