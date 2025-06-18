import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get document statistics
    const [
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({ where: { status: 'PENDING' } }),
      prisma.document.count({ where: { status: 'APPROVED' } }),
      prisma.document.count({ where: { status: 'REJECTED' } })
    ]);

    return NextResponse.json({
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}