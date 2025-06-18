'use client';
import './globals.css';
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NotificationProvider } from "@/components/NotificationContext";
import { ThemeProvider } from "@/components/ThemeContext";
import Navbar from '@/components/Navbar';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 min-h-screen">
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ThemeProvider>
              <NotificationProvider>
                <Navbar />
                <main className="pt-20">{children}</main>
              </NotificationProvider>
            </ThemeProvider>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}