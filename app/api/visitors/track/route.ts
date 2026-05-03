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
