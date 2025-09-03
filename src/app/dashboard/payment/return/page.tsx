
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { DuneBackground } from '@/components/icons/dune-background';
import { Loader2 } from 'lucide-react';

const PaymentReturnContent = dynamic(
  () => import('@/components/dashboard/payment/payment-return-content').then(mod => mod.PaymentReturnContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando información del pago...</p>
        </div>
      </div>
    ),
  }
);


export default function PaymentReturnPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <DuneBackground />
            <PaymentReturnContent />
        </div>
    );
}
