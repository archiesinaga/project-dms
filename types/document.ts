import { User } from './user';
import { DocumentStatus } from '@prisma/client';

export interface DocumentVersion {
  id: string;
  version: number;
  changes: string;
  createdAt: Date;
  createdBy: User;
  filePath: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  status: DocumentStatus;
  version: number;
  fileType: string | null;
  fileSize: number | null;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
  creator: User;
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
}