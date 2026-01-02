// app/dashboard/writer/page.tsx
'use client';

import { useSession } from "next-auth/react";

export default function WriterDashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <header className="mb-10 flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Selamat Datang, Penulis!</h1>
            <p className="text-gray-500">Mari berkarya dan menyuarakan keadilan lewat tulisan.</p>
        </div>
        <button className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
            + Mulai Menulis
        </button>
      </header>

      {/* Area Statistik Kosong */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Artikel Terbit</div>
            <div className="text-4xl font-serif">0</div>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Menunggu Review</div>
            <div className="text-4xl font-serif">0</div>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Total Pembaca</div>
            <div className="text-4xl font-serif">0</div>
        </div>
      </div>

      {/* Pesan Penyemangat */}
      <div className="bg-blue-50 border border-blue-100 p-8 rounded-lg text-center">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Belum ada tulisan?</h3>
        <p className="text-blue-700 mb-6 max-w-lg mx-auto">
            Gagasan hebat Anda layak didengar. Mulailah menulis artikel hukum pertama Anda hari ini.
        </p>
      </div>
    </div>
  );
}