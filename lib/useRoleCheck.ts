'use client';

import { useSession } from "next-auth/react";
import { Role } from '@prisma/client';

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
  const userRole = session?.user?.role as Role;

  return {
    isAdmin: userRole === Role.ADMIN,
    isManager: userRole === Role.MANAGER,
    isStandardization: userRole === Role.STANDARDIZATION,
    canEditDocuments: userRole === Role.ADMIN,
    canUploadDocuments: userRole === Role.ADMIN,
    canDeleteDocuments: userRole === Role.ADMIN,
    canApproveDocuments: userRole === Role.MANAGER || userRole === Role.STANDARDIZATION,
    canRejectDocuments: userRole === Role.MANAGER || userRole === Role.STANDARDIZATION,
    canViewDocuments: true, // All authenticated users can view documents
    canManageUsers: userRole === Role.ADMIN,
  };
}