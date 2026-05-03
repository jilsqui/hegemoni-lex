import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parseReferencesInput } from '@/lib/articleFormatting';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ id: string }> };

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET(_request: Request, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });

  if (!article) {
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { id } = await params;
  const contentType = request.headers.get('content-type') || '';

  let title = '';
  let content = '';
  let category = '';
  let image = '';
  let imageSourceUrl = '';
  let imageCopyright = '';
  let referencesText = '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    title = ((formData.get('title') as string) || '').trim();
    content = ((formData.get('content') as string) || '').trim();
    category = ((formData.get('category') as string) || '').trim();
    image = ((formData.get('imageUrl') as string) || '').trim();
    imageSourceUrl = ((formData.get('imageSourceUrl') as string) || '').trim();
    imageCopyright = ((formData.get('imageCopyright') as string) || '').trim();
    referencesText = ((formData.get('references') as string) || '').trim();

    const imageFile = formData.get('imageFile') as File | null;
    if (imageFile && imageFile.size > 0) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Format gambar harus JPG, PNG, atau WEBP.' }, { status: 400 });
      }

      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = imageFile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const fileName = `articles/${Date.now()}-${safeName || `cover.${ext}`}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Upload gambar gagal: ${uploadError.message}` }, { status: 500 });
      }

      const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
      image = data.publicUrl;
    }
  } else {
    const body = await request.json();
    title = (body.title || '').trim();
    content = (body.content || '').trim();
    category = (body.category || '').trim();
    image = (body.image || '').trim();
    imageSourceUrl = (body.imageSourceUrl || '').trim();
    imageCopyright = (body.imageCopyright || '').trim();
    referencesText = (body.references || '').trim();
  }

  if (!title || !content || !category) {
    return NextResponse.json({ error: 'Judul, isi, dan kategori wajib diisi.' }, { status: 400 });
  }

  const references = parseReferencesInput(referencesText);

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
      category,
      image: image || null,
      imageSourceUrl: imageSourceUrl || null,
      imageCopyright: imageCopyright || null,
      references: references.length > 0 ? references : undefined,
    },
  });

  revalidatePath('/');
  revalidatePath('/artikel');
  revalidatePath(`/artikel/${article.slug}`);
  revalidatePath('/dashboard/admin/articles');

  return NextResponse.json({ message: 'Artikel berhasil diperbarui', article });
}
