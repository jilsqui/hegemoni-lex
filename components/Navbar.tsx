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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Kategori Hukum (Tetap)
  const categories = [
    "LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", 
    "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"
  ];

  // Sembunyikan Navbar di Dashboard Admin
  if (pathname && pathname.startsWith('/dashboard/admin')) {
    return null; 
  }

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
        
        {/* ================= 1. LOGO ================= */}
        <Link href="/" className="flex items-center gap-3 group z-50">
             <div className="relative w-12 h-12"> 
                <Image src="/logohl.png" alt="Logo" fill className="object-contain" /> 
             </div>
             <div className="flex flex-col justify-center">
                <span className="font-serif font-bold text-2xl tracking-tight leading-none group-hover:opacity-70 transition-opacity text-black">HEGEMONI</span>
                <span className="font-sans text-[11px] font-bold tracking-[0.3em] leading-none text-gray-500 mt-1">LEX</span>
             </div>
        </Link>

        {/* ================= 2. DESKTOP MENU ================= */}
        <div className="hidden md:flex items-center gap-8 h-full">
            <Link href="/" className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors ${pathname === '/' ? 'text-black' : 'text-gray-400'}`}>
                Beranda
            </Link>
            
            {/* --- DROPDOWN PROFIL (FIXED) --- */}
            <div className="relative group h-full flex items-center">
                <button className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center gap-1 group-hover:text-black ${pathname?.includes('/tentang-kami') || pathname?.includes('/profil') || pathname === '/galeri' ? 'text-black' : 'text-gray-400'}`}>
                    PROFIL ▾
                </button>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-4">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45"></div>
                    <div className="relative z-10 flex flex-col gap-3">
                         {/* 1. Tentang Kami (Saya arahkan ke folder tentang-kami) */}
                         <Link href="/tentang-kami" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:pl-2 transition-all">Tentang Kami</Link>
                         
                         {/* 2. Tim Kami (SUDAH DIPERBAIKI) */}
                         <Link href="/tentang-kami/tim-kami" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:pl-2 transition-all">Tim Kami</Link>
                         
                         {/* 3. Hubungi Kami */}
                         <Link href="/profil/hubungi-kami" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:pl-2 transition-all">Hubungi Kami</Link>
                         
                         {/* 4. Kirim Tulisan */}
                         <Link href="/profil/kirim-tulisan" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:pl-2 transition-all">Kirim Tulisan</Link>
                         
                         {/* 5. Publikasi */}
                         <Link href="/profil/publikasi" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:pl-2 transition-all">Publikasi</Link>
                         
                         {/* 6. Galeri */}
                         <Link href="/galeri" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:pl-2 transition-all">Galeri</Link>
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
                            <Link key={cat} href={`/artikel?q=${cat}`} className="block px-6 py-3 text-[10px] font-bold text-gray-500 hover:bg-gray-50 hover:text-black hover:tracking-widest transition-all border-b border-gray-50 last:border-0">
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Link Donasi */}
            <Link href="/donasi" className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors ${pathname === '/donasi' ? 'text-black' : 'text-gray-400'}`}>
                Donasi
            </Link>

            {/* Link Lapor Masalah */}
            <Link href="/lapor" className={`text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors ${pathname === '/lapor' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400'}`}>
                Lapor Masalah
            </Link>
        </div>

        {/* ================= 3. USER & SEARCH ================= */}
        <div className="hidden md:flex items-center gap-6">
             <form action="/artikel" className="flex items-center border-b border-gray-300 pb-1 group focus-within:border-black transition-colors">
                <input type="text" name="q" placeholder="CARI..." className="text-[10px] uppercase font-bold tracking-widest w-20 focus:w-32 transition-all outline-none placeholder:text-gray-300 text-black bg-transparent" />
                <button type="submit" className="text-gray-400 group-focus-within:text-black">🔍</button>
             </form>

             {/* Tombol Login / User Profile */}
             {status === 'authenticated' ? (
                <div className="relative group h-full flex items-center cursor-pointer">
                    <button className="flex items-center gap-2 text-left">
                        <div className="w-8 h-8 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </button>
                    {/* Dropdown User Profile */}
                    <div className="absolute top-[70px] right-0 w-56 bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                          <div className="p-4 border-b border-gray-100 bg-gray-50">
                             <p className="text-xs font-bold truncate text-black">{session.user?.name}</p>
                             <p className="text-[9px] font-mono text-gray-500 truncate">{session.user?.email}</p>
                             <span className="text-[9px] bg-black text-white px-1 rounded mt-1 inline-block uppercase">{session.user?.role}</span>
                          </div>
                          {session.user?.role === 'ADMIN' && (
                             <Link href="/dashboard/admin" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-600 hover:text-black">📊 Dashboard Admin</Link>
                          )}
                          {session.user?.role === 'WRITER' && (
                             <Link href="/dashboard/writer/posts" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-600 hover:text-black">✍️ Dashboard Penulis</Link>
                          )}
                          <button onClick={() => signOut()} className="block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100">🚪 Logout</button>
                    </div>
                </div>
             ) : (
                 <Link href="/login" className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
                    LOGIN
                 </Link>
             )}
        </div>

        {/* Mobile Button */}
        <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-black">
                {isMobileMenuOpen ? <span className="text-2xl">✕</span> : <span className="text-2xl">☰</span>}
            </button>
        </div>
      </div>
      
      {/* Mobile Menu (Responsive) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-24 bg-white z-40 overflow-y-auto pb-20 border-t border-gray-100">
             <div className="flex flex-col p-6 space-y-4">
                <Link href="/" className="font-bold" onClick={() => setIsMobileMenuOpen(false)}>BERANDA</Link>
                <div className="border-l-2 border-gray-100 pl-4 space-y-3">
                    <p className="text-xs text-gray-400 font-bold uppercase">Profil</p>
                    
                    {/* Link Mobile disamakan dengan Desktop */}
                    <Link href="/tentang-kami" className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>Tentang Kami</Link>
                    <Link href="/tentang-kami/tim-kami" className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>Tim Kami</Link>
                    <Link href="/profil/hubungi-kami" className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>Hubungi Kami</Link>
                    <Link href="/profil/kirim-tulisan" className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>Kirim Tulisan</Link>
                    <Link href="/profil/publikasi" className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>Publikasi</Link>
                    <Link href="/galeri" className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>Galeri</Link>
                </div>
                
                <div className="border-l-2 border-gray-100 pl-4 space-y-3 mt-4">
                     <p className="text-xs text-gray-400 font-bold uppercase">Hukum</p>
                     {categories.map((cat) => (
                        <Link key={cat} href={`/artikel?q=${cat}`} className="block text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                            {cat}
                        </Link>
                     ))}
                </div>
             </div>
        </div>
      )}
    </nav>
  );
}