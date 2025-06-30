import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, DocumentStatus } from "@prisma/client";

interface ApprovalRequest {
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authorization Check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (userRole !== Role.MANAGER && userRole !== Role.STANDARDIZATION) {
      return NextResponse.json({ 
        error: "Only Manager and Standardization roles can process documents" 
      }, { status: 403 });
    }

    // Get request data
    const { status, comment }: ApprovalRequest = await request.json();
    const documentId = params.id;

    // Fetch document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { 
        approvals: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Validate document status flow
    const currentStatus = document.status;
    let newStatus: DocumentStatus;

    if (userRole === Role.MANAGER) {
      if (currentStatus !== DocumentStatus.SUBMITTED) {
        return NextResponse.json({ 
          error: "Manager can only process SUBMITTED documents" 
        }, { status: 400 });
      }
      newStatus = status === 'APPROVED' ? DocumentStatus.PENDING : DocumentStatus.REJECTED;
    } else {
      if (currentStatus !== DocumentStatus.PENDING) {
        return NextResponse.json({ 
          error: "Standardization can only process PENDING documents" 
        }, { status: 400 });
      }
      newStatus = status === 'APPROVED' ? DocumentStatus.APPROVED : DocumentStatus.REJECTED;
    }

    // Create approval record and update document status
    const [approval] = await prisma.$transaction([
      prisma.approval.create({
        data: {
          status: newStatus,
          comment,
          documentId,
          approverId: session.user.id
        }
      }),
      prisma.document.update({
        where: { id: documentId },
        data: { status: newStatus }
      }),
      prisma.notification.create({
        data: {
          userId: document.creatorId,
          message: `Your document "${document.title}" has been ${status.toLowerCase()}`,
          type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          relatedId: documentId
        }
      }),
      prisma.userActivity.create({
        data: {
          userId: session.user.id,
          type: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
          description: `${status.toLowerCase()} document: ${document.title}`
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: `Document ${status.toLowerCase()} successfully`,
      approval
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}