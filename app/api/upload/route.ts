// ... existing code ...
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DocumentStatus } from "@/types/prisma";
import { Prisma, DocumentStatus as PrismaDocumentStatus } from '@prisma/client';
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized - Please login first" }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                },
            });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return new NextResponse(JSON.stringify({ error: "Forbidden - Only admins can upload documents" }), { 
                status: 403,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const title: string | null = data.get('title') as string;
        const description: string | null = data.get('description') as string;
        const status: string | null = data.get('status') as string; // Tambahkan ini

        if (!file || !title) {
            return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return new NextResponse(JSON.stringify({ error: "Format file tidak didukung. Hanya PDF, DOC, dan DOCX yang diperbolehkan." }), { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Create unique filename with timestamp and original name
        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, uniqueFilename);
        
        // Write file to disk
        await fs.writeFile(filePath, buffer);

        // Save document metadata to database with SUBMITTED status
        const document = await prisma.document.create({
            data: {
                title,
                description: description || '',
                filePath: `/uploads/${uniqueFilename}`,
                creatorId: session.user.id,
                status: status === 'DRAFTED' ? PrismaDocumentStatus.DRAFTED : PrismaDocumentStatus.SUBMITTED
            }
        });

        console.log('Document uploaded successfully:', {
            id: document.id,
            title: document.title,
            status: document.status,
            creator: session.user.email
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error in document upload:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return new NextResponse(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// ... existing code ...

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden - Only admins can edit documents" }, { status: 403 });
        }

        const formData = await request.formData();
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const file = formData.get("file") as File | null;

        if (!id || !title || !description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if document exists
        const existingDocument = await prisma.document.findUnique({ where: { id } });
        if (!existingDocument) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Check if document can be edited (only SUBMITTED documents can be edited)
        if (existingDocument.status !== PrismaDocumentStatus.SUBMITTED) {
            return NextResponse.json({ 
                error: "Only SUBMITTED documents can be edited" 
            }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {
            title,
            description
        };

        // Handle file upload if provided
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: "File terlalu besar. Maksimal 5MB." }, { status: 400 });
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: "Format file tidak didukung. Hanya PDF, DOC, dan DOCX yang diperbolehkan." }, { status: 400 });
            }

            // Delete old file if exists
            try {
                const oldFilePath = path.join(process.cwd(), 'public', existingDocument.filePath);
                await fs.unlink(oldFilePath);
            } catch (fileError) {
                console.error('Error deleting old file:', fileError);
                // Don't fail if old file deletion fails
            }

            // Save new file
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Ensure uploads directory exists
            const uploadsDir = path.join(process.cwd(), 'public/uploads');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            // Create unique filename with timestamp and original name
            const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = path.join(uploadsDir, uniqueFilename);
            
            // Write file to disk
            await fs.writeFile(filePath, buffer);

            // Update file path in database
            updateData.filePath = `/uploads/${uniqueFilename}`;
        }

        // Update document in database
        const updatedDocument = await prisma.document.update({
            where: { id },
            data: updateData
        });

        console.log('Document updated successfully:', {
            id: updatedDocument.id,
            title: updatedDocument.title,
            status: updatedDocument.status,
            updatedBy: session.user.email
        });

        return NextResponse.json(updatedDocument);
    } catch (error) {
        console.error('Error in document update:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// ... existing code ...

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden - Only admins can delete documents" }, { status: 403 });
        }

        // Get document ID from URL params
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        
        if (!id) {
            return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
        }

        // Find document first to get the file path
        const document = await prisma.document.findUnique({
            where: { id },
            include: { approvals: true }
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Delete approvals first (due to foreign key constraints)
        if (document.approvals.length > 0) {
            await prisma.approval.deleteMany({
                where: { documentId: id }
            });
        }

        // Delete document from database
        await prisma.document.delete({
            where: { id }
        });

        // Delete file from disk
        try {
            const filePath = path.join(process.cwd(), 'public', document.filePath);
            await fs.unlink(filePath);
        } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Don't fail if file deletion fails, just log it
        }

        return NextResponse.json({
            success: true, 
            message: "Document deleted successfully" 
        });
    } catch (error) {
        console.error('Error in document deletion:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}