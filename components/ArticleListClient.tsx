// components/ArticleListClient.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Tipe data artikel
type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  viewCount?: number;
  publishedAt: Date | null;
  author: {
    name: string | null;
    email: string;
  };
};

export default function ArticleListClient({ initialArticles }: { initialArticles: Article[] }) {
  const searchParams = useSearchParams();
  
  // Daftar Kategori
  const categories = [
    "SEMUA",
    "LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", 
    "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"
  ];

  // STATE
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // LOGIKA UTAMA: Deteksi perubahan URL (Navbar)
  useEffect(() => {
    const paramQ = searchParams.get("q") || ""; // Ambil nilai ?q=...

    if (paramQ) {
      // Cek apakah 'q' ini adalah salah satu nama Kategori?
      const isCategory = categories.includes(paramQ);

      if (isCategory) {
        // Jika YA: Aktifkan tombol kategori, kosongkan search
        setSelectedCategory(paramQ);
        setSearchQuery("");
      } else {
        // Jika TIDAK: Anggap sebagai pencarian judul, reset kategori ke SEMUA
        setSelectedCategory("SEMUA");
        setSearchQuery(paramQ);
      }
    } else {
      // Jika URL kosong, reset ke default
      setSelectedCategory("SEMUA");
      setSearchQuery("");
    }
  }, [searchParams]); // Jalankan setiap kali URL berubah

  // LOGIKA FILTER DATA
  const filteredArticles = initialArticles.filter((article) => {
    // 1. Cek Kategori
    // (Replace spasi dengan underscore karena di Database biasanya HUKUM_PERDATA)
    const dbCategory = article.category.replace(/_/g, " "); 
    const matchCategory = selectedCategory === "SEMUA" 
      ? true 
      : dbCategory === selectedCategory;

    // 2. Cek Pencarian (Judul)
    const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  // Fungsi Manual Klik Kategori (di halaman itu sendiri)
  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    
    setIsAnimating(true); 
    setTimeout(() => {
        setSelectedCategory(cat);
        setSearchQuery(""); // Kosongkan search bar jika user klik kategori
        setIsAnimating(false);
    }, 200); 
  };

  return (
    <div>
       {/* --- 1. FILTER BAR (SCROLLABLE) --- */}
       <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`
                            px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 border
                            ${isActive 
                                ? "bg-black text-white border-black scale-105 shadow-lg" 
                                : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                            }
                        `}
                    >
                        {cat}
                    </button>
                );
            })}
          </div>
       </div>

       {/* --- 2. SEARCH BAR --- */}
       <div className="mb-8 relative max-w-md">
            <input 
                type="text" 
                placeholder="Cari judul artikel..." 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Jika user mengetik, otomatis reset kategori ke SEMUA agar pencarian global
                    if(selectedCategory !== "SEMUA") setSelectedCategory("SEMUA");
                }}
                className="w-full border-b-2 border-gray-200 py-3 pr-10 outline-none focus:border-black font-serif transition-colors bg-transparent text-black placeholder:text-gray-400"
            />
            <span className="absolute right-0 top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
       </div>

       {/* --- 3. GRID ARTIKEL (DENGAN ANIMASI) --- */}
       <div 
          className={`
            grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 transition-all duration-500 ease-in-out
            ${isAnimating ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"}
          `}
       >
          {filteredArticles.length === 0 ? (
             <div className="col-span-full py-20 text-center border border-dashed border-gray-200 rounded-lg bg-white/50">
                <p className="text-xl font-serif italic text-gray-400">
                    {searchQuery 
                        ? `Tidak ada artikel dengan judul "${searchQuery}"` 
                        : `Belum ada artikel di kategori ${selectedCategory}.`}
                </p>
                <button 
                    onClick={() => { setSelectedCategory("SEMUA"); setSearchQuery(""); }}
                    className="mt-4 text-xs font-bold underline"
                >
                    Lihat Semua Artikel
                </button>
             </div>
          ) : (
            filteredArticles.map((article) => (
                <Link href={`/artikel/${article.slug}`} key={article.id} className="group cursor-pointer block h-full">
                    <article className="flex flex-col h-full">
                    
                    {/* GAMBAR */}
                    <div className="aspect-[4/3] w-full bg-gray-100 border border-gray-200 mb-5 relative overflow-hidden hover-elegant">
                        {article.image ? (
                            <img 
                                src={article.image} 
                                alt={article.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-serif italic text-2xl">
                            Hegemoni Lex
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                        <span className="bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                            {article.category.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                            {article.publishedAt 
                                ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : ''}
                        </span>
                        </div>

                        <h3 className="text-2xl font-serif font-medium mb-3 leading-snug group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
                        {article.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 font-light mb-4">
                        {article.excerpt || article.content.substring(0, 150) + "..."}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <span>Oleh {article.author.name || "Redaksi"}</span>
                            {typeof article.viewCount === 'number' && (
                              <span className="flex items-center gap-1 text-gray-400">
                                👁 {article.viewCount.toLocaleString()}
                              </span>
                            )}
                        </div>
                    </div>
                    </article>
                </Link>
            ))
          )}
       </div>
    </div>
  );
}