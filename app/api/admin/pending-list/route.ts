// app/api/admin/pending-list/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Agar data selalu fresh (tidak dicache browser)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    // Ambil semua artikel yg statusnya PENDING
    const pendingArticles = await prisma.article.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        author: {
          select: { name: true, email: true } // Sertakan nama penulis
        }
      },
      orderBy: {
        createdAt: 'desc' // Yang paling baru di atas
      }
    });

    return NextResponse.json(pendingArticles);

  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}