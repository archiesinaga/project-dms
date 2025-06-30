'use client';

import { ActivityFilter, ActivityType } from '@/types';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { UserSelect } from '@/components/shared/UserSelect';
import { StatusSelect } from '@/components/shared/StatusSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';

// Define activity type options with proper typing
const activityTypeOptions: Option<ActivityType>[] = [
  { label: 'Upload', value: 'upload' },
  { label: 'Approve', value: 'approve' },
  { label: 'Reject', value: 'reject' },
  { label: 'Edit', value: 'edit' },
  { label: 'Comment', value: 'comment' },
];

interface ActivityFiltersProps {
  filters: ActivityFilter;
  onFilterChange: (filters: ActivityFilter) => void;
  className?: string;
}

export const ActivityFilters = ({ 
  filters, 
  onFilterChange,
  className 
}: ActivityFiltersProps) => {
  // Handler functions for type safety
  const handleDateRangeChange = (range: DateRange | null) => {
    onFilterChange({ ...filters, dateRange: range });
  };

  const handleTypeChange = (types: ActivityType[]) => {
    onFilterChange({ ...filters, type: types });
  };

  const handleUserChange = (users: string[]) => {
    onFilterChange({ ...filters, users });
  };

  const handleStatusChange = (status: string[]) => {
    onFilterChange({ ...filters, status });
  };

  return (
    <Card className={className}>
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label htmlFor="date-range">Date Range</Label>
          <DateRangePicker
            id="date-range"
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            aria-label="Filter by date range"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label htmlFor="activity-type">Activity Type</Label>
          <MultiSelect
            id="activity-type"
            label="Activity Type"
            options={activityTypeOptions}
            value={filters.type}
            onChange={handleTypeChange}
            placeholder="Select types..."
            aria-label="Filter by activity type"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label htmlFor="users">Users</Label>
          <UserSelect
            id="users"
            value={filters.users}
            onChange={handleUserChange}
            aria-label="Filter by users"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label htmlFor="status">Status</Label>
          <StatusSelect
            id="status"
            value={filters.status}
            onChange={handleStatusChange}
            aria-label="Filter by status"
          />
        </div>
      </div>
    </Card>
  );
};