// app/register/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  // STATE
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // FUNGSI DAFTAR
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Akun berhasil dibuat! Silakan login.");
        router.push('/login'); // Arahkan ke halaman login
      } else {
        setError(data.error || "Gagal mendaftar");
        setLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-black selection:text-white text-black">
      
      {/* 1. BAGIAN KIRI - FORMULIR DAFTAR */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 lg:border-r-2 border-black relative">
        
        <div className="absolute top-8 left-8 md:top-12 md:left-12 lg:top-12 lg:left-24">
            <Link href="/" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity text-black">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Beranda
            </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
            {/* Logo Mobile */}
            <div className="lg:hidden mb-12 flex justify-center">
                <div className="relative w-16 h-16">
                    <Image src="/logohl.png" alt="Logo" fill className="object-contain" />
                </div>
            </div>

            <div className="mb-10">
                <span className="inline-block py-1 px-3 border border-black text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black">
                  Registrasi Pembaca
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4 text-black">Buat Akun Baru</h1>
                <p className="text-black font-normal leading-relaxed">Bergabunglah untuk mendapatkan akses penuh ke artikel hukum eksklusif.</p>
            </div>

            {/* ALERT ERROR */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* FORM REGISTER */}
            <form onSubmit={handleRegister} className="space-y-5">
                
                {/* Input Nama */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-black">Nama Lengkap</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        required
                        className="w-full bg-white border-2 border-black p-4 outline-none focus:bg-gray-50 transition-colors font-medium placeholder:text-gray-400 text-black"
                    />
                </div>

                {/* Input Email */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-black">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        className="w-full bg-white border-2 border-black p-4 outline-none focus:bg-gray-50 transition-colors font-medium placeholder:text-gray-400 text-black"
                    />
                </div>

                {/* Input Password */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-black">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        className="w-full bg-white border-2 border-black p-4 outline-none focus:bg-gray-50 transition-colors font-medium placeholder:text-gray-400 text-black"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </button>

                {/* Link ke Login */}
                <div className="text-center mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Sudah punya akun? <Link href="/login" className="text-black underline decoration-2 underline-offset-4 hover:opacity-70">Masuk di sini</Link>
                    </p>
                </div>
            </form>
        </div>

        <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:bottom-12 lg:left-24 pointer-events-none">
            <span className="text-[10px] text-black font-bold uppercase tracking-widest">
                © 2026 Hegemoni Lex. Secure Registration.
            </span>
        </div>

      </div>

      {/* 2. BAGIAN KANAN (Aesthetic) */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 text-black flex-col justify-between p-24 relative overflow-hidden border-l border-black">
        {/* Dekorasi Visual Berbeda sedikit dari Login agar tidak bosan */}
        <div className="absolute top-0 left-0 w-64 h-64 border-r-2 border-b-2 border-black rounded-br-[100px]"></div>
        
        <div className="relative z-10 flex flex-col items-end text-right mt-20">
            <h2 className="text-6xl font-serif font-light leading-tight mb-8">
              "Hukum adalah <br/> <span className="italic border-b-2 border-black pb-1 font-bold">akal budi</span> yang bebas dari nafsu."
            </h2>
            <div className="flex items-center gap-4 justify-end">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">— Aristoteles</p>
                <div className="h-[2px] w-12 bg-black"></div>
            </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-96 h-96 border-2 border-gray-200 rounded-full opacity-50"></div>
      </div>
    </div>
  );
}