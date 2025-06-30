'use client';

import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentList from "@/components/DocumentList";
import DashboardStats from "@/components/DashboardStats";
import RecentActivity from "@/components/RecentActivity";
import { useState } from 'react';
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRoleCheck } from '@/lib/useRoleCheck';

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/login');
    },
  });
  const router = useRouter();
  const { isAdmin } = useRoleCheck();
  const [statusMessage, setStatusMessage] = useState('System is running normally');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSystemActive, setIsSystemActive] = useState(true);

  // Tampilkan loading state saat mengecek autentikasi
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner 
          size="lg" 
          text="Loading dashboard..." 
          variant="card"
        />
      </div>
    );
  }

  // Jika tidak ada session, tampilkan pesan dan redirect
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please login to access the dashboard</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleStatusMessage = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage('System is running normally'), 3000);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Link untuk aksesibilitas */}
      <a href="#main-content" className="sr-only focus:not-sr-only fixed top-0 left-0 p-2 bg-primary text-white z-50">
        Skip to main content
      </a>

      {/* Error Message Alert */}
      {errorMessage && (
        <div role="alert" className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {errorMessage}
        </div>
      )}

      {/* Status Message */}
      <div aria-live="polite" role="status" className="bg-blue-100 text-blue-800 p-2 mb-4">
        {statusMessage}
      </div>

      {/* System Toggle - Hanya tampilkan untuk Admin */}
      {isAdmin && (
        <button 
          role="switch" 
          aria-checked={isSystemActive}
          onClick={() => setIsSystemActive(!isSystemActive)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          System is {isSystemActive ? 'Active' : 'Inactive'}
        </button>
      )}

      <div id="main-content" className="max-w-7xl mx-auto px-4 pt-8">
        {/* High Contrast Header */}
        <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session.user?.name || session.user?.email}!
          </h1>
          <p className="text-gray-200">
            {isAdmin 
              ? "Manage your documents and track their approval status" 
              : "View and track document approval status"}
          </p>
        </div>

        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Document - Hanya tampilkan jika user memiliki akses */}
            {isAdmin && (
              <div className="card bg-base-100 shadow-xl rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-4 text-primary">Upload Document</h2>
                <DocumentUploader 
                  onSuccess={(msg) => {
                    handleStatusMessage(msg);
                    router.refresh();
                  }}
                  onError={handleError}
                />
              </div>
            )}
            
            <div className="card bg-base-100 shadow-xl rounded-2xl p-8">
              <DocumentList 
                onStatusChange={handleStatusMessage}
                onError={handleError}
              />
            </div>
          </div>
          <div>
            <div className="card bg-base-100 shadow-xl rounded-2xl p-8">
              <RecentActivity 
                onUpdate={handleStatusMessage}
                onError={handleError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}