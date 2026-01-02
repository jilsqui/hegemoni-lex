// components/AdminNotification.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type NotificationProps = {
  pendingPosts: any[];   // Data artikel yang menunggu
  recentApproved: any[]; // Data artikel yang baru disetujui
};

export default function AdminNotification({ pendingPosts, recentApproved }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* 1. TOMBOL IKON SURAT */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:shadow-md transition-all relative flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>

        {/* Badge Merah (Jumlah Pending) */}
        {pendingPosts.length > 0 && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm border border-white animate-pulse">
                {pendingPosts.length}
            </div>
        )}
      </button>

      {/* 2. DROPDOWN ISI PESAN */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Header Dropdown */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Notifikasi</span>
                <span className="text-[10px] text-gray-400">{pendingPosts.length} baru</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                
                {/* --- LIST ARTIKEL PENDING (PESAN 1) --- */}
                {pendingPosts.length > 0 ? (
                    pendingPosts.map((post) => (
                        <Link 
                            key={post.id} 
                            href={`/dashboard/admin/posts`} // Arahkan ke halaman kelola
                            className="block px-4 py-3 hover:bg-blue-50 border-b border-gray-50 transition-colors group"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-xs text-gray-800 leading-relaxed">
                                        Penulis <span className="font-bold">{post.author?.name || 'Unknown'}</span> baru saja mengirim artikel:
                                    </p>
                                    <p className="text-xs font-serif font-bold text-black mt-1 line-clamp-1 group-hover:underline">
                                        "{post.title}"
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-2">
                                        {new Date(post.createdAt).toLocaleDateString('id-ID')} • Klik untuk review
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    // Jika tidak ada pending, dan juga tidak ada history
                    recentApproved.length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-xs">
                            Tidak ada notifikasi baru.
                        </div>
                    )
                )}

                {/* --- LIST RIWAYAT APPROVED (PESAN 2) --- */}
                {recentApproved.length > 0 && (
                    <>
                        <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                             <span className="text-[9px] font-bold uppercase text-gray-400">Baru Saja Disetujui</span>
                        </div>
                        {recentApproved.map((post) => (
                            <div key={post.id} className="px-4 py-3 border-b border-gray-50 opacity-70">
                                <div className="flex gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-xs text-gray-600">
                                            Artikel telah <span className="text-green-600 font-bold">DISETUJUI</span> & Tayang:
                                        </p>
                                        <p className="text-xs font-serif text-gray-800 mt-1 line-clamp-1">
                                            "{post.title}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            
            {/* Footer Link */}
            <Link href="/dashboard/admin/activity" className="block text-center py-3 text-[10px] font-bold uppercase text-black hover:bg-gray-50 transition-colors border-t border-gray-100">
                Lihat Semua Aktivitas
            </Link>
        </div>
      )}
    </div>
  );
}