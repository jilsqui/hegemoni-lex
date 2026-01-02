// app/dashboard/writer/layout.tsx
'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Tambahan untuk deteksi menu aktif

export default function WriterLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Untuk cek kita sedang di halaman mana

  // 1. PROTEKSI: Hanya WRITER yang boleh masuk
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role !== 'WRITER') {
      if (session.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="p-32 text-center">Memuat data penulis...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-black">
      
      {/* SIDEBAR PENULIS */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 pt-32 hidden md:block flex-shrink-0 fixed h-full z-10 top-0 left-0 overflow-y-auto">
        
        <div className="mb-8 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu Penulis</span>
        </div>
        
        <nav className="space-y-2 text-sm font-bold uppercase tracking-widest">
          {/* MENU 1: BERANDA */}
          <Link 
            href="/dashboard/writer" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === '/dashboard/writer' 
                ? 'bg-black text-white shadow-md' 
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
            <span>🏠</span> Beranda
          </Link>

          {/* MENU 2: TULISAN SAYA (Arahkan ke list tulisan) */}
          <Link 
            href="/dashboard/writer/posts" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname.includes('/dashboard/writer/posts') 
                ? 'bg-black text-white shadow-md' 
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
            <span>📝</span> Tulisan Saya
          </Link>

          {/* MENU 3: TULIS BARU (Arahkan ke editor) */}
          <Link 
            href="/dashboard/writer/create" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === '/dashboard/writer/create' 
                ? 'bg-black text-white shadow-md' 
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
             <span>➕</span> Tulis Baru
          </Link>
          
          {/* TOMBOL KELUAR SUDAH DIHAPUS DARI SINI */}
          {/* Karena user bisa logout lewat menu Profil di Header kanan atas */}
        </nav>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 md:ml-64 min-h-screen p-8 pt-32 transition-all duration-300">
        {children} 
      </main>
      
    </div>
  );
}