import { jsonResponse } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma, DocumentStatus as PrismaDocumentStatus, Role } from '@prisma/client';
import fs from "fs/promises";
import path from "path";

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript'
] as const;

interface UploadRequest {
  file: File;
  title: string;
  description?: string;
  status?: string;
}

export async function POST(request: Request) {
  let uploadedFilePath: string | null = null;

  try {
    // 1. Session Validation
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // 2. Role Validation
    if (session.user.role !== Role.ADMIN) {
      return jsonResponse({ error: "Forbidden - Only admins can upload documents" }, 403);
    }

    // 3. Form Data Validation
    const data = await request.formData();
    const file = data.get('file') as File | null;
    const title = data.get('title') as string | null;
    const description = data.get('description') as string | null;
    const status = data.get('status') as string | null;

    if (!file || !title) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // 4. File Validation
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      return jsonResponse({ 
        error: "Unsupported file type. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images (JPEG, PNG, GIF, WebP), and Text files." 
      }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ 
        error: "File too large. Maximum size is 10MB." 
      }, 400);
    }

    // 5. File Processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Create unique filename with better sanitization
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}-${sanitizedName}`;
    uploadedFilePath = path.join(uploadsDir, uniqueFilename);
    
    // Write file to disk
    await fs.writeFile(uploadedFilePath, buffer);

    // 6. Database Operation with transaction
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title,
          description: description || '',
          filePath: `/uploads/${uniqueFilename}`,
          fileType: file.type,
          fileSize: file.size,
          creatorId: session.user.id,
          status: status === 'DRAFTED' ? PrismaDocumentStatus.DRAFTED : PrismaDocumentStatus.SUBMITTED
        }
      });

      // Log activity
      await tx.userActivity.create({
        data: {
          userId: session.user.id,
          type: 'UPLOAD',
          description: `Uploaded document: ${doc.title}`
        }
      });

      return doc;
    });

    return jsonResponse({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        filePath: document.filePath
      }
    });

  } catch (error) {
    // Cleanup uploaded file if exists
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error('Failed to cleanup uploaded file:', unlinkError);
      }
    }

    console.error('Error in document upload:', error);
    return jsonResponse({ 
      error: "Failed to upload document. Please try again." 
    }, 500);
  }
}