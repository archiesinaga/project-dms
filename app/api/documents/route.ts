import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const uploader = searchParams.get('uploader');
        const date = searchParams.get('date');
        const fileType = searchParams.get('fileType');

        // Build where clause
        const where: any = {};

        if (status) {
            where.status = status;
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
            where.uploadedAt = {
                gte: new Date(date),
                lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
            };
        }

        if (fileType) {
            where.fileType = fileType;
        }

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
                    include: {
                        approver: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                },
                revisions:{
                    orderBy: {
                        createdAt: 'desc',
                    }
                }
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}