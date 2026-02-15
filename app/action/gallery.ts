'use server'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key untuk server-side (bypass RLS)
)

// FUNGSI 1: UPLOAD
export async function uploadGalleryAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Anda harus login!" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const file = formData.get('image') as File

  if (!file || file.size === 0) return { error: 'Foto wajib diisi.' }

  try {
    // Konversi File ke Buffer (wajib untuk Server Actions Next.js)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, buffer, { 
        contentType: file.type, 
        upsert: false 
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return { error: `Gagal upload gambar: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName)

    const initialStatus = session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'

    await prisma.gallery.create({
      data: {
        title,
        description,
        imageUrl: publicUrl,
        status: initialStatus, 
        uploaderId: session.user.id
      }
    })

    revalidatePath('/galeri')
    return { success: true, message: initialStatus === 'PENDING' ? 'Foto berhasil dikirim! Menunggu persetujuan Admin.' : 'Foto berhasil diterbitkan!' }

  } catch (error: any) {
    console.error('Gallery upload error detail:', error?.message || error)
    return { error: error?.message || 'Terjadi kesalahan sistem.' }
  }
}

// FUNGSI 2: UPDATE STATUS (Ini yang dicari error Anda)
export async function updateGalleryStatus(id: string, newStatus: 'APPROVED' | 'REJECTED') {
  try {
    await prisma.gallery.update({
      where: { id },
      data: { status: newStatus }
    })
    revalidatePath('/galeri')
    return { success: true }
  } catch (error) {
    return { error: "Gagal update status" }
  }
}

// FUNGSI 3: DELETE
export async function deleteGallery(id: string) {
    await prisma.gallery.delete({ where: { id } })
    revalidatePath('/galeri')
    return { success: true }
}