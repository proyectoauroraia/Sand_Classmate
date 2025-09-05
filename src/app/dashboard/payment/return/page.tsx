
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DuneBackground } from '@/components/icons/dune-background';

type Status = 'loading' | 'success' | 'failed' | 'user_canceled' | 'error';

const StatusContent = {
    loading: {
        icon: Loader2,
        title: 'Procesando...',
        description: 'Verificando estado de la transacción. Por favor, espera.',
        color: 'text-blue-500',
        spin: true,
    },
    success: {
        icon: CheckCircle2,
        title: '¡Pago Exitoso!',
        description: 'Tu suscripción Premium ha sido activada. ¡Gracias por unirte a Sand Classmate!',
        color: 'text-green-500',
        spin: false,
    },
    failed: {
        icon: XCircle,
        title: 'Pago Rechazado',
        description: 'Tu transacción fue rechazada. Por favor, intenta con otro medio de pago.',
        color: 'text-red-500',
        spin: false,
    },
     user_canceled: {
        icon: AlertTriangle,
        title: 'Pago Cancelado',
        description: 'Has cancelado el proceso de pago. Puedes intentarlo de nuevo cuando quieras.',
        color: 'text-amber-500',
        spin: false,
    },
    error: {
        icon: XCircle,
        title: 'Error en la Transacción',
        description: 'Ocurrió un error inesperado al procesar tu pago. Por favor, contacta a soporte.',
        color: 'text-red-500',
        spin: false,
    },
};

export default function PaymentReturnPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = React.useState<Status>('loading');

    React.useEffect(() => {
        const paymentStatus = searchParams.get('status') as Status;
        if (paymentStatus && StatusContent[paymentStatus]) {
            setStatus(paymentStatus);
        } else {
            // This case handles direct access or invalid status, where we need to check the token
            const token_ws = searchParams.get('token_ws');
            const tbk_token_id = searchParams.get('TBK_TOKEN_ID');

            if (tbk_token_id) {
                setStatus('user_canceled');
            } else if (!token_ws) {
                setStatus('error');
            }
            // If token_ws exists, we keep loading as the commit is server-side.
            // The server will redirect to /payment/return?status=...
        }
    }, [searchParams]);

    const currentStatus = StatusContent[status];
    const Icon = currentStatus.icon;

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            <DuneBackground />
            <main className="flex flex-col items-center justify-center p-4 sm:p-8 z-10 w-full">
                 <div className="w-full max-w-lg z-10">
                    <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/20">
                        <CardHeader className="text-center items-center">
                            <Icon className={`h-16 w-16 mb-4 ${currentStatus.color} ${currentStatus.spin ? 'animate-spin' : ''}`} />
                            <CardTitle className="text-2xl">{currentStatus.title}</CardTitle>
                            <CardDescription>{currentStatus.description}</CardDescription>
                        </CardHeader>
                        {status !== 'loading' && (
                            <CardContent className="text-center">
                                <Button asChild className="mt-6 w-full" size="lg">
                                    <Link href="/">
                                        {status === 'success' ? 'Ir al Inicio' : 'Volver a Intentar'}
                                    </Link>
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
