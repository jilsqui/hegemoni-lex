// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Cek Login
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Ambil Data
    const body = await request.json();
    const { title, content, category, image, status } = body; // Kita terima status dari frontend (opsional)

    const slug = title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '') + '-' + Date.now();

    // 3. LOGIKA STATUS (PENTING!)
    // Jika tombol yang ditekan adalah "Simpan Draft", maka status = DRAFT
    // Jika tombol "Terbitkan", maka status = PENDING (Bukan Published)
    
    let articleStatus = 'PENDING'; // Defaultnya Pending Review
    if (status === 'DRAFT') {
        articleStatus = 'DRAFT';
    }

    // 4. SIMPAN KE DATABASE
    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        category,
        image,
        
        // PERBAIKAN DISINI:
        status: articleStatus as any, // PENDING atau DRAFT
        
        // publishedAt JANGAN DIISI DULU (Nanti diisi Admin saat approve)
        publishedAt: null, 
        
        authorId: user.id,
      },
    });

    return NextResponse.json(newArticle);

  } catch (error) {
    console.error("Gagal menyimpan artikel:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}