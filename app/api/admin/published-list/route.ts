import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true, email: true } } },
    // Include viewCount, isFeatured, isArchived for admin dashboard
  });
  return NextResponse.json(articles);
}