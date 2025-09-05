
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPayment } from '@/lib/payments/webpay';

export async function POST() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
        }
        
        // You would typically get amount and other details from request body or DB
        const amount = 12000; 

        const paymentResult = await createPayment(user.id, amount);
        
        if (paymentResult.error || !paymentResult.data) {
             throw new Error(paymentResult.error || 'No se pudo iniciar el pago');
        }

        return NextResponse.json({ url: paymentResult.data.url });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
        console.error('Payment init error:', err);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
