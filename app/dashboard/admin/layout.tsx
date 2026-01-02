// app/dashboard/admin/layout.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // 1. PROTEKSI: Hanya ADMIN yang boleh masuk
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/'); // Tendang user biasa/penulis keluar
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="p-32 text-center">Memuat dashboard admin...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-black">
      
      {/* SIDEBAR ADMIN */}
      {/* PERBAIKAN: Hapus 'pt-32'. Cukup 'p-6' saja. */}
      <aside className="w-64 bg-black text-white p-6 hidden md:block flex-shrink-0 fixed h-full z-10 top-0 left-0 overflow-y-auto">
        
        {/* Header Sidebar (Logo Kecil / Judul) */}
        <div className="mb-8 px-2 border-b border-gray-700 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Panel Kontrol</span>
        </div>
        
        <nav className="space-y-2 text-xs font-bold uppercase tracking-widest">
          {/* MENU 1: DASHBOARD */}
          <Link 
            href="/dashboard/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                pathname === '/dashboard/admin' 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>📊</span> Dashboard
          </Link>

          {/* MENU 2: KELOLA ARTIKEL (Ganti istilah Approval jadi Kelola Artikel biar konsisten) */}
          <Link 
            href="/dashboard/admin/posts" 
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                pathname.includes('/dashboard/admin/posts') 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>⚖️</span> Kelola Artikel
          </Link>

          {/* MENU 3: KELOLA USER */}
          <Link 
            href="/dashboard/admin/users" 
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                pathname.includes('/dashboard/admin/users') 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
             <span>👥</span> Kelola User
          </Link>
          
          <div className="pt-8 mt-8 border-t border-gray-800">
            <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors w-full text-left rounded"
            >
                <span>🚪</span> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* KONTEN UTAMA */}
      {/* PERBAIKAN: Hapus 'pt-32'. Gunakan padding normal 'p-0' karena di page.tsx sudah ada padding. */}
      <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300">
        {children} 
      </main>
      
    </div>
  );
}