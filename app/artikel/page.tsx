// app/artikel/page.tsx
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import ArticleListClient from '@/components/ArticleListClient';

export const revalidate = 180;

const PAGE_SIZE = 18;
const CATEGORIES = [
  'LEGISLASI', 'OPINI', 'HUKUM PERDATA', 'HUKUM PIDANA',
  'BISNIS', 'KETENAGAKERJAAN', 'HAK ASASI MANUSIA',
  'RESENSI BUKU', 'RESENSI FILM',
  'REGULASI', 'EKONOMI PUBLIK', 'SOSIAL & BUDAYA',
  'LINGKUNGAN', 'PENDIDIKAN', 'KESEHATAN',
  'TEKNOLOGI DAN DIGITAL', 'POLITIK DAN PEMERINTAHAN',
];

interface ArchivePageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const rawQuery = (params.q || '').trim();
  const normalizedQuery = rawQuery.toUpperCase();
  const isCategoryQuery = CATEGORIES.includes(normalizedQuery);

  const requestedPage = Number.parseInt(params.page || '1', 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let resolvedPage = currentPage;

  let articles: any[] = [];
  let totalArticles = 0;

  try {
    const baseWhere: any = { status: 'PUBLISHED', isArchived: false };

    const whereClause = rawQuery
      ? isCategoryQuery
        ? {
            ...baseWhere,
            OR: [
              { category: normalizedQuery },
              { category: normalizedQuery.replace(/ /g, '_') },
            ],
          }
        : {
            ...baseWhere,
            OR: [
              { title: { contains: rawQuery, mode: 'insensitive' } },
              { content: { contains: rawQuery, mode: 'insensitive' } },
            ],
          }
      : baseWhere;

    totalArticles = await prisma.article.count({ where: whereClause });

    const totalPages = Math.max(1, Math.ceil(totalArticles / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    resolvedPage = safePage;
    const skip = (safePage - 1) * PAGE_SIZE;

    articles = await prisma.article.findMany({
      where: whereClause,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: { author: { select: { name: true, email: true } } },
      skip,
      take: PAGE_SIZE,
    });
  } catch (error) {
    console.error('Archive page DB fallback:', error);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans selection:bg-black selection:text-white pb-20 relative overflow-hidden">
      
      {/* === BACKGROUND BLUR EFFECTS (AMBIENT) === */}
      <div className="hidden md:block fixed -top-20 -right-20 w-[600px] h-[600px] bg-gray-200/60 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-multiply" />
      <div className="hidden md:block fixed -bottom-20 -left-20 w-[500px] h-[500px] bg-gray-300/40 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-multiply" />
      
      {/* PERBAIKAN: 
          1. Kode <nav> dihapus total agar tidak bentrok dengan Navbar Global.
          2. <main> diberi padding-top (pt-32) agar konten turun ke bawah & tidak ketutupan navbar.
      */}

      <main className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 pt-20 md:pt-32">
        
        {/* JUDUL HALAMAN */}
        <div className="mb-8 md:mb-12 border-b border-black/10 pb-6 md:pb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                Arsip Publikasi
            </span>
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-serif font-medium text-gray-900 tracking-tight">
                Semua Artikel
            </h1>
        </div>

        {/* PEMANGGILAN KOMPONEN CLIENT (GRID ARTIKEL) */}
        <Suspense fallback={<div className="text-sm text-gray-400">Memuat artikel...</div>}>
          <ArticleListClient
            initialArticles={articles}
            currentPage={resolvedPage}
            pageSize={PAGE_SIZE}
            totalArticles={totalArticles}
            initialQuery={rawQuery}
            isCategoryQuery={isCategoryQuery}
          />
        </Suspense>

      </main>

      {/* FOOTER MINI */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-20 pt-6 md:pt-8 border-t border-gray-200/60 text-center relative z-10">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2026 Hegemoni Lex Archive</p>
      </footer>
    </div>
  );
}