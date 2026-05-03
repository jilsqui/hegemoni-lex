'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus('invalid');
        setError('Token reset tidak ditemukan. Silakan minta link baru.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          setTokenStatus('invalid');
          setError('Link reset tidak valid atau sudah kedaluwarsa.');
          return;
        }

        setTokenStatus('valid');
      } catch {
        setTokenStatus('invalid');
        setError('Gagal memvalidasi link reset. Coba lagi sebentar lagi.');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!token || tokenStatus !== 'valid') {
      setError('Token reset tidak ditemukan.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memperbarui password.');
      } else {
        setMessage(data.message || 'Password berhasil diperbarui.');
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black pt-24 md:pt-32 px-4 md:px-6 pb-16">
      <div className="max-w-md mx-auto border border-gray-200 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-3">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">Masukkan password baru untuk akun Anda.</p>

        {tokenStatus === 'checking' && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-700 text-sm">Memvalidasi link reset...</div>
        )}

        {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {tokenStatus === 'invalid' && (
          <div className="mb-5 p-4 border border-red-200 bg-red-50 text-sm text-red-800">
            <p className="font-bold mb-1">Link reset tidak bisa digunakan.</p>
            <p className="mb-3">Silakan minta link reset baru untuk melanjutkan.</p>
            <Link
              href="/forgot-password"
              className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800"
            >
              Minta Link Baru
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-disabled={tokenStatus !== 'valid'}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password Baru</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black p-3.5 outline-none focus:bg-gray-50"
              disabled={loading || tokenStatus !== 'valid'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Konfirmasi Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-2 border-black p-3.5 outline-none focus:bg-gray-50"
              disabled={loading || tokenStatus !== 'valid'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || tokenStatus !== 'valid'}
            className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-400">Memuat...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
