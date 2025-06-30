import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { jsonResponse } from "@/lib/utils";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

    // Fetch recent activities by combining document creations, approvals, and updates
    const activities = await prisma.$transaction(async (tx) => {
      // Get recent document uploads
      const uploads = await tx.document.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          uploadedAt: true,  // Mengubah createdAt menjadi uploadedAt
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          uploadedAt: 'desc',  // Mengubah createdAt menjadi uploadedAt
        },
        take: 20,
      });

      // Get recent approvals
      const approvals = await tx.approval.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,  // Ini tetap createdAt karena untuk model Approval
          document: {
            select: {
              title: true,
            },
          },
          approver: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      // Format activities
      const formattedActivities = [
        ...uploads.map(doc => ({
          id: `upload-${doc.id}`,
          type: 'upload' as const,
          documentTitle: doc.title,
          userName: doc.creator.name || doc.creator.email,
          timestamp: doc.uploadedAt,  // Mengubah createdAt menjadi uploadedAt
          status: doc.status,
        })),
        ...approvals.map(approval => ({
          id: `approval-${approval.id}`,
          type: approval.status === 'APPROVED' ? 'approve' as const : 'reject' as const,
          documentTitle: approval.document.title,
          userName: approval.approver.name || approval.approver.email,
          timestamp: approval.createdAt,
          status: approval.status,
        })),
      ];

      // Sort by timestamp descending and limit to 50 most recent activities
      return formattedActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50);
    });

    return jsonResponse(activities);
} catch (error) {
  console.error('Error fetching activities:', error);
  return jsonResponse(
    { error: 'Internal server error' }, 
    500
  );
}
}