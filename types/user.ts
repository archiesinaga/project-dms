import { Role } from '@prisma/client';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}