// app/api/admin/set-featured/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    // KEAMANAN: Cek apakah user adalah ADMIN
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin." }, { status: 403 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: "ID Artikel diperlukan" }, { status: 400 });
    }

    // Gunakan Transaction agar aman (Database Operation)
    await prisma.$transaction([
      // 1. Reset: Ubah semua artikel menjadi isFeatured = false
      prisma.article.updateMany({
        data: { isFeatured: false }
      }),
      // 2. Set Baru: Ubah artikel yang dipilih menjadi isFeatured = true
      prisma.article.update({
        where: { id: articleId },
        data: { isFeatured: true }
      })
    ]);

    return NextResponse.json({ message: "Fokus Utama berhasil diperbarui" });

  } catch (error) {
    console.error("Error setting featured:", error);
    return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
  }
}