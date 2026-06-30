import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

async function requireAdminOrWriter() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !['ADMIN', 'WRITER'].includes(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null };
  }

  return { error: null, user };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminOrWriter();
    if (error) return error;

    const { id } = await params;
    const product = await prisma.merchandiseProduct.findUnique({
      where: { id },
      include: { bookMetadata: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch merchandise product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminOrWriter();
    if (error) return error;

    const { id } = await params;
    const existing = await prisma.merchandiseProduct.findUnique({ where: { id }, include: { bookMetadata: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const subtitle = String(body.subtitle || '').trim();
    const price = body.price ?? existing.price;

    if (!title) {
      return NextResponse.json({ error: 'Judul produk wajib diisi.' }, { status: 400 });
    }

    const toIntOrNull = (value: unknown) => {
      const parsed = parseInt(String(value ?? ''), 10);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const bookData = {
      author: body.bookMetadata?.author || null,
      publisher: body.bookMetadata?.publisher || null,
      isbn: body.bookMetadata?.isbn || null,
      releaseYear: toIntOrNull(body.bookMetadata?.releaseYear),
      synopsis: body.bookMetadata?.synopsis || null,
      readingLevel: body.bookMetadata?.readingLevel || null,
      format: body.bookMetadata?.format || null,
      pages: toIntOrNull(body.bookMetadata?.pages),
      dimensions: body.bookMetadata?.dimensions || null,
      edition: body.bookMetadata?.edition || null,
      language: body.bookMetadata?.language || 'Indonesia',
      tags: Array.isArray(body.bookMetadata?.tags) ? body.bookMetadata.tags : [],
    };

    const product = await prisma.merchandiseProduct.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        price: new Prisma.Decimal(String(price)),
        currency: String(body.currency || existing.currency || 'IDR').toUpperCase(),
        imageUrl: body.imageUrl || existing.imageUrl || null,
        category: String(body.category || existing.category || 'Buku'),
        orderContact: body.orderContact ?? existing.orderContact ?? null,
        status: String(body.status || existing.status || 'PUBLISHED') as any,
        isFeatured: Boolean(body.isFeatured ?? existing.isFeatured),
        bookMetadata: {
          upsert: {
            create: bookData,
            update: bookData,
          },
        },
      },
      include: { bookMetadata: true },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Failed to update merchandise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdminOrWriter();
    if (error) return error;

    const { id } = await params;
    const existing = await prisma.merchandiseProduct.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    await prisma.merchandiseProduct.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete merchandise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
