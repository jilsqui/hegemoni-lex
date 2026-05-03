'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim email reset password.');
      } else {
        setMessage(data.message || 'Jika email terdaftar, link reset sudah dikirim.');
        setSent(true);
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
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-3">Lupa Password</h1>
        <p className="text-sm text-gray-500 mb-6">Masukkan email akun Anda. Kami akan kirim link untuk reset password.</p>

        {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {sent && (
          <div className="mb-4 p-4 border border-green-200 bg-green-50 text-sm text-green-800 space-y-1">
            <p className="font-bold">Email reset sudah dikirim.</p>
            <p>Cek inbox dan folder spam/promosi Anda.</p>
            <p>Link berlaku selama 30 menit.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full border-2 border-black p-3.5 outline-none focus:bg-gray-50"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Mengirim...' : sent ? 'Kirim Ulang Link Reset' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
