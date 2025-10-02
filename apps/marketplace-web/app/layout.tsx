'use client';

import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useState } from 'react';
import '@nextgen-marketplace/ui';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: (failureCount, error: any) => {
          if (error?.code === 'UNAUTHORIZED') return false;
          return failureCount < 3;
        },
      },
    },
  }));

  return (
    <html lang="fa" dir="rtl" className="font-vazir" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className="skip-link"
              tabIndex={0}
            >
              رفتن به محتوای اصلی
            </a>
            
            <div id="main-content" className="min-h-screen bg-background">
              {children}
            </div>
            
            <Toaster 
              position="top-center" 
              dir="rtl"
              richColors
              closeButton
            />
            
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}