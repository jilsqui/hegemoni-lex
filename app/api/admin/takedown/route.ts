// app/api/admin/takedown/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin." }, { status: 403 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: "ID Artikel diperlukan" }, { status: 400 });
    }

    // Takedown: ubah status dari PUBLISHED menjadi REJECTED (takedown)
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { 
        status: 'REJECTED',
        isFeatured: false, // Pastikan tidak featured lagi
      }
    });

    return NextResponse.json({ message: "Artikel berhasil di-takedown", data: updatedArticle });

  } catch (error) {
    console.error("Error takedown:", error);
    return NextResponse.json({ error: "Gagal takedown artikel" }, { status: 500 });
  }
}
