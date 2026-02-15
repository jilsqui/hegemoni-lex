// app/api/admin/approve/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    // 1. Cek Security: Harus Login & Harus ADMIN
    const session = await getServerSession(authOptions);
    
    // Cek login via email user
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Hanya Admin yang boleh akses" }, { status: 403 });
    }

    // 2. Terima Data dari Frontend
    const body = await request.json();
    const { articleId, action } = body; // action bisa 'APPROVE' atau 'REJECT'

    if (!articleId || !action) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 3. Logika Update Database
    let updateData = {};

    if (action === 'APPROVE') {
        updateData = {
            status: 'PUBLISHED',
            publishedAt: new Date(), // Set tanggal terbit SEKARANG
        };
    } else if (action === 'REJECT') {
        updateData = {
            status: 'REJECTED',
            publishedAt: null,
        };
    }

    const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: updateData,
    });

    return NextResponse.json({ message: "Sukses", data: updatedArticle });

  } catch (error) {
    console.error("Error approval:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}