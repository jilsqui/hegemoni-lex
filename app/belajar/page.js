'use client'; // Wajib ada karena kita pakai interaksi tombol (State)

import { useState } from 'react';
import Link from 'next/link';

// 1. Data Dummy Artikel (Ceritanya ini dari Database)
const articles = [
  {
    id: 1,
    title: "Kenapa Kita Harus Berhenti di Lampu Merah?",
    excerpt: "Yuk cari tahu alasan kenapa lampu merah itu penting buat keselamatan kita!",
    level: "SD",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    date: "27 Nov 2025"
  },
  {
    id: 2,
    title: "Aturan Baru SIM C untuk Pengendara Motor",
    excerpt: "Pihak kepolisian mengeluarkan aturan baru penggolongan SIM C berdasarkan cc motor.",
    level: "Umum",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    date: "26 Nov 2025"
  },
  {
    id: 3,
    title: "Analisis Yuridis UU ITE Pasal 27 Ayat 3",
    excerpt: "Membedah unsur pidana pencemaran nama baik dalam perspektif hukum pidana modern.",
    level: "Kuliah",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    date: "25 Nov 2025"
  },
  {
    id: 4,
    title: "Bullying di Sekolah: Apa Sanksinya?",
    excerpt: "Jangan diam saja! Ketahui hakmu dan konsekuensi hukum bagi pelaku perundungan.",
    level: "SMP",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    date: "24 Nov 2025"
  },
  {
    id: 5,
    title: "Hak Cipta Konten di TikTok & Instagram",
    excerpt: "Boleh gak sih asal comot lagu orang buat konten? Simak aturan mainnya di sini.",
    level: "SMA",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    date: "23 Nov 2025"
  }
];

export default function Home() {
  // State untuk menyimpan filter yang sedang aktif
  const [activeFilter, setActiveFilter] = useState("Semua");

  // Logic pemfilteran artikel
  const filteredArticles = activeFilter === "Semua" 
    ? articles 
    : articles.filter(item => item.level === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* 2. Navbar Sederhana */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold text-xl text-gray-800">🏛️ HukumKita.id</div>
        <div className="text-sm text-gray-500">Masuk / Daftar</div>
      </nav>

      {/* 3. Hero Section (Berita Utama) */}
      <header className="bg-white p-6 md:p-12 border-b border-gray-200 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Melek Hukum, <span className="text-blue-600">Mulai Sekarang.</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Pusat edukasi dan informasi hukum terlengkap di Indonesia untuk semua kalangan usia.
        </p>
      </header>

      {/* 4. Filter Bar */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {["Semua", "SD", "SMP", "SMA", "Kuliah", "Umum"].map((kategori) => (
            <button
              key={kategori}
              onClick={() => setActiveFilter(kategori)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === kategori
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {kategori}
            </button>
          ))}
        </div>

        {/* 5. Grid Artikel (Konten) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link href={`/belajar/${article.level.toLowerCase()}`} key={article.id} className="group">
              <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col">
                {/* Gambar Placeholder */}
                <div className="h-48 bg-gray-200 w-full relative">
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                     [Gambar Artikel]
                   </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Badge Level */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${article.color}`}>
                      {article.level}
                    </span>
                    <span className="text-xs text-gray-400">{article.date}</span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                    {article.excerpt}
                  </p>
                  
                  <div className="text-blue-600 text-sm font-semibold flex items-center gap-1 mt-auto">
                    Baca Selengkapnya →
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Pesan jika filter kosong */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Belum ada artikel untuk kategori ini.
          </div>
        )}
      </div>
    </div>
  );
}