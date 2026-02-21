// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ScrollPopOut from '@/components/ScrollPopOut';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  
  // 1. AMBIL FOKUS UTAMA (Featured)
  let featuredArticle = await prisma.article.findFirst({
    where: { 
        status: 'PUBLISHED',
        isFeatured: true 
    },
    include: { author: true }
  });

  // Fallback: Jika admin lupa set fokus utama, ambil artikel published paling baru
  if (!featuredArticle) {
    featuredArticle = await prisma.article.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: { author: true }
    });
  }

  // 2. AMBIL ARTIKEL TERBARU (Kecuali featured)
  const latestArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { id: featuredArticle?.id || '' }
    },
    orderBy: { publishedAt: 'desc' },
    take: 9, 
    include: { author: { select: { name: true } } },
  });

  // 3. AMBIL ARTIKEL POPULER (by viewCount)
  const popularArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { viewCount: 'desc' },
    take: 5,
    include: { author: { select: { name: true } } },
  });

  // 4. AMBIL TRENDING (4 artikel terbaru untuk strip sidebar, exclude featured)
  const trendingArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { id: featuredArticle?.id || '' }
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
  });

  // Helper: format tanggal
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* ================================================================ */}
      {/* 1. HERO SECTION - MAGAZINE STYLE (Terinspirasi antinomi.org)     */}
      {/* ================================================================ */}
      <header className="pt-28 border-b border-gray-200">
        
        {/* FEATURED ARTICLE - Full Width Hero */}
        {featuredArticle ? (
          <div className="relative">
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-gray-200">
                
                {/* LEFT: Featured Image */}
                <div className="lg:col-span-7 relative min-h-[350px] lg:min-h-[480px] bg-gray-100 overflow-hidden group">
                  {featuredArticle.image ? (
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                      <span className="font-serif text-white/20 text-6xl italic">HL</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-white text-black px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
                        {featuredArticle.category}
                      </span>
                      <span className="text-white/70 text-[10px] font-mono uppercase">
                        {formatDate(featuredArticle.publishedAt)}
                      </span>
                    </div>
                    <Link href={`/artikel/${featuredArticle.slug}`}>
                      <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight mb-4 hover:underline decoration-2 underline-offset-4">
                        {featuredArticle.title}
                      </h1>
                    </Link>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-xl line-clamp-2 font-light">
                      {featuredArticle.excerpt || featuredArticle.content.substring(0, 160) + "..."}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {featuredArticle.author.name?.charAt(0) || 'R'}
                      </div>
                      <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                        {featuredArticle.author.name || 'Tim Redaksi'}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-black text-white py-2 px-4 z-10">
                    <div className="text-[9px] uppercase tracking-widest font-bold">Fokus Utama</div>
                  </div>
                </div>

                {/* RIGHT: Sidebar Latest Articles */}
                <div className="lg:col-span-5 bg-white flex flex-col divide-y divide-gray-200 border-l border-gray-200">
                  {trendingArticles.length > 0 ? trendingArticles.map((article, index) => (
                    <Link 
                      key={article.id} 
                      href={`/artikel/${article.slug}`}
                      className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group/item flex-1"
                    >
                      <span className="text-3xl font-serif font-bold text-gray-200 group-hover/item:text-black transition-colors leading-none mt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">
                          {article.category}
                        </span>
                        <h3 className="text-sm font-serif font-bold leading-snug line-clamp-2 group-hover/item:underline decoration-1 underline-offset-2">
                          {article.title}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono mt-2 block">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      {article.image && (
                        <div className="w-16 h-16 bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img src={article.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </Link>
                  )) : (
                    <div className="flex items-center justify-center h-full text-gray-300 font-serif italic p-8">
                      Belum ada artikel terbaru lainnya
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-600">
              Portal Hukum Independen
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light leading-snug mb-8 text-gray-900 tracking-wide">
              Kritis. Berdaya. <span className="font-normal italic border-b border-black pb-1">Berkeadilan.</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed font-light">
              Wadah kolektif untuk diskursus hukum, legislasi, dan hak asasi manusia di Indonesia.
            </p>
          </div>
        )}

        {/* CATEGORY TICKER / MARQUEE BAR */}
        <div className="bg-black text-white py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {["LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA", "LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"].map((cat, i) => (
              <Link 
                key={i} 
                href={`/artikel?q=${cat}`} 
                className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] mx-6 hover:text-gray-300 transition-colors"
              >
                {cat} <span className="text-gray-600 mx-2">•</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* 2. INTERACTIVE QUOTE BAR                                         */}
      {/* ================================================================ */}
      <div className="bg-gray-50 text-black py-10 px-6 border-b border-gray-200 flex justify-center items-center group cursor-help transition-colors duration-500 hover:bg-white">
        <div className="relative h-16 w-full max-w-4xl flex items-center justify-center overflow-hidden">
            <h2 className="absolute transition-all duration-500 ease-in-out opacity-100 group-hover:opacity-0 group-hover:blur-md group-hover:-translate-y-4 font-serif text-xl md:text-2xl italic tracking-wide z-10 text-center text-gray-700">
              &ldquo;Fiat Justitia Ruat Caelum&rdquo;
            </h2>
            <p className="absolute transition-all duration-700 ease-out delay-100 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 text-center leading-relaxed z-10 px-4">
              Hendaklah keadilan ditegakkan, walaupun langit akan runtuh.
            </p>
        </div>
      </div>
      
      {/* ================================================================ */}
      {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT (Articles + Sidebar)            */}
      {/* ================================================================ */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Publikasi Terbaru */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-gray-200 pb-6 gap-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Artikel</span>
                <h2 className="text-3xl md:text-4xl font-serif font-medium leading-none">Publikasi Terbaru</h2>
              </div>
              <Link href="/artikel" className="text-[10px] font-bold hover:underline decoration-1 underline-offset-4 uppercase tracking-widest text-gray-500 hover:text-black">
                LIHAT SEMUA →
              </Link>
            </div>

            {latestArticles.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300">
                <p className="text-gray-400 font-serif italic text-xl">Belum ada artikel publikasi lainnya.</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-gray-100">
                {/* FIRST ARTICLE: Large Card */}
                {latestArticles[0] && (
                  <ScrollPopOut>
                  <Link href={`/artikel/${latestArticles[0].slug}`} className="group block pb-8">
                    <article>
                      {latestArticles[0].image && (
                        <div className="aspect-[16/9] w-full bg-gray-100 mb-5 relative overflow-hidden">
                          <img 
                            src={latestArticles[0].image} 
                            alt={latestArticles[0].title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                          {latestArticles[0].category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(latestArticles[0].publishedAt)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          oleh <span className="font-bold text-gray-600">{latestArticles[0].author.name || 'Redaksi'}</span>
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3 leading-snug group-hover:underline decoration-1 underline-offset-4">
                        {latestArticles[0].title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-light max-w-2xl">
                        {latestArticles[0].excerpt || latestArticles[0].content.substring(0, 200) + "..."}
                      </p>
                    </article>
                  </Link>
                  </ScrollPopOut>
                )}

                {/* REST OF ARTICLES: Compact List Style */}
                {latestArticles.slice(1).map((article) => (
                  <ScrollPopOut key={article.id}>
                  <Link href={`/artikel/${article.slug}`} className="group flex gap-5 py-6 items-start">
                    {article.image && (
                      <div className="w-32 h-24 md:w-40 md:h-28 bg-gray-100 flex-shrink-0 overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-black text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest">
                          {article.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-serif font-bold leading-snug group-hover:underline decoration-1 underline-offset-2 line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-light hidden md:block">
                        {article.excerpt || article.content.substring(0, 120) + "..."}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {article.author.name || 'Tim Redaksi'}
                      </span>
                    </div>
                  </Link>
                  </ScrollPopOut>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <aside className="lg:col-span-4">
            
            {/* POPULER SECTION */}
            <div className="mb-12 sticky top-28">
              <div className="border-b-2 border-black pb-3 mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Populer</h3>
              </div>
              
              {popularArticles.length > 0 ? (
                <div className="space-y-0 divide-y divide-gray-100">
                  {popularArticles.map((article, index) => (
                    <Link 
                      key={article.id} 
                      href={`/artikel/${article.slug}`}
                      className="group flex gap-4 py-4 items-start"
                    >
                      <span className="text-2xl font-serif font-bold text-gray-200 group-hover:text-black transition-colors leading-none mt-0.5 w-8 flex-shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                          {article.category}
                        </span>
                        <h4 className="text-sm font-serif font-bold leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-gray-400">
                            {article.author.name || 'Redaksi'}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {article.viewCount} views
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-sm italic font-serif">Belum ada data.</p>
              )}

              {/* KATEGORI SECTION */}
              <div className="mt-12">
                <div className="border-b-2 border-black pb-3 mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Kategori</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"].map((cat) => (
                    <Link 
                      key={cat}
                      href={`/artikel?q=${cat}`}
                      className="text-[9px] font-bold uppercase tracking-widest border border-gray-200 px-3 py-2 hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* TENTANG KAMI MINI */}
              <div className="mt-12 bg-gray-50 border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-8 h-8">
                    <Image src="/logohl.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <span className="font-serif font-bold text-sm">Hegemoni Lex</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Ruang perjumpaan gagasan hukum untuk membongkar sekat-sekat ketidaktahuan. Kritis, Berdaya, Berkeadilan.
                </p>
                <Link href="/tentang-kami/tim-kami" className="text-[9px] font-bold uppercase tracking-widest hover:underline">
                  TENTANG KAMI →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ================================================================ */}
      {/* 4. FOOTER                                                        */}
      {/* ================================================================ */}
      <footer className="bg-black text-white py-20 px-6 font-sans border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-16">
          
          {/* KOLOM 1: Brand & Deskripsi */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image src="/logohl.png" alt="Hegemoni LEX Logo" fill className="object-contain invert"/>
              </div>
              <div className="text-xl font-serif font-bold">Hegemoni LEX</div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-light mb-6">
              Ruang perjumpaan gagasan hukum untuk membongkar sekat-sekat ketidaktahuan. Kritis, Berdaya, Berkeadilan.
            </p>
            <div className="flex gap-4">
                <a href="#" className="text-[10px] font-bold border border-gray-700 px-3 py-1 hover:bg-white hover:text-black transition">INSTAGRAM</a>
                <a href="#" className="text-[10px] font-bold border border-gray-700 px-3 py-1 hover:bg-white hover:text-black transition">LINKEDIN</a>
            </div>
          </div>
          
          {/* GRID MENU LINK */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20">
            
            {/* Kolom Menu 1: TENTANG */}
            <div>
              <h4 className="font-bold mb-6 text-[10px] tracking-[0.2em] text-gray-500 uppercase">Tentang</h4>
              <ul className="space-y-4 text-xs font-bold tracking-wider text-gray-300">
                <li><Link href="/tentang-kami/tim-kami" className="hover:text-white hover:underline transition">TIM KAMI</Link></li>
                <li><Link href="/hubungi-kami" className="hover:text-white hover:underline transition">HUBUNGI KAMI</Link></li>
                <li><Link href="/dashboard/writer/create" className="hover:text-white hover:underline transition">KIRIM TULISAN</Link></li>
                <li><Link href="/galeri" className="hover:text-white hover:underline transition">GALERI</Link></li>
                <li><Link href="/artikel" className="hover:text-white hover:underline transition">PUBLIKASI</Link></li>
              </ul>
            </div>

            {/* Kolom Menu 2: DUKUNG KAMI */}
            <div>
              <h4 className="font-bold mb-6 text-[10px] tracking-[0.2em] text-gray-500 uppercase">Dukung Kami</h4>
              <ul className="space-y-4 text-xs font-bold tracking-wider text-gray-300">
                <li><Link href="/donasi" className="hover:text-white hover:underline transition">DONASI</Link></li>
                <li><Link href="/merch" className="hover:text-white hover:underline transition">MERCH</Link></li>
              </ul>
            </div>

            {/* Kolom Menu 3: INFORMASI */}
            <div>
              <h4 className="font-bold mb-6 text-[10px] tracking-[0.2em] text-gray-500 uppercase">Informasi</h4>
              <ul className="space-y-4 text-xs font-bold tracking-wider text-gray-300">
                <li><Link href="/disclaimer" className="hover:text-white hover:underline transition">DISCLAIMER</Link></li>
                <li><Link href="/lapor" className="hover:text-white hover:underline transition">LAPOR MASALAH</Link></li>
              </ul>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-widest gap-4">
          <span>© 2026 HEGEMONI LEX PORTAL.</span>
          <span>DIBUAT DENGAN NEXT.JS OLEH TIM MAHASISWA</span>
        </div>
      </footer>
    </div>
  );
}