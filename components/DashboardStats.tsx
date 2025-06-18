'use client';
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  });

  const statCards = [
    {
      title: "Total Documents",
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Pending Approval",
      value: stats?.pendingDocuments || 0,
      icon: Clock,
      color: "bg-yellow-500",
      change: "+5%",
      changeType: "neutral"
    },
    {
      title: "Approved",
      value: stats?.approvedDocuments || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Rejected",
      value: stats?.rejectedDocuments || 0,
      icon: XCircle,
      color: "bg-red-500",
      change: "-3%",
      changeType: "negative"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className={`w-4 h-4 ${
              stat.changeType === 'positive' ? 'text-green-500' : 
              stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ml-1 ${
              stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
              stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}