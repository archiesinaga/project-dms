import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cek role user
    if (!['ADMIN', 'MANAGER', 'STANDARDIZATION'].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Pastikan filePath dimulai dengan '/'
    let viewUrl = document.filePath;
    if (!viewUrl.startsWith('/')) {
      viewUrl = '/' + viewUrl;
    }

    // Validasi tipe file yang diizinkan untuk preview
    const allowedViewTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedViewTypes.includes(document.fileType || '')) {
      return NextResponse.json({ 
        error: "File type not supported for preview. Supported formats: PDF, Images, Text files, and Office documents." 
      }, { status: 400 });
    }

    // Check if file actually exists
    try {
      const filePath = path.join(process.cwd(), 'public', viewUrl);
      await fs.access(filePath);
    } catch (fileError) {
      console.error('File not found:', viewUrl, fileError);
      return NextResponse.json({ 
        error: "File not found. The document may have been moved or deleted." 
      }, { status: 404 });
    }

    // Return URL untuk view dokumen
    return NextResponse.json({
      success: true,
      viewUrl: viewUrl,
      fileType: document.fileType
    });
  } catch (error) {
    console.error('Error viewing document:', error);
    return NextResponse.json(
      { error: "Failed to view document" },
      { status: 500 }
    );
  }
}