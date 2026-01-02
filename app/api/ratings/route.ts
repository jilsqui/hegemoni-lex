// app/api/ratings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. GET: Ambil Data Rating (Rata-rata, Jumlah, & Punya User)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  const userEmail = searchParams.get('userEmail'); // Bisa null jika user belum login

  if (!articleId) {
    return NextResponse.json({ average: 0, count: 0, userRating: 0 });
  }

  try {
    // A. Hitung Rata-rata & Total Suara dari SEMUA user
    const aggregations = await prisma.rating.aggregate({
      _avg: { value: true },
      _count: { value: true },
      where: { articleId: articleId }
    });

    const average = aggregations._avg.value ? parseFloat(aggregations._avg.value.toFixed(1)) : 0;
    const count = aggregations._count.value || 0;

    // B. Cek Rating User yang sedang login (jika ada)
    let userRating = 0;
    if (userEmail) {
       const user = await prisma.user.findUnique({ where: { email: userEmail } });
       if (user) {
         const myRating = await prisma.rating.findUnique({
            where: {
                userId_articleId: { userId: user.id, articleId: articleId }
            }
         });
         if (myRating) userRating = myRating.value;
       }
    }

    return NextResponse.json({ average, count, userRating });

  } catch (error) {
    return NextResponse.json({ average: 0, count: 0, userRating: 0 });
  }
}

// 2. POST: Simpan Rating User
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, userEmail, value } = body;

    if (!articleId || !userEmail || !value) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    // Simpan/Update Rating User
    await prisma.rating.upsert({
      where: {
        userId_articleId: { userId: user.id, articleId: articleId }
      },
      update: { value: value },
      create: { value: value, userId: user.id, articleId: articleId }
    });

    // --- HITUNG ULANG RATA-RATA SETELAH UPDATE ---
    const aggregations = await prisma.rating.aggregate({
        _avg: { value: true },
        _count: { value: true },
        where: { articleId: articleId }
    });

    const newAverage = aggregations._avg.value ? parseFloat(aggregations._avg.value.toFixed(1)) : 0;
    const newCount = aggregations._count.value || 0;

    return NextResponse.json({ 
        message: "Berhasil", 
        average: newAverage, 
        count: newCount 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan rating" }, { status: 500 });
  }
}