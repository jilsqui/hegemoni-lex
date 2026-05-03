import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken } from '@/lib/passwordResetToken';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token tidak tersedia.' }, { status: 400 });
    }

    const verified = verifyPasswordResetToken(token);
    if (!verified.valid || !verified.email) {
      return NextResponse.json({ valid: false, error: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, error: 'Gagal memvalidasi token.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token tidak valid.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
    }

    const verification = verifyPasswordResetToken(token);
    if (!verification.valid || !verification.email) {
      return NextResponse.json({ error: verification.reason || 'Token tidak valid.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: verification.email } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diperbarui. Silakan login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
