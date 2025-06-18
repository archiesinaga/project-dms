'use client';

import { useSession } from "next-auth/react";
import { Role } from '@/types/prisma';

interface RoleCheck {
  isAdmin: boolean;
  isManager: boolean;
  isStandardization: boolean;
  canEditDocuments: boolean;
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  canApproveDocuments: boolean;
  canRejectDocuments: boolean;
  canViewDocuments: boolean;
  canManageUsers: boolean;
}

export function useRoleCheck(): RoleCheck {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | null;

  return {
    isAdmin: userRole === 'ADMIN',
    isManager: userRole === 'MANAGER',
    isStandardization: userRole === 'STANDARDIZATION',
    
    // Document permissions
    canEditDocuments: userRole === 'ADMIN',
    canUploadDocuments: userRole === 'ADMIN',
    canDeleteDocuments: userRole === 'ADMIN',
    canApproveDocuments: userRole === 'MANAGER' || userRole === 'STANDARDIZATION',
    canRejectDocuments: userRole === 'MANAGER' || userRole === 'STANDARDIZATION',
    canViewDocuments: userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'STANDARDIZATION',
    
    // System permissions
    canManageUsers: userRole === 'ADMIN',
  };
}