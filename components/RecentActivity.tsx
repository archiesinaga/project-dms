'use client';
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit,
  User,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: 'upload' | 'approve' | 'reject' | 'edit' | 'comment';
  documentTitle: string;
  userName: string;
  timestamp: string;
  status?: string;
}

export default function RecentActivity() {
  const { data: activities = [], isLoading, error } = useQuery(
    'recent-activities',
    async (): Promise<Activity[]> => {
      try {
        const res = await fetch('/api/dashboard/activities');
        if (!res.ok) {
          throw new Error('Failed to fetch activities');
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Return mock data for development
        return getMockActivities();
      }
    },
    {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    }
  );

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'approve':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'reject':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'edit':
        return <Edit className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'approve':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'reject':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'edit':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'upload':
        return `uploaded a new document`;
      case 'approve':
        return `approved the document`;
      case 'reject':
        return `rejected the document`;
      case 'edit':
        return `edited the document`;
      default:
        return `performed an action on the document`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Failed to load recent activities</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activities.length} activities
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recent activity</h3>
          <p className="text-gray-500 dark:text-gray-400">Activity will appear here as you use the system</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.userName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getActivityText(activity)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {activity.documentTitle}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {activity.status && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                  {activity.status}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all activities
          </button>
        </div>
      )}
    </div>
  );
}

// Mock data untuk development
function getMockActivities(): Activity[] {
  return [
    {
      id: '1',
      type: 'upload',
      documentTitle: 'Q4 Financial Report.pdf',
      userName: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      status: 'SUBMITTED'
    },
    {
      id: '2',
      type: 'approve',
      documentTitle: 'Marketing Strategy.docx',
      userName: 'Jane Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: 'APPROVED'
    },
    {
      id: '3',
      type: 'edit',
      documentTitle: 'Product Requirements.pdf',
      userName: 'Mike Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      status: 'DRAFTED'
    },
    {
      id: '4',
      type: 'reject',
      documentTitle: 'Budget Proposal.xlsx',
      userName: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      status: 'REJECTED'
    },
    {
      id: '5',
      type: 'upload',
      documentTitle: 'Employee Handbook.pdf',
      userName: 'Alex Brown',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      status: 'PENDING'
    }
  ];
}