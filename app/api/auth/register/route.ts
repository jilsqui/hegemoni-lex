// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Validasi Input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Semua kolom wajib diisi!" }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah digunakan. Silakan login." }, { status: 400 });
    }

    // 3. Enkripsi Password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat User Baru (Role Default: READER)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'READER' // Pastikan role-nya READER
      }
    });

    // Hapus password dari respon agar aman
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ 
        message: "Registrasi berhasil", 
        user: userWithoutPassword 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}