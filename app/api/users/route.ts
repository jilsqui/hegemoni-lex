// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import * as bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. KEAMANAN: Cek apakah yang request ini benar-benar ADMIN?
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin yang boleh menambah user." }, { status: 403 });
    }

    // 2. Ambil data dari form
    const body = await req.json();
    const { name, email, password } = body;

    // 3. Validasi: Pastikan semua diisi
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Semua kolom wajib diisi!" }, { status: 400 });
    }

    // 4. Cek apakah email sudah dipakai?
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
    }

    // 5. Acak Password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Simpan ke Database sebagai WRITER
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'WRITER', // <--- PENTING: Kita set otomatis jadi PENULIS
        bio: 'Penulis baru di Hegemoni Lex',
      },
    });

    // Hapus password dari respon agar aman
    const { password: newPassword, ...userWithoutPassword } = newUser;

    return NextResponse.json({ user: userWithoutPassword, message: "Penulis berhasil ditambahkan" }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}

// DELETE: Hapus user (Hanya ADMIN)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: "ID user diperlukan" }, { status: 400 });
    }

    // Cegah admin menghapus dirinya sendiri
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }

    // Hapus artikel milik user terlebih dahulu (karena ada relasi)
    await prisma.article.deleteMany({ where: { authorId: userId } });
    await prisma.comment.deleteMany({ where: { userId: userId } });
    await prisma.rating.deleteMany({ where: { userId: userId } });
    await prisma.report.deleteMany({ where: { userId: userId } });

    // Hapus user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User berhasil dihapus" });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}