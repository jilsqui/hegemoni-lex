import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdminOrWriter = Boolean(session?.user?.email && ['ADMIN', 'WRITER'].includes((await prisma.user.findUnique({ where: { email: session.user.email } }))?.role || ''));

    const products = await prisma.merchandiseProduct.findMany({
      where: isAdminOrWriter ? {} : { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: { bookMetadata: true },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch merchandise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !['ADMIN', 'WRITER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const subtitle = String(body.subtitle || '').trim();
    const slug = String(body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();
    const price = body.price ?? 0;

    if (!title) {
      return NextResponse.json({ error: 'Judul produk wajib diisi.' }, { status: 400 });
    }

    const toIntOrNull = (value: unknown) => {
      const parsed = parseInt(String(value ?? ''), 10);
      return Number.isFinite(parsed) ? parsed : null;
    };

    // Pastikan slug unik (tambahkan suffix bila bentrok)
    let uniqueSlug = slug || 'produk';
    let suffix = 1;
    while (await prisma.merchandiseProduct.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${suffix++}`;
    }

    const product = await prisma.merchandiseProduct.create({
      data: {
        slug: uniqueSlug,
        title,
        subtitle: subtitle || null,
        price: new Prisma.Decimal(String(price)),
        currency: String(body.currency || 'IDR').toUpperCase(),
        imageUrl: body.imageUrl || null,
        category: String(body.category || 'Buku'),
        orderContact: body.orderContact || null,
        status: String(body.status || 'PUBLISHED') as any,
        isFeatured: Boolean(body.isFeatured),
        bookMetadata: body.bookMetadata
          ? {
              create: {
                author: body.bookMetadata.author || null,
                publisher: body.bookMetadata.publisher || null,
                isbn: body.bookMetadata.isbn || null,
                releaseYear: toIntOrNull(body.bookMetadata.releaseYear),
                synopsis: body.bookMetadata.synopsis || null,
                readingLevel: body.bookMetadata.readingLevel || null,
                format: body.bookMetadata.format || null,
                pages: toIntOrNull(body.bookMetadata.pages),
                dimensions: body.bookMetadata.dimensions || null,
                edition: body.bookMetadata.edition || null,
                language: body.bookMetadata.language || 'Indonesia',
                tags: Array.isArray(body.bookMetadata.tags) ? body.bookMetadata.tags : [],
              },
            }
          : undefined,
      },
      include: { bookMetadata: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create merchandise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
