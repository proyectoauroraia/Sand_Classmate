
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { commitWebpayTransactionAction } from '@/lib/actions';
import type { WebpayCommitResult } from '@/lib/types';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DuneBackground } from '@/components/icons/dunes-background';

type Status = 'loading' | 'success' | 'failed' | 'user_canceled' | 'error';

const StatusContent = {
    loading: {
        icon: Loader2,
        title: 'Procesando tu pago...',
        description: 'Estamos confirmando la transacción con Transbank. Por favor, espera un momento.',
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
    const [commitResult, setCommitResult] = React.useState<WebpayCommitResult | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const token_ws = searchParams.get('token_ws');
        const tbk_token_id = searchParams.get('TBK_TOKEN_ID');

        if (tbk_token_id) {
            // User aborted the payment on the Webpay form
            setStatus('user_canceled');
            return;
        }

        if (!token_ws) {
            setStatus('error');
            setError('No se encontró el token de Webpay en la URL de retorno.');
            return;
        }
        
        const commitTransaction = async () => {
            const { data, error } = await commitWebpayTransactionAction(token_ws);
            if (error) {
                setStatus('error');
                setError(error);
                return;
            }
            if (data) {
                setCommitResult(data);
                switch (data.status) {
                    case 'AUTHORIZED':
                        setStatus('success');
                        break;
                    case 'FAILED':
                        setStatus('failed');
                        break;
                    case 'CANCELED':
                        setStatus('user_canceled');
                        break;
                    default:
                        setStatus('failed');
                        break;
                }
            }
        };

        commitTransaction();

    }, [searchParams]);
    
    const currentStatus = StatusContent[status];
    const Icon = currentStatus.icon;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
            <DuneBackground />
             <div className="w-full max-w-lg z-10 p-4">
                <Card className="shadow-2xl shadow-primary/10">
                    <CardHeader className="text-center items-center">
                        <Icon className={`h-16 w-16 mb-4 ${currentStatus.color} ${currentStatus.spin ? 'animate-spin' : ''}`} />
                        <CardTitle className="text-2xl">{currentStatus.title}</CardTitle>
                        <CardDescription>{error || currentStatus.description}</CardDescription>
                    </CardHeader>
                    {status !== 'loading' && (
                        <CardContent className="text-center">
                             {status === 'success' && commitResult && (
                                <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between"><span>Monto Pagado:</span> <span className="font-medium">${commitResult.amount.toLocaleString('es-CL')}</span></div>
                                    <div className="flex justify-between"><span>Orden de Compra:</span> <span className="font-medium">{commitResult.buy_order}</span></div>
                                    <div className="flex justify-between"><span>Tarjeta:</span> <span className="font-medium">**** **** **** {commitResult.card_detail.card_number}</span></div>
                                </div>
                            )}
                            <Button asChild className="mt-6 w-full" size="lg">
                                <Link href="/dashboard">
                                    {status === 'success' ? 'Ir al Dashboard' : 'Volver a Intentar'}
                                </Link>
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </div>
        </main>
    );
}
