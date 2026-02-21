// app/artikel/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ArticleRating from '@/components/ArticleRating';
import ViewCounter from '@/components/ViewCounter';
import { notFound } from 'next/navigation';

// Agar halaman ini selalu mengambil data terbaru (tidak cache mati)
export const revalidate = 0;

// UPDATE: Tipe props untuk Next.js 15 (params adalah Promise)
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  
  // 1. SOLUSI ERROR: Await params sebelum digunakan
  const { slug } = await params; 

  // 2. Cek jika slug kosong (mencegah error Prisma)
  if (!slug) {
     return notFound();
  }

  // 3. AMBIL DATA DARI DATABASE
  const article = await prisma.article.findUnique({
    where: {
      slug: slug, // Sekarang slug sudah pasti ada isinya
      status: 'PUBLISHED', 
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  // 4. JIKA ARTIKEL TIDAK DITEMUKAN
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
         <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-gray-200">404</h1>
         <h2 className="font-serif text-2xl font-bold mb-6">Artikel Tidak Ditemukan</h2>
         <p className="text-gray-500 mb-8 text-center max-w-md text-sm leading-relaxed">
           Mungkin artikel ini telah dihapus, ditarik oleh redaksi, atau link yang Anda tuju salah.
         </p>
         <Link href="/" className="border-b border-black pb-1 text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
           ← KEMBALI KE BERANDA
         </Link>
      </div>
    );
  }

  // 5. JIKA DITEMUKAN: TAMPILKAN ARTIKEL
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      
      {/* View Counter (invisible, tracks views) */}
      <ViewCounter articleId={article.id} />
      
      <article className="max-w-3xl mx-auto px-4 md:px-6 pt-20 md:pt-28">
        
        {/* KATEGORI & TANGGAL */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 border-b border-gray-100 pb-6">
            <span className="bg-black text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                {article.category}
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">
                {article.publishedAt 
                  ? new Date(article.publishedAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
                  : ''}
            </span>
        </div>

        {/* JUDUL UTAMA */}
        <h1 className="text-2xl md:text-5xl font-serif font-bold leading-tight mb-6 md:mb-8 text-gray-900">
            {article.title}
        </h1>

        {/* INFO PENULIS */}
        <div className="flex items-center gap-3 mb-8 md:mb-10">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-serif font-bold text-gray-500">
                {(article.author.name || article.author.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wide">
                    {article.author.name || "Tim Redaksi"}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Penulis
                </span>
            </div>
        </div>

        {/* GAMBAR UTAMA */}
        {article.image && (
            <div className="w-full aspect-video bg-gray-100 mb-8 md:mb-12 relative overflow-hidden border border-black">
                <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                />
            </div>
        )}

        {/* ISI KONTEN */}
        <div className="prose prose-base md:prose-lg prose-gray max-w-none font-serif leading-relaxed text-gray-800 whitespace-pre-wrap first-letter:text-4xl md:first-letter:text-5xl first-letter:font-bold first-letter:mr-2 md:first-letter:mr-3 first-letter:float-left">
            {article.content}
        </div>

      </article>

{/* --- FITUR RATING --- */}
<div className="max-w-xl mx-auto px-4 md:px-0">
    <ArticleRating articleId={article.id} />
</div>

      {/* FOOTER KECIL */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12 md:mt-20 pt-10 border-t border-black">
        <p className="text-center text-[10px] uppercase tracking-widest text-gray-400">
            © 2026 Hegemoni Lex Portal
        </p>
      </div>
    </div>
  );
}