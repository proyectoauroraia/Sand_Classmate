import { FileUploader } from '@/components/dashboard/file-uploader';
import { MaterialsHistory } from '@/components/dashboard/materials-history';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
             <h1 className="font-semibold text-lg font-headline hidden">Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Generate New Course Materials</CardTitle>
                    <CardDescription>Upload your syllabus or class notes (PDF) to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploader />
                </CardContent>
            </Card>

            <MaterialsHistory />
        </div>
    );
}
