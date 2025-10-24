import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './stack-auth-overrides.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/providers/ToastProvider';
import { MockModeBanner } from '@/components/MockModeBanner';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sora Studio - AI Video Generation',
  description: 'Create stunning AI-generated videos with Sora 2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <MockModeBanner />
            {children}
            <ToastProvider />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
