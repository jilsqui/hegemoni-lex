import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { markdownLikeToHtml, parseReferencesInput } from '@/lib/articleFormatting';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthorizedUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return null;
  }

  return prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthorizedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId: user.id,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        image: true,
        imageSourceUrl: true,
        imageCopyright: true,
        references: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('GET article by id error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthorizedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.article.findFirst({
      where: {
        id,
        authorId: user.id,
        isArchived: false,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';

    let title = '';
    let content = '';
    let category = '';
    let image = existing.image || '';
    let status = 'DRAFT';
    let imageSourceUrl = '';
    let imageCopyright = '';
    let referencesText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || '';
      content = (formData.get('content') as string) || '';
      category = (formData.get('category') as string) || '';
      status = ((formData.get('status') as string) || 'DRAFT').toUpperCase();
      image = ((formData.get('imageUrl') as string) || '').trim() || image;
      imageSourceUrl = ((formData.get('imageSourceUrl') as string) || '').trim();
      imageCopyright = ((formData.get('imageCopyright') as string) || '').trim();
      referencesText = ((formData.get('references') as string) || '').trim();

      const imageFile = formData.get('imageFile') as File | null;
      if (imageFile && imageFile.size > 0) {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(imageFile.type)) {
          return NextResponse.json({ error: 'Format gambar harus JPG, PNG, atau WEBP.' }, { status: 400 });
        }

        const safeName = imageFile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const fileName = `articles/${Date.now()}-${safeName || 'cover.jpg'}`;

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, buffer, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Article image upload error:', uploadError);
          return NextResponse.json({ error: `Upload gambar gagal: ${uploadError.message}` }, { status: 500 });
        }

        const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
        image = data.publicUrl;
      }
    } else {
      const body = await request.json();
      title = body.title || '';
      content = body.content || '';
      category = body.category || '';
      image = (body.image || '').trim() || image;
      status = (body.status || 'DRAFT').toUpperCase();
      imageSourceUrl = (body.imageSourceUrl || '').trim();
      imageCopyright = (body.imageCopyright || '').trim();
      referencesText = (body.references || '').trim();
    }

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Judul, isi, dan kategori wajib diisi.' }, { status: 400 });
    }

    const references = parseReferencesInput(referencesText);
    const sanitizedContent = markdownLikeToHtml(content);

    const nextStatus: ArticleStatus = status === 'PENDING' ? 'PENDING' : 'DRAFT';

    const updated = await prisma.article.update({
      where: { id: existing.id },
      data: {
        title,
        content: sanitizedContent,
        category,
        image,
        imageSourceUrl: imageSourceUrl || null,
        imageCopyright: imageCopyright || null,
        references: references.length > 0 ? references : [],
        status: nextStatus,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT article by id error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
