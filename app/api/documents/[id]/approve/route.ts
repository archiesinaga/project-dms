import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DocumentStatus } from "@/types/prisma";

// ... existing code ...
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, comment } = await request.json();
    const documentId = params.id;

    console.log('Approval request:', {
      documentId,
      userRole: session.user.role,
      requestedStatus: status,
      comment
    });

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { approvals: true }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    console.log('Current document status:', document.status);

    let newDocumentStatus: DocumentStatus = document.status;

    // Determine new status based on approver role, current status, and requested action
    if (session.user.role === 'MANAGER') {
      if (document.status === 'SUBMITTED') {
        if (status === 'APPROVED') {
          newDocumentStatus = 'PENDING';
          console.log('Manager approving SUBMITTED document -> PENDING');
        } else if (status === 'REJECTED') {
          newDocumentStatus = 'REJECTED';
          console.log('Manager rejecting SUBMITTED document -> REJECTED');
        }
      } else {
        return NextResponse.json({ 
          error: "Manager can only approve/reject SUBMITTED documents" 
        }, { status: 400 });
      }
    } else if (session.user.role === 'STANDARDIZATION') {
      if (document.status === 'PENDING') {
        if (status === 'APPROVED') {
          newDocumentStatus = 'APPROVED';
          console.log('Standardization approving PENDING document -> APPROVED');
        } else if (status === 'REJECTED') {
          newDocumentStatus = 'REJECTED';
          console.log('Standardization rejecting PENDING document -> REJECTED');
        }
      } else {
        return NextResponse.json({ 
          error: "Standardization can only approve/reject PENDING documents" 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: "Only Manager and Standardization can approve/reject documents" 
      }, { status: 403 });
    }

    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        documentId,
        approverId: session.user.id,
        status: newDocumentStatus,
        comment: comment || null
      }
    });

    console.log('Approval record created:', approval.id);

    // Update document status
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { status: newDocumentStatus }
    });

    // Create notification for document creator
    await prisma.notification.create({
      data: {
        userId: document.creatorId,
        message: `Document "${document.title}" has been ${newDocumentStatus.toLowerCase()} by ${session.user.name || session.user.email}`,
        type: newDocumentStatus === 'REJECTED' ? 'ERROR' : newDocumentStatus === 'APPROVED' ? 'SUCCESS' : 'INFO',
        relatedId: documentId
      }
    });

    console.log('Document status updated to:', updatedDocument.status);

    return NextResponse.json({
      document: updatedDocument,
      approval: approval,
      message: `Document ${updatedDocument.status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Approval error:', error);
    const errorMessage = error instanceof Error ? error.message : "Approval failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}