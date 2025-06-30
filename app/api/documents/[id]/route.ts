import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authorization Check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hanya admin yang bisa menghapus dokumen
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Only administrators can delete documents" }, { status: 403 });
    }

    // Cari dokumen
    const document = await prisma.document.findUnique({
      where: { id: params.id }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Hapus file fisik
    if (document.filePath) {
      const filePath = path.join(process.cwd(), 'public', document.filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Lanjutkan proses meskipun file tidak dapat dihapus
      }
    }

    // Hapus dokumen dari database menggunakan transaction
    await prisma.$transaction(async (tx) => {
      // Hapus semua approvals terkait
      await tx.approval.deleteMany({
        where: { documentId: params.id }
      });

      // Hapus semua revisions terkait
      await tx.documentRevision.deleteMany({
        where: { documentId: params.id }
      });

      // Hapus notifikasi terkait
      await tx.notification.deleteMany({
        where: { relatedId: params.id }
      });

      // Terakhir hapus dokumen
      await tx.document.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: "Document deleted successfully" 
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}