// app/artikel/page.tsx
import { prisma } from '@/lib/prisma';
import ArticleListClient from '@/components/ArticleListClient';

export const revalidate = 0;

export default async function ArchivePage() {
  
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true, email: true } } },
    // viewCount is included by default as a scalar field
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans selection:bg-black selection:text-white pb-20 relative overflow-hidden">
      
      {/* === BACKGROUND BLUR EFFECTS (AMBIENT) === */}
      <div className="fixed -top-20 -right-20 w-[600px] h-[600px] bg-gray-200/60 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-multiply" />
      <div className="fixed -bottom-20 -left-20 w-[500px] h-[500px] bg-gray-300/40 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-multiply" />
      
      {/* PERBAIKAN: 
          1. Kode <nav> dihapus total agar tidak bentrok dengan Navbar Global.
          2. <main> diberi padding-top (pt-32) agar konten turun ke bawah & tidak ketutupan navbar.
      */}

      <main className="max-w-7xl mx-auto px-6 relative z-10 pt-32">
        
        {/* JUDUL HALAMAN */}
        <div className="mb-12 border-b border-black/10 pb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                Arsip Publikasi
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-medium text-gray-900 tracking-tight">
                Semua Artikel
            </h1>
        </div>

        {/* PEMANGGILAN KOMPONEN CLIENT (GRID ARTIKEL) */}
        <ArticleListClient initialArticles={articles} />

      </main>

      {/* FOOTER MINI */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-200/60 text-center relative z-10">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2026 Hegemoni Lex Archive</p>
      </footer>
    </div>
  );
}