import { Role } from '@prisma/client';

export interface WorkflowStep {
  id: string;
  role: Role; // Using Role from Prisma instead of UserRole
  order: number;
  action: 'REVIEW' | 'APPROVE' | 'SIGN';
  deadline?: number; // hours
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}