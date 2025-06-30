import { useQuery } from '@tanstack/react-query';
import { ActivityFilter } from '@/types';
import { fetchActivities } from '@/lib/services/activity';

export const useActivityQuery = (filters: ActivityFilter) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => fetchActivities(filters),
    keepPreviousData: true,
    staleTime: 30000,
    cacheTime: 300000,
    select: (data) => ({
      ...data,
      activities: data.activities.map(enrichActivityData)
    })
  });
};

const enrichActivityData = (activity: any) => {
  return {
    ...activity,
    formattedDate: new Date(activity.timestamp).toLocaleDateString(),
    formattedTime: new Date(activity.timestamp).toLocaleTimeString(),
  };
};