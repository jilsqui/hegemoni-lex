import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const clientFingerprint = typeof body?.fingerprint === 'string' ? body.fingerprint : '';
    const userAgent = request.headers.get('user-agent') || '';

    if (!clientFingerprint) {
      return NextResponse.json({ error: 'Fingerprint wajib diisi.' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(clientFingerprint).digest('hex');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // 🚀 OPTIMIZED: Only check if visitor already tracked today (avoid duplicate)
    const existing = await prisma.visitor.findFirst({
      where: {
        fingerprint: hash,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      await prisma.visitor.create({
        data: {
          fingerprint: hash,
          userAgent: userAgent.slice(0, 500),
        },
      });
    }

    // Cache response: 60 seconds (visitor tracking doesn't need to be instant)
    const response = NextResponse.json({ ok: true });
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan visitor.' }, { status: 500 });
  }
}
