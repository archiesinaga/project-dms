import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

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

    // Baca file dari sistem
    const filePath = path.join(process.cwd(), 'public', document.filePath);
    const fileBuffer = await fs.readFile(filePath);

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', document.fileType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${document.title}"`);

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}