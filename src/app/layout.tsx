
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Sand Classmate',
  description: 'Usa IA para analizar tus programas de estudio o apuntes y genera automáticamente presentaciones, guías de trabajo y evaluaciones para potenciar tus clases.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
       <body className={`${inter.variable} font-sans`}>
            {children}
            <Toaster />
      </body>
    </html>
  );
}
