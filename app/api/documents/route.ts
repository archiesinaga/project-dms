import { jsonResponse } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma, DocumentStatus, Role } from "@prisma/client";

// Define type untuk response document dengan tipe yang lebih spesifik
interface DocumentResponse {
  id: string;
  title: string;
  description: string | null;  // Ubah ke nullable
  fileType: string | null;
  fileSize: number | null;
  filePath: string;  // Add filePath
  status: DocumentStatus;
  uploadedAt: Date;
  updatedAt: Date;
  version: number;
  creator: {
    name: string | null;
    email: string;
  };
  approvals: Array<{
    id: string;
    status: DocumentStatus;
    createdAt: Date;
    approver: {
      name: string | null;
      email: string;
      role: Role;
    };
  }>;
  revisions: Array<{
    version: number;
    createdAt: Date;
  }>;
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as DocumentStatus | null;
        const uploader = searchParams.get('uploader');
        const date = searchParams.get('date');
        const fileType = searchParams.get('fileType');
        const approvedByStandardization = searchParams.get('approvedByStandardization') === 'true';

        // Build where clause dengan tipe yang benar
        const where: Prisma.DocumentWhereInput = {};

        if (status) {
            where.status = status;

            if (status === DocumentStatus.APPROVED && approvedByStandardization) {
                where.approvals = {
                    some: {
                        status: DocumentStatus.APPROVED,
                        approver: {
                            role: Role.STANDARDIZATION
                        }
                    }
                };
            }
        }

        if (uploader) {
            where.creator = {
                OR: [
                    { name: { contains: uploader, mode: 'insensitive' } },
                    { email: { contains: uploader, mode: 'insensitive' } },
                ],
            };
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            where.uploadedAt = {
                gte: startDate,
                lt: endDate
            };
        }

        if (fileType) {
            where.fileType = fileType;
        }

        // Query configuration dengan tipe yang benar
        const documents = await prisma.document.findMany({
            where,
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                approvals: {
                    where: approvedByStandardization ? {
                        status: DocumentStatus.APPROVED,
                        approver: {
                            role: Role.STANDARDIZATION
                        }
                    } : undefined,
                    include: {
                        approver: {
                            select: {
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    ...(approvedByStandardization ? { take: 1 } : {})
                },
                revisions: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        version: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                [approvedByStandardization ? 'updatedAt' : 'uploadedAt']: 'desc' as const,
            },
        });

        // Transform documents dengan tipe yang tepat
        const transformedDocuments: DocumentResponse[] = documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            filePath: doc.filePath,
            status: doc.status,
            uploadedAt: doc.uploadedAt,
            updatedAt: doc.updatedAt,
            version: doc.version,
            creator: {
                name: doc.creator.name,
                email: doc.creator.email,
            },
            approvals: doc.approvals.map(approval => ({
                id: approval.id,
                status: approval.status,
                createdAt: approval.createdAt,
                approver: {
                    name: approval.approver.name,
                    email: approval.approver.email,
                    role: approval.approver.role,
                }
            })),
            revisions: doc.revisions.map(rev => ({
                version: rev.version,
                createdAt: rev.createdAt,
            }))
        }));

        return jsonResponse(transformedDocuments);
    } catch (error) {
        console.error('Error fetching documents:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return jsonResponse({ error: errorMessage }, 500);
    }
}