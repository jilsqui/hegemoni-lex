// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { markdownLikeToHtml, parseReferencesInput } from '@/lib/articleFormatting';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Cek Login
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Ambil Data (support JSON dan multipart/form-data)
    const contentType = request.headers.get('content-type') || '';

    let title = '';
    let content = '';
    let category = '';
    let image = '';
    let status = 'PENDING';
    let imageSourceUrl = '';
    let imageCopyright = '';
    let referencesText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || '';
      content = (formData.get('content') as string) || '';
      category = (formData.get('category') as string) || '';
      status = ((formData.get('status') as string) || 'PENDING').toUpperCase();
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
      image = body.image || '';
      status = (body.status || 'PENDING').toUpperCase();
      imageSourceUrl = (body.imageSourceUrl || '').trim();
      imageCopyright = (body.imageCopyright || '').trim();
      referencesText = (body.references || '').trim();
    }

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Judul, isi, dan kategori wajib diisi.' }, { status: 400 });
    }

    const references = parseReferencesInput(referencesText);
    const sanitizedContent = markdownLikeToHtml(content);

    const slug = title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '') + '-' + Date.now();

    // 3. LOGIKA STATUS (PENTING!)
    // Jika tombol yang ditekan adalah "Simpan Draft", maka status = DRAFT
    // Jika tombol "Terbitkan", maka status = PENDING (Bukan Published)
    
    let articleStatus = 'PENDING'; // Defaultnya Pending Review
    if (status === 'DRAFT') {
        articleStatus = 'DRAFT';
    }

    // 4. SIMPAN KE DATABASE
    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        content: sanitizedContent,
        category,
        image,
        imageSourceUrl: imageSourceUrl || null,
        imageCopyright: imageCopyright || null,
        references: references.length > 0 ? references : undefined,
        
        // PERBAIKAN DISINI:
        status: articleStatus as ArticleStatus,
        
        // publishedAt JANGAN DIISI DULU (Nanti diisi Admin saat approve)
        publishedAt: null, 
        
        authorId: user.id,
      },
    });

    revalidatePath('/');
    revalidatePath('/artikel');

    return NextResponse.json(newArticle);

  } catch (error) {
    console.error("Gagal menyimpan artikel:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}