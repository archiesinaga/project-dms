export type Role = 'ADMIN' | 'MANAGER' | 'STANDARDIZATION';
export type DocumentStatus = 'DRAFTED' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

// Document interface
export interface Document {
  id: string;
  title: string;
  description: string;
  filePath: string;
  status: DocumentStatus;
  uploadedAt: Date;
  updatedAt: Date;
  creatorId: string;
  fileType?: string;
  fileSize?: number;
  version: number;
  creator?: {
    name: string | null;
    email: string;
  };
  approvals?: Approval[];
  revisions?: DocumentRevision[];
}

// Approval interface
export interface Approval {
  id: string;
  documentId: string;
  approverId: string;
  status: DocumentStatus;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  approver?: {
    name: string | null;
    email: string;
  };
}

// Document Revision interface
export interface DocumentRevision {
  id: string;
  documentId: string;
  editorId: string;
  version: number;
  oldFilePath?: string;
  newFilePath: string;
  comment?: string;
  createdAt: Date;
  editor?: {
    name: string | null;
    email: string;
  };
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  relatedId?: string;
  createdAt: Date;
  read: boolean;
}

// Filter options interface
export interface DocumentFilters {
  status?: DocumentStatus;
  creatorId?: string;
  dateFrom?: string;
  dateTo?: string;
  fileType?: string;
  search?: string;
}

// Sort options interface
export interface DocumentSort {
  field: 'title' | 'status' | 'uploadedAt' | 'creator' | 'fileType';
  direction: 'asc' | 'desc';
}