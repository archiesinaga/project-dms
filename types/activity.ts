import { ActivityType } from '@prisma/client';
import { DateRange } from 'react-day-picker';

export interface Activity {
  id: string;
  type: ActivityType;
  documentTitle: string;
  userName: string;
  timestamp: string;
  status?: string;
}

export interface ActivityFilter {
  type?: ActivityType[];
  dateRange: DateRange | null;
  users?: string[];
  status?: string[];
}

export interface PaginatedActivities {
  activities: Activity[];
  totalPages: number;
  currentPage: number;
}