// app/login/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Email atau Password salah!');
        setLoading(false);
      } else {
        const session = await getSession();
        
        // --- PERBAIKAN LOGIKA DISINI ---
        
        // Jika ADMIN, arahkan ke HOME ('/') juga, jangan ke dashboard
        if (session?.user?.role === 'ADMIN') {
           router.push('/'); 
        } 
        // Penulis & Pembaca juga ke Home
        else if (session?.user?.role === 'WRITER') {
           router.push('/'); 
        } else {
           router.push('/'); 
        }
        
        // Kesimpulan: Semua role diarahkan ke Home setelah login
        
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server');
      setLoading(false);
    }
  };

  return (
    // ... (Tampilan HTML biarkan sama seperti sebelumnya) ...
    <div className="min-h-screen flex bg-white font-sans selection:bg-black selection:text-white text-black">
      
      {/* 1. BAGIAN KIRI - FORMULIR LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 border-r-2 border-black relative">
        
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

            <div className="mb-12">
                <span className="inline-block py-1 px-3 border border-black text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black">
                  Akun Pengguna
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4 text-black">Selamat Datang</h1>
                <p className="text-black font-normal leading-relaxed">Masuk untuk mengelola konten atau mengakses fitur premium.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-xs font-bold uppercase tracking-widest text-black">Password</label>
                        <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-black hover:underline decoration-1 underline-offset-4">Lupa Password?</a>
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white border-2 border-black p-4 outline-none focus:bg-gray-50 transition-colors font-medium placeholder:text-gray-400 text-black"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memproses...' : 'Masuk Sekarang'}
                </button>

                <div className="text-center mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Belum punya akun? <Link href="/register" className="text-black underline decoration-2 underline-offset-4 hover:opacity-70">Daftar Sekarang</Link>
                    </p>
                </div>
            </form>
        </div>

        <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:bottom-12 lg:left-24 pointer-events-none">
            <span className="text-[10px] text-black font-bold uppercase tracking-widest">
                © 2025 Hegemoni Lex. Secure Login.
            </span>
        </div>

      </div>

      {/* 2. BAGIAN KANAN */}
      <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-between p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 border-l-2 border-b-2 border-gray-800 rounded-bl-[100px]"></div>
        <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16">
                    <Image src="/logohl.png" alt="Hegemoni LEX Logo" fill className="object-contain invert"/>
                </div>
                <div className="text-2xl font-serif font-bold">Hegemoni LEX</div>
             </div>
        </div>
        <div className="relative z-10">
            <h2 className="text-5xl font-serif font-light leading-tight mb-8">
              "Keadilan bukanlah sekadar kata, melainkan <span className="italic border-b border-white pb-1">tindakan</span> yang terus menerus."
            </h2>
            <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-white"></div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Portal Hukum Independen</p>
            </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 border border-gray-800 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 border border-gray-700 rounded-full opacity-50"></div>
      </div>
    </div>
  );
}