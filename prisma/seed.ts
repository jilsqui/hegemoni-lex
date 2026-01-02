// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Enkripsi password "admin123" agar aman
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 2. Buat user Admin (Upsert = Update jika ada, Insert jika belum ada)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hegemoni.lex' },
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      email: 'admin@hegemoni.lex',
      name: 'Super Admin',
      password: hashedPassword, // Password yang sudah diacak
      role: Role.ADMIN,         // PENTING: Role-nya ADMIN
      bio: 'Penjaga Kualitas Konten Hegemoni Lex',
      image: '/images/admin-placeholder.png',
    },
  })

  console.log({ admin })
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