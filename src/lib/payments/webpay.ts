
import type { CheckoutSessionResult, WebpayCommitResult } from '@/lib/types';

const WEBPAY_API_BASE = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2";
const COMMERCE_CODE = process.env.WEBPAY_PLUS_COMMERCE_CODE;
const API_KEY = process.env.WEBPAY_PLUS_API_KEY;

export async function createPayment(
    userId: string, 
    amount: number
): Promise<{ data: CheckoutSessionResult | null; error: string | null }> {
    try {
        if (!COMMERCE_CODE || !API_KEY) {
            throw new Error("Las credenciales de Webpay no están configuradas en el servidor.");
        }

        const buy_order = `O-${userId.substring(0, 6)}-${Date.now()}`;
        const session_id = `S-${userId.substring(0, 6)}-${Date.now()}`;
        const return_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/commit`;

        const headers = {
            "Tbk-Api-Key-Id": COMMERCE_CODE,
            "Tbk-Api-Key-Secret": API_KEY,
            "Content-Type": "application/json",
        };

        const response = await fetch(`${WEBPAY_API_BASE}/transactions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ buy_order, session_id, amount, return_url }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_message || 'Error al crear la transacción en Webpay');
        }

        return { data, error: null };

    } catch (e) {
        console.error("Create Webpay Payment Error:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `No se pudo crear la sesión de pago: ${errorMessage}` };
    }
}


export async function commitPayment(
  token: string
): Promise<{ data: WebpayCommitResult | null; error: string | null }> {
    try {
        if (!token) {
            throw new Error("Token de Webpay no proporcionado.");
        }
         if (!COMMERCE_CODE || !API_KEY) {
            throw new Error("Las credenciales de Webpay no están configuradas en el servidor.");
        }
        
        const headers = {
            "Tbk-Api-Key-Id": COMMERCE_CODE,
            "Tbk-Api-Key-Secret": API_KEY,
            "Content-Type": "application/json",
        };

        const response = await fetch(`${WEBPAY_API_BASE}/transactions/${token}`, {
            method: 'PUT',
            headers,
        });

        const data: WebpayCommitResult = await response.json();

        if (!response.ok) {
            throw new Error(data.error_message || 'Error al confirmar la transacción en Webpay');
        }
        
        return { data, error: null };

    } catch (e) {
        console.error("Commit Webpay Transaction Error:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `Falló la confirmación del pago: ${errorMessage}` };
    }
}
