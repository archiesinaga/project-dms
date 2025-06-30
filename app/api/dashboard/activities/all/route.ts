import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Fetch activities with pagination
    const activities = await prisma.$transaction(async (tx) => {
      const [uploads, approvals] = await Promise.all([
        tx.document.findMany({
          select: {
            id: true,
            title: true,
            status: true,
            uploadedAt: true,
            creator: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
          skip,
          take: limit,
        }),
        tx.approval.findMany({
          select: {
            id: true,
            status: true,
            createdAt: true,
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
          skip,
          take: limit,
        }),
      ]);

      // Get total counts
      const [totalUploads, totalApprovals] = await Promise.all([
        tx.document.count(),
        tx.approval.count(),
      ]);

      // Format activities
      const formattedActivities = [
        ...uploads.map(doc => ({
          id: `upload-${doc.id}`,
          type: 'upload' as const,
          documentTitle: doc.title,
          userName: doc.creator.name || doc.creator.email,
          timestamp: doc.uploadedAt,
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

      return {
        activities: formattedActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        totalPages: Math.ceil((totalUploads + totalApprovals) / limit),
        currentPage: page,
      };
    });

    return jsonResponse(activities);
  } catch (error) {
    console.error('Error fetching all activities:', error);
    return jsonResponse(
      { error: 'Internal server error' }, 
      500
    );
  }
}