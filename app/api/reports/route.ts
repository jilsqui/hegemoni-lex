// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, message, type, userEmail } = body;

    // 1. SIMPAN LAPORAN KE DATABASE
    let userId = null;
    if (userEmail) {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (user) userId = user.id;
    }

    await prisma.report.create({
      data: { subject, message, type, userId }
    });

    // 2. KONFIGURASI PENGIRIM EMAIL (TRANSPORTER)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Ambil dari .env
            pass: process.env.EMAIL_PASS  // Ambil dari .env
        }
    });

    // 3. SUSUN ISI EMAIL
    const mailOptions = {
        from: `"Sistem Laporan Hegemoni" <${process.env.EMAIL_USER}>`, // Nama Pengirim
        to: 'lexhegemoni@gmail.com', // Email Admin Penerima (Bisa diganti jika admin beda email)
        subject: `[${type}] ${subject}`, // Judul Email: [BUG] Login Error
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #000;">Laporan Masuk Baru</h2>
                <p>Halo Admin, ada laporan baru dari website:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Pengirim:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userEmail || "Pengunjung Tamu (Anonim)"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Tipe:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                            <span style="background-color: ${type === 'BUG' ? '#fee2e2' : '#dcfce7'}; color: ${type === 'BUG' ? '#991b1b' : '#166534'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                ${type}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Judul:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${subject}</td>
                    </tr>
                </table>

                <p style="font-weight: bold; margin-top: 20px;">Detail Pesan:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #000; color: #555;">
                    ${message}
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                    Email ini dikirim otomatis oleh sistem website Hegemoni Lex.
                </p>
            </div>
        `
    };

    // 4. KIRIM EMAIL
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Laporan berhasil dikirim dan email terkirim" });

  } catch (error) {
    console.error("Error sending report:", error);
    // Tetap return sukses jika database berhasil meski email gagal, atau return error 500
    return NextResponse.json({ error: "Gagal memproses laporan" }, { status: 500 });
  }
}