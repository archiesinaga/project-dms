import { prisma } from '@/lib/prisma';
import { AuditActivity, AuditFilter } from '@/types';
import { getClientIP, getUserAgent } from '@/lib/utils/request';

const buildAuditFilter = (filters: AuditFilter) => {
  const where: any = {};
  
  if (filters.startDate && filters.endDate) {
    where.timestamp = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }
  
  if (filters.userId) {
    where.userId = filters.userId;
  }
  
  if (filters.action?.length) {
    where.action = { in: filters.action };
  }
  
  if (filters.resourceType?.length) {
    where.resourceType = { in: filters.resourceType };
  }
  
  return where;
};

export const auditService = {
  logActivity: async (activity: AuditActivity) => {
    await prisma.auditLog.create({
      data: {
        ...activity,
        ip: getClientIP(),
        userAgent: getUserAgent(),
        timestamp: new Date()
      }
    });
  },

  getAuditTrail: async (filters: AuditFilter) => {
    return prisma.auditLog.findMany({
      where: buildAuditFilter(filters),
      include: {
        user: true,
        document: true
      },
      orderBy: { timestamp: 'desc' }
    });
  }
};