
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Primero, maneja la actualización de la sesión de Supabase
  const { supabase, response } = createClient(request);
  await supabase.auth.getSession();

  const headers = request.headers;
  const host = headers.get('host');

  // Luego, maneja la redirección de HTTP a HTTPS en producción.
  // El encabezado 'x-forwarded-proto' es establecido por el proxy de App Hosting.
  if (process.env.NODE_ENV === 'production' && headers.get('x-forwarded-proto') === 'http' && host) {
    const newUrl = new URL(request.url);
    newUrl.protocol = 'https';
    // Usamos un 301 para una redirección permanente
    return NextResponse.redirect(newUrl.toString(), 301);
  }

  // Si no hay redirección, devuelve la respuesta del middleware de Supabase.
  return response;
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
