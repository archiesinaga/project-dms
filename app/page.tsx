'use client';

import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RecentActivity from "@/components/RecentActivity";
import { useState } from 'react';
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRoleCheck } from '@/lib/useRoleCheck';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import DocumentList from '@/components/DocumentList';

// Komponen untuk Loading State
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner 
      size="lg" 
      text="Loading dashboard..." 
      variant="card"
    />
  </div>
);

// Komponen untuk System Status
const SystemStatus = ({ 
  errorMessage, 
  statusMessage 
}: { 
  errorMessage: string; 
  statusMessage: string;
}) => (
  <>
    {errorMessage && (
      <div role="alert" className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        {errorMessage}
      </div>
    )}
    <div aria-live="polite" role="status" className="bg-blue-100 text-blue-800 p-2 mb-4">
      {statusMessage}
    </div>
  </>
);

// Komponen untuk Header
const DashboardHeader = ({ 
  userName, 
  isAdmin 
}: { 
  userName: string; 
  isAdmin: boolean;
}) => (
  <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
    <h1 className="text-3xl font-bold mb-2">
      Welcome back, {userName}!
    </h1>
    <p className="text-gray-200">
      {isAdmin 
        ? "Manage your documents and track their approval status" 
        : "View and track document approval status"}
    </p>
  </div>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isAdmin } = useRoleCheck();
  const [statusMessage, setStatusMessage] = useState('System is running normally');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSystemActive, setIsSystemActive] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  const handleStatusMessage = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage('System is running normally'), 3000);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (!session) {
    // While redirecting, show nothing or a loading spinner
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Status Message */}
          {errorMessage && (
            <div role="alert" className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">
              {errorMessage}
            </div>
          )}
          <div aria-live="polite" role="status" className="bg-blue-100 text-blue-800 p-2 mb-4 rounded-lg">
            {statusMessage}
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome, {session.user?.name || session.user?.email || ''}!</h1>
              <p className="text-gray-600 text-base">
                {isAdmin ? 'Manage your documents and track their approval status' : 'View and track document approval status'}
              </p>
            </div>
            {isAdmin && (
              <button 
                role="switch" 
                aria-checked={isSystemActive}
                onClick={() => setIsSystemActive(!isSystemActive)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
              >
                System is {isSystemActive ? 'Active' : 'Inactive'}
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardStats />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <div className="card bg-white/90 shadow-xl rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-4 text-primary">Document List</h2>
                <DocumentList 
                  onStatusChange={handleStatusMessage}
                  onError={handleError}
                />
              </div>
            </div>
            <div>
              <div className="card bg-white/90 shadow-xl rounded-2xl p-8">
                <RecentActivity 
                  onUpdate={handleStatusMessage}
                  onError={handleError}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}