
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is obsolete as the content is now on the main page.
// We redirect to the main page to avoid duplication and dead routes.
export default function ObsoleteDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
           <p>Redirigiendo...</p>
        </div>
    );
}
