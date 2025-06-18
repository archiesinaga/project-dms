import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentList from "@/components/DocumentList";
import DashboardStats from "@/components/DashboardStats";
import RecentActivity from "@/components/RecentActivity";
import LoadingSpinner from "@/components/LoadingSpinner";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {session.user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your documents and track their approval status
          </p>
        </div>

        {/* Stats Cards */}
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardStats />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Upload Document
              </h2>
              <DocumentUploader />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>

        {/* Document List */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <DocumentList />
          </div>
        </div>
      </div>
    </div>
  );
}