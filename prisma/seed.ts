// prisma/seed.ts
import { PrismaClient, Role, MerchandiseStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Enkripsi password "admin123" agar aman
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 2. Buat user Admin (Upsert = Update jika ada, Insert jika belum ada)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hegemoni.lex' },
    update: {
      role: Role.ADMIN,
      name: 'Super Admin',
    },
    create: {
      email: 'admin@hegemoni.lex',
      name: 'Super Admin',
      password: hashedPassword, // Password yang sudah diacak
      role: Role.ADMIN,         // PENTING: Role-nya ADMIN
      bio: 'Penjaga Kualitas Konten Hegemoni Lex',
      image: '/images/admin-placeholder.png',
    },
  })

  const book = await prisma.merchandiseProduct.upsert({
    where: { slug: 'sinopsis-buku-hegemoni-lex' },
    update: {},
    create: {
      slug: 'sinopsis-buku-hegemoni-lex',
      title: 'Sinopsis Buku Hegemoni Lex',
      subtitle: 'Edisi pembuka untuk pembaca yang ingin memahami arah gerakan kami.',
      price: 0,
      currency: 'IDR',
      category: 'Buku',
      status: MerchandiseStatus.PUBLISHED,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
      isFeatured: true,
      bookMetadata: {
        create: {
          author: 'Hegemoni Lex',
          publisher: 'Hegemoni Lex Studio',
          releaseYear: 2026,
          synopsis: 'Sinopsis buku ini menyajikan gambaran singkat tentang semangat kritik, literasi, dan keadilan yang menjadi fondasi platform Hegemoni Lex.',
          format: 'Digital + Cetak',
          pages: 96,
          language: 'Indonesia',
          tags: ['sinopsis', 'merchandise', 'hegemoni lex'],
        },
      },
    },
  })

  console.log({ admin, book })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })