import { Role, DocumentStatus } from "@prisma/client";
import { DateRange } from "react-day-picker";

// Activity Types

export type ActivityType = 'upload' | 'approve' | 'reject' | 'edit' | 'comment';
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Activity Interfaces
export interface Activity {
  id: string;
  type: ActivityType;
  documentTitle: string;
  userName: string;
  timestamp: string;
  status?: string;
}

export interface PaginatedActivities {
  activities: Activity[];
  totalPages: number;
  currentPage: number;
}

export interface ActivityFilter {
    type?: ActivityType[];
    dateRange: DateRange | null;  // Update this to use DateRange
    users?: string[];
    status?: string[];
  }

// Audit Interfaces
export interface AuditActivity {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string[];
  resourceType?: string[];
}

// Document Interfaces
export interface DocumentSearchParams {
  fullText: string;
  metadata: Record<string, any>;
  dateRange: DateRange | null;
  tags: string[];
  departments: string[];
  status: DocumentStatus[];
}

// Workflow Interfaces
export interface WorkflowStep {
  id: string;
  role: Role;
  order: number;
  action: 'REVIEW' | 'APPROVE' | 'SIGN';
  deadline?: number;
}

export * from './user';
export * from './document';
export * from './activity';
export * from './workflow';

// Re-export enums from Prisma
export { Role, DocumentStatus, NotificationType, ActivityType } from '@prisma/client';
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
