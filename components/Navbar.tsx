// components/Navbar.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  // STATE UNTUK MOBILE MENU
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Kategori Hukum
  const categories = [
    "LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", 
    "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"
  ];

  // =========================================================================
  // LOGIKA TAMBAHAN: SEMBUNYIKAN NAVBAR DI DASHBOARD ADMIN
  // =========================================================================
  // Jika URL saat ini diawali dengan "/dashboard/admin", maka Navbar ini 
  // tidak akan dirender (return null). Ini mencegah tabrakan tampilan.
  if (pathname && pathname.startsWith('/dashboard/admin')) {
    return null; 
  }
  // =========================================================================

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
        
        {/* ================= 1. LOGO ================= */}
        <Link href="/" className="flex items-center gap-3 group z-50">
             <div className="relative w-10 h-10">
                <Image src="/logohl.png" alt="Logo" fill className="object-contain" /> 
             </div>
             <div className="flex flex-col justify-center">
                <span className="font-serif font-bold text-xl tracking-tight leading-none group-hover:opacity-70 transition-opacity text-black">HEGEMONI</span>
                <span className="font-sans text-[10px] font-bold tracking-[0.3em] leading-none text-gray-500 mt-1">LEX</span>
             </div>
        </Link>

        {/* ================= 2. DESKTOP MENU (Hidden di HP) ================= */}
        <div className="hidden md:flex items-center gap-8 h-full">
            <Link 
                href="/" 
                className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors ${pathname === '/' ? 'text-black' : 'text-gray-400'}`}
            >
                Beranda
            </Link>
            
            {/* --- DROPDOWN TENTANG KAMI --- */}
            <div className="relative group h-full flex items-center">
                <button className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center gap-1 group-hover:text-black ${pathname?.includes('/tentang-kami') ? 'text-black' : 'text-gray-400'}`}>
                    Tentang Kami ▾
                </button>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-6">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45"></div>
                    <div className="relative z-10">
                        <h4 className="font-serif font-bold text-lg mb-2">Hegemoni Lex</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4 border-b border-gray-100 pb-4">
                            Wadah kolektif untuk diskursus hukum, legislasi, dan hak asasi manusia yang kritis dan berkeadilan di Indonesia.
                        </p>
                        <div className="flex flex-col gap-2">
                             <Link href="/tentang-kami/visi-misi-kami" className="text-[10px] font-bold uppercase tracking-widest hover:text-black text-gray-400 hover:underline">Visi & Misi</Link>
                             <Link href="/tentang-kami/tim-kami" className="text-[10px] font-bold uppercase tracking-widest hover:text-black text-gray-400 hover:underline">Tim Redaksi</Link>
                             <Link href="/kontak" className="text-[10px] font-bold uppercase tracking-widest hover:text-black text-gray-400 hover:underline">Hubungi Kami</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DROPDOWN HUKUM --- */}
            <div className="relative group h-full flex items-center">
                <button className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center gap-1 group-hover:text-black ${pathname?.includes('/artikel') ? 'text-black' : 'text-gray-400'}`}>
                    Hukum ▾
                </button>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45"></div>
                    <div className="relative bg-white py-2 z-10">
                        {categories.map((cat) => (
                            <Link 
                                key={cat} 
                                href={`/artikel?q=${cat}`} 
                                className="block px-6 py-3 text-[10px] font-bold text-gray-500 hover:bg-gray-50 hover:text-black hover:tracking-widest transition-all border-b border-gray-50 last:border-0"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- DROPDOWN DONASI --- */}
            <div className="relative group h-full flex items-center">
                <Link 
                    href="/donasi" 
                    className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center gap-1 group-hover:text-black ${pathname === '/donasi' ? 'text-black' : 'text-gray-400'}`}
                >
                    Donasi ▾
                </Link>
                
                {/* Kotak Dropdown Informasi Rekening */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 bg-white border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-6">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45"></div>
                    
                    <div className="relative z-10 text-center">
                        <h4 className="font-serif font-bold text-lg mb-2">Dukungan Publik</h4>
                        <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                            Partisipasi Anda membantu kami merawat independensi jurnalisme hukum.
                        </p>
                        
                        {/* Detail Rekening */}
                        <div className="bg-gray-50 p-4 border border-gray-200 rounded-sm mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bank BCA</p>
                            <p className="text-xl font-serif font-bold text-black mb-1 selection:bg-black selection:text-white">
                                873-500-1234
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">
                                a.n HEGEMONI LEX MEDIA
                            </p>
                        </div>
                        
                        <p className="text-[9px] text-gray-400 mt-2 italic">
                            *Silakan konfirmasi setelah transfer.
                        </p>
                    </div>
                </div>
            </div>

            {/* Link Lapor Masalah */}
            <Link 
                href="/lapor" 
                className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors ${pathname === '/lapor' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400'}`}
            >
                Lapor Masalah
            </Link>
        </div>

        {/* ================= 3. USER & SEARCH (DESKTOP) ================= */}
        <div className="hidden md:flex items-center gap-6">
             {/* Search Bar */}
             <form action="/artikel" className="flex items-center border-b border-gray-300 pb-1 group focus-within:border-black transition-colors">
                <input 
                    type="text" 
                    name="q" 
                    placeholder="CARI..." 
                    className="text-[10px] uppercase font-bold tracking-widest w-20 focus:w-32 transition-all outline-none placeholder:text-gray-300 text-black bg-transparent" 
                />
                <button type="submit" className="text-gray-400 group-focus-within:text-black">🔍</button>
             </form>

             {/* User Auth Check */}
             {status === 'authenticated' ? (
                <div className="relative group h-full flex items-center cursor-pointer">
                    <button className="flex items-center gap-2 text-left">
                        <div className="w-8 h-8 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </button>

                    <div className="absolute top-[70px] right-0 w-56 bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                         <div className="p-4 border-b border-gray-100 bg-gray-50">
                             <p className="text-xs font-bold truncate text-black">{session.user?.name}</p>
                             <p className="text-[9px] font-mono text-gray-500 truncate">{session.user?.email}</p>
                             <span className="text-[9px] bg-black text-white px-1 rounded mt-1 inline-block uppercase">{session.user?.role}</span>
                         </div>
                         
                         {/* --- MENU DROPDOWN SESUAI ROLE --- */}
                         {session.user?.role === 'ADMIN' && (
                             <Link href="/dashboard/admin" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-600 hover:text-black">
                                📊 Dashboard Admin
                             </Link>
                         )}

                         {session.user?.role === 'WRITER' && (
                             <Link href="/dashboard/writer/posts" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-600 hover:text-black">
                                ✍️ Dashboard Penulis
                             </Link>
                         )}
                         
                         <button onClick={() => signOut()} className="block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100">
                            🚪 Logout
                         </button>
                    </div>
                </div>
             ) : (
                 <Link href="/login" className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
                    login
                 </Link>
             )}
        </div>

        {/* ================= 4. MOBILE HAMBURGER BUTTON (Hanya di HP) ================= */}
        <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-black">
                {isMobileMenuOpen ? (
                    <span className="text-2xl">✕</span> 
                ) : (
                    <span className="text-2xl">☰</span>
                )}
            </button>
        </div>

      </div>

      {/* ================= 5. MOBILE MENU OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-24 bg-white z-40 overflow-y-auto pb-20 border-t border-gray-100 animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col p-6 space-y-6">
                
                {/* Mobile Search */}
                <form action="/artikel" className="flex items-center border border-gray-300 p-3 rounded-sm">
                    <input type="text" name="q" placeholder="Cari artikel..." className="flex-1 outline-none text-sm font-serif"/>
                    <button type="submit">🔍</button>
                </form>

                <div className="space-y-4 border-b border-gray-100 pb-6">
                    <Link href="/" className="block text-sm font-bold uppercase tracking-widest text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                    
                    {/* Tentang Kami Mobile */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tentang Kami</p>
                        <div className="pl-4 space-y-2 border-l border-gray-200">
                             <Link href="/tentang-kami/visi-misi-kami" className="block text-xs font-bold text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>Visi Misi</Link>
                             <Link href="/tentang-kami/tim-kami" className="block text-xs font-bold text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>Tim Redaksi</Link>
                        </div>
                    </div>

                    <Link href="/donasi" className="block text-sm font-bold uppercase tracking-widest text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Donasi</Link>
                    <Link href="/lapor" className="block text-sm font-bold uppercase tracking-widest text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Lapor Masalah</Link>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Kategori Hukum</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {categories.map((cat) => (
                             <Link key={cat} href={`/artikel?q=${cat}`} className="text-xs font-bold text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                                {cat}
                             </Link>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    {status === 'authenticated' ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                    {session.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{session.user?.name}</p>
                                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                                </div>
                            </div>
                            
                             {session.user?.role === 'ADMIN' ? (
                                 <Link href="/dashboard/admin" className="block w-full bg-gray-100 text-center py-3 text-xs font-bold uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>Dashboard Admin</Link>
                             ) : (
                                 <Link href="/dashboard/writer/posts" className="block w-full bg-gray-100 text-center py-3 text-xs font-bold uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>Dashboard Penulis</Link>
                             )}

                            <button onClick={() => signOut()} className="block w-full text-center py-3 text-xs font-bold uppercase tracking-widest text-red-600 border border-red-200">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="block w-full bg-black text-white text-center py-4 text-xs font-bold uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>
                            LOGIN
                        </Link>
                    )}
                </div>

            </div>
        </div>
      )}

    </nav>
  );
}