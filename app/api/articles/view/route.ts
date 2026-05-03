// app/api/articles/view/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, fingerprint } = body;

    if (!articleId) {
      return NextResponse.json({ error: "ID Artikel diperlukan" }, { status: 400 });
    }

    const rawFingerprint = typeof fingerprint === 'string' ? fingerprint : '';
    const fingerprintHash = rawFingerprint
      ? crypto.createHash('sha256').update(rawFingerprint).digest('hex')
      : '';

    const viewDate = new Date();
    viewDate.setHours(0, 0, 0, 0);

    // Jika fingerprint tidak tersedia, tetap increment seperti fallback lama.
    if (!fingerprintHash) {
      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: {
          viewCount: { increment: 1 },
        },
        select: { viewCount: true },
      });

      return NextResponse.json({ viewCount: updatedArticle.viewCount, counted: true });
    }

    const existing = await prisma.articleView.findUnique({
      where: {
        articleId_fingerprint_viewDate: {
          articleId,
          fingerprint: fingerprintHash,
          viewDate,
        },
      },
      select: { id: true },
    });

    if (existing) {
      const currentArticle = await prisma.article.findUnique({
        where: { id: articleId },
        select: { viewCount: true },
      });

      return NextResponse.json({ viewCount: currentArticle?.viewCount || 0, counted: false });
    }

    const [, updatedArticle] = await prisma.$transaction([
      prisma.articleView.create({
        data: {
          articleId,
          fingerprint: fingerprintHash,
          viewDate,
        },
      }),
      prisma.article.update({
        where: { id: articleId },
        data: {
          viewCount: { increment: 1 },
        },
        select: { viewCount: true },
      }),
    ]);

    return NextResponse.json({ viewCount: updatedArticle.viewCount, counted: true });

  } catch (error: any) {
    // Jika race condition unique constraint terjadi, anggap request duplikat harian.
    if (error?.code === 'P2002') {
      return NextResponse.json({ counted: false });
    }

    console.error("Error incrementing view:", error);
    return NextResponse.json({ error: "Gagal update view count" }, { status: 500 });
  }
}
