import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/passwordResetToken';

function getEnv(name: string): string {
  return (process.env[name] || '').trim();
}

// Email template
function getEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #111;">Reset Password</h2>
      <p>Kami menerima permintaan reset password untuk akun Anda.</p>
      <p>Klik tombol di bawah ini untuk mengatur password baru (berlaku 30 menit):</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700;letter-spacing:.04em;">Reset Password</a>
      </p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:12px;color:#777;word-break:break-all;">Atau buka link ini: ${resetUrl}</p>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Selalu kirim response yang sama agar email valid/tidak tidak bisa ditebak.
    const genericResponse = NextResponse.json({
      message: 'Jika email terdaftar, link reset password sudah dikirim.'
    });

    if (!user) {
      return genericResponse;
    }

    const token = createPasswordResetToken(normalizedEmail, 30);

    const projectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    const fallbackBaseUrl = projectUrl
      ? projectUrl.startsWith('http')
        ? projectUrl
        : `https://${projectUrl}`
      : 'https://hegemonilex.com';

    const baseUrl = process.env.NEXTAUTH_URL || fallbackBaseUrl;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // Try to send email if credentials are available
    const sendEmailSuccess = await sendPasswordResetEmail(normalizedEmail, resetUrl);

    if (!sendEmailSuccess) {
      console.warn(`Email config missing or delivery failed for ${normalizedEmail}`);
      // Still return generic response for security (don't reveal if user exists)
    }

    return genericResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    // Return generic response to not reveal if user exists
    return NextResponse.json({
      message: 'Jika email terdaftar, link reset password sudah dikirim.'
    });
  }
}

async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  try {
    const emailUser = getEnv('EMAIL_USER');
    const emailPass = getEnv('EMAIL_PASS');
    const resendApiKey = getEnv('RESEND_API_KEY');

    // Check if Gmail credentials are available
    if (emailUser && emailPass) {
      return await sendViaGmail(email, resetUrl, emailUser, emailPass);
    }

    // Fallback: use resend if available (sign up free tier at resend.com)
    if (resendApiKey) {
      return await sendViaResend(email, resetUrl, resendApiKey);
    }

    // No email service configured
    console.error('No email service configured. Please set EMAIL_USER/EMAIL_PASS or RESEND_API_KEY');
    return false;
  } catch (error) {
    console.error('sendPasswordResetEmail error:', error);
    return false;
  }
}

async function sendViaGmail(email: string, resetUrl: string, emailUser: string, emailPass: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass, // NOTE: Use Gmail App Password if 2FA enabled
      },
    });

    await transporter.sendMail({
      from: `"Hegemoni Lex" <${emailUser}>`,
      to: email,
      subject: 'Reset Password Hegemoni Lex',
      html: getEmailHtml(resetUrl),
    });

    console.log(`Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Gmail send error for ${email}:`, error);
    throw error;
  }
}

async function sendViaResend(email: string, resetUrl: string, resendApiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@hegemonilex.com',
        to: email,
        subject: 'Reset Password Hegemoni Lex',
        html: getEmailHtml(resetUrl),
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log(`Password reset email sent via Resend to ${email}`);
    return true;
  } catch (error) {
    console.error(`Resend send error for ${email}:`, error);
    throw error;
  }
}
