import './globals.css';
import { Suspense } from 'react';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Metadata } from 'next';

export const metadata = {
  title: 'Document Management System',
  description: 'A secure and efficient document management system',
  icons: {
    icon: '/favicon.ico',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff'
};

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text="Loading application..." />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 to-purple-100">
        <Providers>
          <Suspense fallback={<Loading />}>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar />
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <Navbar />
                
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}