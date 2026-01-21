'use server'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadGallery(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const file = formData.get('image') as File

  if (!file || file.size === 0) {
    return { error: 'Harap pilih foto terlebih dahulu.' }
  }

  try {
    // 1. Upload File ke Supabase Storage
    const fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`
    
    // Convert File ke Buffer agar bisa diupload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('gallery') // Nama bucket yang tadi dibuat
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'Gagal mengupload gambar ke server.' }
    }

    // 2. Ambil Link Public Gambar
    const { data: { publicUrl } } = supabase
      .storage
      .from('gallery')
      .getPublicUrl(fileName)

    // 3. Simpan Data ke Database Prisma
    await prisma.gallery.create({
      data: {
        title: title || 'Tanpa Judul',
        description: description || '',
        imageUrl: publicUrl,
      }
    })

    // 4. Refresh Halaman
    revalidatePath('/galeri')
    revalidatePath('/dashboard/admin/gallery')

    return { success: true }

  } catch (err) {
    console.error(err)
    return { error: 'Terjadi kesalahan sistem.' }
  }
}