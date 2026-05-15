import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`visitors-track:${ip}`, 90, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak request. Coba lagi nanti.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) },
        }
      );
    }

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan visitor.' }, { status: 500 });
  }
}
