// app/dashboard/admin/approval/page.tsx
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

// UPDATE: Menambahkan 'content' dan 'image' agar bisa dibaca di Modal
interface Article {
  id: string;
  title: string;
  category: string;
  content: string;      // <-- Tambahan
  image: string | null; // <-- Tambahan
  createdAt: string;
  author: {
    name: string | null;
    email: string;
  };
}

export default function ApprovalPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE BARU: Untuk menyimpan artikel yang sedang dibaca (Modal)
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  // 1. Fetch Artikel
  const fetchPendingArticles = async () => {
    try {
      const res = await fetch('/api/admin/pending-list');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  // 2. Fungsi Tombol Approve/Reject
  const handleAction = async (articleId: string, action: 'APPROVE' | 'REJECT') => {
    // Jika sedang baca, tutup dulu modalnya
    if (readingArticle) setReadingArticle(null);

    if(!confirm(`Yakin ingin ${action === 'APPROVE' ? 'menerbitkan' : 'menolak'} artikel ini?`)) return;

    try {
        const res = await fetch('/api/admin/approve', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId, action })
        });

        if (res.ok) {
            alert(`Sukses! Artikel berhasil di-${action === 'APPROVE' ? 'terbitkan' : 'tolak'}.`);
            // Refresh list
            setArticles((prev) => prev.filter((a) => a.id !== articleId));
        } else {
            alert("Gagal memproses.");
        }
    } catch (error) {
        alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="relative">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Persetujuan Redaksi</h1>
        <p className="text-gray-500 text-sm">Review tulisan masuk sebelum diterbitkan ke publik.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Memuat data...</div>
      ) : (
        <div className="space-y-6">
            {articles.length === 0 ? (
                <div className="bg-white p-10 text-center border border-gray-200 rounded-lg">
                    <p className="text-gray-400 font-bold uppercase tracking-widest">Tidak ada artikel menunggu review</p>
                    <p className="text-xs text-gray-400 mt-2">Kerja bagus! Semua antrian sudah bersih.</p>
                </div>
            ) : (
                articles.map((article) => (
                    <div key={article.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                                    PENDING REVIEW
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {article.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-serif font-bold mb-2">{article.title}</h3>
                            <div className="text-xs text-gray-500 flex gap-4">
                                <span>✍️ {article.author.name || article.author.email}</span>
                                <span>📅 {new Date(article.createdAt).toLocaleDateString("id-ID")}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* TOMBOL BACA (Sekarang Berfungsi) */}
                            <button 
                                onClick={() => setReadingArticle(article)}
                                className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded"
                            >
                                BACA
                            </button>
                            
                            <button 
                                onClick={() => handleAction(article.id, 'REJECT')}
                                className="px-4 py-2 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-widest hover:bg-red-200 rounded"
                            >
                                TOLAK
                            </button>

                            <button 
                                onClick={() => handleAction(article.id, 'APPROVE')}
                                className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shadow-md rounded"
                            >
                                ✓ TERBITKAN
                            </button>
                        </div>

                    </div>
                ))
            )}
        </div>
      )}

      {/* --- MODAL / POPUP BACA ARTIKEL --- */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col">
                
                {/* Header Modal */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview Artikel</span>
                    <button 
                        onClick={() => setReadingArticle(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Konten Modal */}
                <div className="p-8">
                    <span className="inline-block py-1 px-2 border border-black text-[9px] font-bold uppercase tracking-wider mb-4">
                        {readingArticle.category}
                    </span>
                    
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
                        {readingArticle.title}
                    </h2>

                    {/* Gambar (Jika ada) */}
                    {readingArticle.image && (
                        <div className="relative w-full aspect-video mb-8 bg-gray-100 overflow-hidden rounded-sm">
                            <img 
                                src={readingArticle.image} 
                                alt={readingArticle.title} 
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    {/* Isi Artikel (Preserve Whitespace) */}
                    <div className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {readingArticle.content}
                    </div>
                </div>

                {/* Footer Modal (Aksi Cepat) */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3 z-10">
                    <button 
                        onClick={() => setReadingArticle(null)}
                        className="px-6 py-3 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-white rounded"
                    >
                        Tutup
                    </button>
                    <button 
                         onClick={() => handleAction(readingArticle.id, 'APPROVE')}
                         className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 rounded shadow-lg"
                    >
                        ✓ Setujui & Terbitkan
                    </button>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}