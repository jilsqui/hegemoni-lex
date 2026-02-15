// app/api/admin/archive/route.ts
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
    const { articleId, isArchived } = body;

    if (!articleId || typeof isArchived !== 'boolean') {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { isArchived }
    });

    return NextResponse.json({ 
      message: isArchived ? "Artikel diarsipkan" : "Artikel dipulihkan dari arsip", 
      data: updatedArticle 
    });

  } catch (error) {
    console.error("Error archive:", error);
    return NextResponse.json({ error: "Gagal mengarsipkan artikel" }, { status: 500 });
  }
}
