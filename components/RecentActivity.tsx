'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
type ActivityType = 'upload' | 'approve' | 'reject' | 'edit' | 'comment';

interface Activity {
  id: string;
  type: ActivityType;
  documentTitle: string;
  userName: string;
  timestamp: string;
  status?: string;
}

interface PaginatedActivities {
  activities: Activity[];
  totalPages: number;
  currentPage: number;
}

interface RecentActivityProps {
  onUpdate?: (message: string) => void;
  onError?: (message: string) => void;
}

// API functions
const fetchRecentActivities = async (): Promise<Activity[]> => {
  const res = await fetch('/api/dashboard/activities');
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch activities');
  }
  return res.json();
};

const fetchAllActivities = async (page: number): Promise<PaginatedActivities> => {
  const res = await fetch(`/api/dashboard/activities/all?page=${page}&limit=20`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch all activities');
  }
  return res.json();
};

// Memoized Components
const Pagination = React.memo(({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-between">
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage <= 1}
      className="flex items-center gap-2"
    >
      <ChevronLeft className="h-4 w-4" />
      Previous
    </Button>
    
    <span className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </span>
    
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
      className="flex items-center gap-2"
    >
      Next
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
));

const ActivityIcon = React.memo(({ type }: { type: ActivityType }) => {
  const iconMap = {
    upload: <FileText className="h-5 w-5 text-blue-600" />,
    approve: <CheckCircle className="h-5 w-5 text-green-600" />,
    reject: <XCircle className="h-5 w-5 text-red-600" />,
    edit: <FileText className="h-5 w-5 text-yellow-600" />,
    comment: <FileText className="h-5 w-5 text-purple-600" />
  };
  
  return iconMap[type] || <FileText className="h-5 w-5 text-gray-600" />;
});

const ActivityBadge = React.memo(({ status, type }: { status: string; type: ActivityType }) => {
  const getBadgeVariant = (type: ActivityType) => {
    switch (type) {
      case 'approve':
        return 'default' as const;
      case 'reject':
        return 'destructive' as const;
      case 'upload':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Badge variant={getBadgeVariant(type)} className="text-xs">
      {status}
    </Badge>
  );
});

const ActivitySkeleton = React.memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start space-x-4 p-3 rounded-lg">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
));

const EmptyState = React.memo(() => (
  <div className="text-center py-8">
    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
    <h3 className="text-lg font-semibold text-gray-600">No recent activity</h3>
    <p className="text-gray-500">Activity will appear here as documents are processed</p>
  </div>
));

const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <Alert variant="destructive" role="alert">
    <AlertCircle className="h-4 w-4" aria-hidden="true" />
    <AlertDescription className="flex flex-col gap-2">
      <span>Failed to load recent activities. Please try again.</span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry} 
        className="w-fit"
        aria-label="Retry loading activities"
      >
        <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
));

const ActivityItem = React.memo(({ activity }: { activity: Activity }) => {
  const getActivityText = useCallback((type: ActivityType): string => {
    switch (type) {
      case 'upload':
        return 'uploaded a document';
      case 'approve':
        return 'approved a document';
      case 'reject':
        return 'rejected a document';
      case 'edit':
        return 'edited a document';
      case 'comment':
        return 'commented on the document';
      default:
        return 'performed an action on the document';
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      role="listitem"
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <ActivityIcon type={activity.type} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {activity.userName}
          </span>
          <span className="text-sm text-gray-500">{getActivityText(activity.type)}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
          {activity.documentTitle}
        </p>
        <div className="flex items-center gap-2 mt-1" aria-label="Activity timestamp">
          <Calendar className="w-3 h-3 text-gray-400" aria-hidden="true" />
          <time className="text-xs text-gray-500" dateTime={activity.timestamp}>
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </time>
        </div>
      </div>
      {activity.status && (
        <ActivityBadge status={activity.status} type={activity.type} />
      )}
    </motion.div>
  );
});

// Main Component
const RecentActivity = ({ onUpdate, onError }: RecentActivityProps) => {
  const { toast } = useToast();
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Query for recent activities
  const { 
    data: activities = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: fetchRecentActivities,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Query for all activities with pagination
  const {
    data: allActivities,
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll
  } = useQuery({
    queryKey: ['all-activities', currentPage],
    queryFn: () => fetchAllActivities(currentPage),
    enabled: isViewAllOpen,
    staleTime: 30000,
  });

  // Handle errors
  const handleError = useCallback((error: Error) => {
    const message = error.message || 'An error occurred';
    onError?.(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }, [onError, toast]);

  // Handle success
  const handleSuccess = useCallback((message: string) => {
    onUpdate?.(message);
  }, [onUpdate]);

  // Error effects
  React.useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  React.useEffect(() => {
    if (errorAll) {
      handleError(errorAll);
    }
  }, [errorAll, handleError]);

  // Success effects
  React.useEffect(() => {
    if (activities.length > 0) {
      handleSuccess('Activities loaded successfully');
    }
  }, [activities.length, handleSuccess]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRetryAll = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleViewAllToggle = useCallback((open: boolean) => {
    setIsViewAllOpen(open);
    if (!open) {
      setCurrentPage(1);
    }
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          {!isLoading && !error && activities.length > 0 && (
            <Badge 
              variant="outline" 
              className="ml-auto"
              role="status"
              aria-label={`Total activities: ${activities.length}`}
            >
              {activities.length} activities
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <ActivitySkeleton />
          ) : error ? (
            <ErrorState onRetry={handleRetry} />
          ) : activities.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2" role="list" aria-label="Activity list">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        {activities.length > 0 && (
          <CardFooter className="flex justify-center pt-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => handleViewAllToggle(true)}
              aria-label="View all activities"
            >
              View All Activities
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isViewAllOpen} onOpenChange={handleViewAllToggle}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>All Activities</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleViewAllToggle(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto min-h-0 py-4">
            {isLoadingAll ? (
              <ActivitySkeleton />
            ) : errorAll ? (
              <ErrorState onRetry={handleRetryAll} />
            ) : !allActivities || allActivities.activities.length === 0 ? (
              <EmptyState />
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {allActivities.activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {allActivities && allActivities.activities.length > 0 && (
            <div className="border-t pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={allActivities.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentActivity;