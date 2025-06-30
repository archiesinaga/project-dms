import { useQueryClient } from '@tanstack/react-query';
import { ActivityFilter } from '@/types';
import { fetchActivities } from '@/lib/services/activity';

const matchesFilter = (queryFilter: ActivityFilter, filter?: ActivityFilter): boolean => {
  if (!filter) return true;
  
  return JSON.stringify(queryFilter) === JSON.stringify(filter);
};

export const activityCache = {
  prefetch: async (filters: ActivityFilter) => {
    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
      queryKey: ['activities', filters],
      queryFn: () => fetchActivities(filters)
    });
  },
  
  invalidate: async (filters?: ActivityFilter) => {
    const queryClient = useQueryClient();
    await queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey[0] === 'activities' &&
        (!filters || matchesFilter(query.queryKey[1] as ActivityFilter, filters))
    });
  }
};