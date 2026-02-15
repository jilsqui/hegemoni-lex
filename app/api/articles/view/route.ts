// app/api/articles/view/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: "ID Artikel diperlukan" }, { status: 400 });
    }

    // Increment view count
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { 
        viewCount: { increment: 1 }
      },
      select: { viewCount: true }
    });

    return NextResponse.json({ viewCount: updatedArticle.viewCount });

  } catch (error) {
    console.error("Error incrementing view:", error);
    return NextResponse.json({ error: "Gagal update view count" }, { status: 500 });
  }
}
