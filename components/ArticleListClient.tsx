// components/ArticleListClient.tsx
'use client';

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPreviewText } from "@/lib/utils";

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

const categories = [
  "SEMUA",
  "LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA",
  "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA",
  "RESENSI BUKU", "RESENSI FILM",
  "REGULASI", "EKONOMI PUBLIK", "SOSIAL & BUDAYA",
  "LINGKUNGAN", "PENDIDIKAN", "KESEHATAN",
  "TEKNOLOGI DAN DIGITAL", "POLITIK DAN PEMERINTAHAN"
];

type Props = {
  initialArticles: Article[];
  currentPage: number;
  pageSize: number;
  totalArticles: number;
  initialQuery: string;
  isCategoryQuery: boolean;
};

export default function ArticleListClient({
  initialArticles,
  currentPage,
  pageSize,
  totalArticles,
  initialQuery,
  isCategoryQuery,
}: Props) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(isCategoryQuery ? "" : initialQuery);
  const selectedCategory = isCategoryQuery && initialQuery ? initialQuery.toUpperCase() : "SEMUA";

  const totalPages = Math.max(1, Math.ceil(totalArticles / pageSize));

  const buildArchiveUrl = (query: string, page: number) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/artikel?${qs}` : "/artikel";
  };

  const handleCategoryChange = (cat: string) => {
    const query = cat === "SEMUA" ? "" : cat;
    setIsAnimating(true);
    setTimeout(() => {
      router.push(buildArchiveUrl(query, 1));
    }, 120);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(buildArchiveUrl(query, 1));
  };

  const paginationItems = useMemo(() => {
    const items: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i += 1) items.push(i);
    return items;
  }, [currentPage, totalPages]);

  return (
    <div>
       {/* --- 1. FILTER BAR (SCROLLABLE) --- */}
       <div className="mb-8 md:mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 md:gap-3 min-w-max">
            {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`
                            px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 border active:scale-95
                            ${isActive 
                                ? "bg-black text-white border-black scale-105 shadow-lg" 
                                : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black active:bg-gray-100"
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
       <form onSubmit={handleSearchSubmit} className="mb-6 md:mb-8 relative max-w-md">
            <input 
                type="text" 
                placeholder="Cari judul artikel..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b-2 border-gray-200 py-3 pr-10 outline-none focus:border-black font-serif transition-colors bg-transparent text-black placeholder:text-gray-400 text-base"
            />
            <span className="absolute right-0 top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
       </form>

       {/* --- 3. GRID ARTIKEL (DENGAN ANIMASI) --- */}
       <div 
          className={`
            grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12 transition-all duration-500 ease-in-out
            ${isAnimating ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"}
          `}
       >
            {initialArticles.length === 0 ? (
             <div className="col-span-full py-20 text-center border border-dashed border-gray-200 rounded-lg bg-white/50">
                <p className="text-xl font-serif italic text-gray-400">
                {initialQuery
                  ? `Tidak ada artikel untuk pencarian "${initialQuery}"`
                        : `Belum ada artikel di kategori ${selectedCategory}.`}
                </p>
                <button 
                onClick={() => router.push('/artikel')}
                    className="mt-4 text-xs font-bold underline"
                >
                    Lihat Semua Artikel
                </button>
             </div>
          ) : (
            initialArticles.map((article) => (
                <Link href={`/artikel/${article.slug}`} key={article.id} className="group cursor-pointer block h-full active:opacity-80">
                    <article className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300">
                    
                    {/* GAMBAR */}
                    <div className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden">
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
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-8 transition-opacity duration-500"></div>
                    </div>

                    <div className="flex-1 flex flex-col p-4 md:p-5">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="rounded-md bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest">
                            {article.category.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] md:text-xs text-gray-400 font-mono">
                            {article.publishedAt 
                                ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : ''}
                        </span>
                        </div>

                        <h3 className="text-lg md:text-xl font-serif font-semibold mb-2 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {article.title}
                        </h3>
                        
                        <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3 font-light mb-4 flex-1">
                        {getPreviewText(article.excerpt, article.content, 150)}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-3 border-t border-gray-100">
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

       {/* --- 4. PAGINATION --- */}
       {totalPages > 1 && (
        <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildArchiveUrl(initialQuery, Math.max(1, currentPage - 1))}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border ${currentPage <= 1 ? 'pointer-events-none opacity-40 border-gray-200 text-gray-400' : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'}`}
          >
            Sebelumnya
          </Link>

          {paginationItems.map((page) => (
            <Link
              key={page}
              href={buildArchiveUrl(initialQuery, page)}
              className={`min-w-9 text-center px-3 py-2 text-xs font-bold border ${page === currentPage ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'}`}
            >
              {page}
            </Link>
          ))}

          <Link
            href={buildArchiveUrl(initialQuery, Math.min(totalPages, currentPage + 1))}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border ${currentPage >= totalPages ? 'pointer-events-none opacity-40 border-gray-200 text-gray-400' : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'}`}
          >
            Berikutnya
          </Link>
        </div>
       )}
    </div>
  );
}