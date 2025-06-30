'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'; // For the change indicator

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      return res.json();
    }
  });

  const statCards = [
    {
      title: 'Total Documents',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      colorClass: 'bg-blue-500 text-white', // Tailwind class for background and text
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingDocuments || 0,
      icon: Clock,
      colorClass: 'bg-yellow-500 text-white',
      change: '+5%',
      changeType: 'neutral',
    },
    {
      title: 'Approved',
      value: stats?.approvedDocuments || 0,
      icon: CheckCircle,
      colorClass: 'bg-green-500 text-white',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Rejected',
      value: stats?.rejectedDocuments || 0,
      icon: XCircle,
      colorClass: 'bg-red-500 text-white',
      change: '-3%',
      changeType: 'negative',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 daisy-card daisy-card-compact daisy-bg-base-100 daisy-shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium daisy-text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.colorClass}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold daisy-text-gray-900">
                {stat.value}
              </div>
              <div className="flex items-center gap-x-1 mt-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    stat.changeType === 'positive'
                      ? 'text-green-500'
                      : stat.changeType === 'negative'
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}
                />
                <Badge
                  className={`text-xs font-semibold ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-700'
                      : stat.changeType === 'negative'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}