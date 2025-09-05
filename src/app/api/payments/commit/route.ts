
import { NextRequest, NextResponse } from 'next/server';
import { commitPayment } from '@/lib/payments/webpay';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token_ws');
  const tbkAborted = req.nextUrl.searchParams.get('TBK_TOKEN_ID');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  if (tbkAborted) {
    // User canceled the payment on the Webpay portal.
    return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=user_canceled`);
  }

  if (!token) {
    console.error("Commit request is missing 'token_ws'.");
    return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=error`);
  }

  try {
    const result = await commitPayment(token);
    
    if (result.error || !result.data) {
        console.error("Error committing payment:", result.error);
        return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=failed`);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (result.data.status === 'AUTHORIZED' && user) {
        // Here you would typically store the transaction details and make the action idempotent
        // by checking if the buy_order has already been processed.
        const { error: updateError } = await supabase.from('profiles').update({ premium: true }).eq('id', user.id);
        
        if (updateError) {
            console.error(`Failed to grant premium to user ${user.id} after payment`, updateError);
            // Even if the DB update fails, the payment is successful.
            // This should be handled by a reconciliation process.
            return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=error`);
        }
        
        return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=success`);
    } else {
        console.warn(`Payment not authorized or user not found. Status: ${result.data.status}`);
        return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=failed`);
    }
  } catch (err) {
      console.error("Critical error in commit route:", err);
      return NextResponse.redirect(`${baseUrl}/dashboard/payment/return?status=error`);
  }
}
