// app/api/users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Pastikan path ini benar sesuai struktur folder Anda

const prisma = new PrismaClient();

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