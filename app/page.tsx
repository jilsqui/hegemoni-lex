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
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* ================================================================ */}
      {/* 1. HERO SECTION - EDITORIAL MAGAZINE STYLE                       */}
      {/* ================================================================ */}
      <header className="pt-16 md:pt-28">
        
        {/* FEATURED ARTICLE - Full Width Hero */}
        {featuredArticle ? (
          <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-10 pb-6 md:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* LEFT: Featured Image */}
              <div className="lg:col-span-7 relative min-h-[240px] md:min-h-[380px] lg:min-h-[500px] bg-gray-100 overflow-hidden hover-elegant">
                {featuredArticle.image ? (
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                    <span className="font-serif text-white/10 text-8xl italic">HL</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 z-10">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <span className="bg-white text-black px-2.5 py-0.5 md:px-3 md:py-1 text-[10px] md:text-[9px] font-bold uppercase tracking-[0.15em]">
                      {featuredArticle.category}
                    </span>
                    <span className="text-white/60 text-[11px] md:text-[10px] font-light">
                      {formatDate(featuredArticle.publishedAt)}
                    </span>
                  </div>
                  <Link href={`/artikel/${featuredArticle.slug}`} className="group">
                    <h1 className="text-xl md:text-4xl lg:text-[2.75rem] font-serif font-bold text-white leading-[1.2] mb-3 md:mb-4 group-hover:opacity-80 transition-opacity duration-300">
                      {featuredArticle.title}
                    </h1>
                  </Link>
                  <p className="text-white/70 text-xs md:text-base leading-relaxed max-w-xl line-clamp-2 font-light hidden md:block">
                    {featuredArticle.excerpt || featuredArticle.content.substring(0, 160) + "..."}
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-5">
                    <div className="w-6 h-6 md:w-7 md:h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-white/10">
                      {featuredArticle.author.name?.charAt(0) || 'R'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/90 text-[11px] font-medium">
                        {featuredArticle.author.name || 'Tim Redaksi'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 left-3 md:top-5 md:left-5 z-10">
                  <span className="text-[9px] md:text-[9px] uppercase tracking-[0.2em] font-bold text-white/60 bg-black/40 backdrop-blur-sm px-2.5 py-1 md:px-3 md:py-1.5">Fokus Utama</span>
                </div>
              </div>

              {/* RIGHT: Sidebar Trending Articles */}
              <div className="lg:col-span-5 bg-white flex flex-col lg:border-l border-t lg:border-t-0 border-gray-200">
                <div className="px-4 lg:px-6 pt-4 lg:pt-5 pb-2 lg:pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Terbaru</span>
                </div>
                {trendingArticles.length > 0 ? trendingArticles.map((article, index) => (
                  <Link 
                    key={article.id} 
                    href={`/artikel/${article.slug}`}
                    className="flex items-start gap-3 md:gap-4 px-4 lg:px-6 py-3.5 md:py-4 hover:bg-gray-50/80 active:bg-gray-100 transition-all duration-300 group/item flex-1 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-2xl md:text-3xl font-serif font-bold text-gray-100 group-hover/item:text-gray-300 transition-colors duration-300 leading-none mt-0.5 w-8 md:w-10 flex-shrink-0 text-right">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1 block">
                        {article.category}
                      </span>
                      <h3 className="text-[13px] md:text-sm font-serif font-bold leading-snug line-clamp-2 group-hover/item:text-gray-600 transition-colors duration-300">
                        {article.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 mt-1.5 block font-light">
                        {formatDateShort(article.publishedAt)}
                      </span>
                    </div>
                    {article.image && (
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 flex-shrink-0 overflow-hidden hover-elegant rounded-sm">
                        <img src={article.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </Link>
                )) : (
                  <div className="flex items-center justify-center h-full text-gray-300 font-serif italic p-6 md:p-8">
                    Belum ada artikel terbaru lainnya
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-24 text-center">
            <span className="inline-block py-1.5 px-4 border border-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-500">
              Portal Hukum Independen
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light leading-snug mb-8 text-gray-900 tracking-wide">
              Kritis. Berdaya. <span className="font-normal italic border-b border-black pb-1">Berkeadilan.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed font-light">
              Wadah kolektif untuk diskursus hukum, legislasi, dan hak asasi manusia di Indonesia.
            </p>
          </div>
        )}

        {/* THIN SEPARATOR LINE */}
        <div className="border-t border-gray-200" />

        {/* CATEGORY TICKER / MARQUEE BAR */}
        <div className="bg-gray-950 text-white py-2.5 md:py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {["LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA", "LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"].map((cat, i) => (
              <Link 
                key={i} 
                href={`/artikel?q=${cat}`} 
                className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mx-4 md:mx-6 hover:text-gray-400 transition-colors duration-300"
              >
                {cat} <span className="text-gray-700 mx-1.5 md:mx-2">·</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* 2. INTERACTIVE QUOTE BAR                                         */}
      {/* ================================================================ */}
      <div className="bg-gray-50 text-black py-8 md:py-12 px-4 md:px-6 border-b border-gray-200 flex justify-center items-center group cursor-help transition-all duration-500 hover:bg-white">
        <div className="relative h-12 md:h-16 w-full max-w-4xl flex items-center justify-center overflow-hidden">
            <h2 className="absolute transition-all duration-500 ease-in-out opacity-100 group-hover:opacity-0 group-hover:blur-md group-hover:-translate-y-4 font-serif text-lg md:text-2xl italic tracking-wide z-10 text-center text-gray-600">
              &ldquo;Fiat Justitia Ruat Caelum&rdquo;
            </h2>
            <p className="absolute transition-all duration-700 ease-out delay-100 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-gray-500 text-center leading-relaxed z-10 px-2 md:px-4">
              Hendaklah keadilan ditegakkan, walaupun langit akan runtuh.
            </p>
        </div>
      </div>
      
      {/* ================================================================ */}
      {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT (Articles + Sidebar)            */}
      {/* ================================================================ */}
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-8 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT COLUMN: Publikasi Terbaru */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 pb-3 md:pb-4 gap-3 md:gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1.5 md:mb-2 block">Artikel</span>
                <h2 className="text-2xl md:text-4xl font-serif font-medium leading-none text-gray-900">Publikasi Terbaru</h2>
              </div>
              <Link href="/artikel" className="text-[11px] md:text-[10px] font-bold hover:text-black uppercase tracking-[0.15em] text-gray-400 transition-colors duration-300 border-b border-transparent hover:border-black pb-0.5">
                LIHAT SEMUA →
              </Link>
            </div>

            <div className="w-full h-px bg-gray-200 mb-6 md:mb-10" />

            {latestArticles.length === 0 ? (
              <div className="text-center py-24 bg-gray-50/50 border border-dashed border-gray-200">
                <p className="text-gray-400 font-serif italic text-xl">Belum ada artikel publikasi lainnya.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* FIRST ARTICLE: Large Editorial Card */}
                {latestArticles[0] && (
                  <ScrollPopOut>
                  <Link href={`/artikel/${latestArticles[0].slug}`} className="group block pb-6 md:pb-10 mb-6 md:mb-10 border-b border-gray-200">
                    <article>
                      {latestArticles[0].image && (
                        <div className="aspect-[16/10] md:aspect-[16/9] w-full bg-gray-100 mb-4 md:mb-6 overflow-hidden hover-elegant rounded-sm">
                          <img 
                            src={latestArticles[0].image} 
                            alt={latestArticles[0].title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 md:gap-3 mb-2.5 md:mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 uppercase tracking-[0.15em] bg-gray-900 text-white">
                          {latestArticles[0].category}
                        </span>
                        <span className="text-[11px] md:text-[10px] text-gray-400 font-light">
                          {formatDate(latestArticles[0].publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-3xl font-serif font-bold mb-2 md:mb-3 leading-[1.2] text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                        {latestArticles[0].title}
                      </h3>
                      <p className="text-gray-500 text-[13px] md:text-sm leading-[1.7] line-clamp-2 md:line-clamp-3 font-light max-w-2xl">
                        {latestArticles[0].excerpt || latestArticles[0].content.substring(0, 200) + "..."}
                      </p>
                      <div className="flex items-center gap-2 mt-3 md:mt-4">
                        <span className="text-[11px] md:text-[10px] text-gray-400 font-light">oleh</span>
                        <span className="text-[11px] md:text-[10px] font-medium text-gray-700">{latestArticles[0].author.name || 'Redaksi'}</span>
                      </div>
                    </article>
                  </Link>
                  </ScrollPopOut>
                )}

                {/* GRID: 2-Column Article Grid (Articles 2-3) */}
                {latestArticles.length > 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-6 md:pb-10 mb-6 md:mb-10 border-b border-gray-200">
                    {latestArticles.slice(1, 3).map((article) => (
                      <ScrollPopOut key={article.id}>
                      <Link href={`/artikel/${article.slug}`} className="group block">
                        <article>
                          {article.image && (
                            <div className="aspect-[4/3] w-full bg-gray-100 mb-4 overflow-hidden hover-elegant">
                              <img 
                                src={article.image} 
                                alt={article.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 block mb-1.5 md:mb-2">
                            {article.category}
                          </span>
                          <h3 className="text-base md:text-lg font-serif font-bold leading-snug line-clamp-2 mb-1.5 md:mb-2 text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-light mb-2 hidden md:block">
                            {article.excerpt || article.content.substring(0, 120) + "..."}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] md:text-[10px] text-gray-400">
                            <span className="font-medium text-gray-600">{article.author.name || 'Redaksi'}</span>
                            <span className="text-gray-300">·</span>
                            <span className="font-light">{formatDateShort(article.publishedAt)}</span>
                          </div>
                        </article>
                      </Link>
                      </ScrollPopOut>
                    ))}
                  </div>
                )}

                {/* REST OF ARTICLES: Compact List Style */}
                {latestArticles.slice(3).map((article) => (
                  <ScrollPopOut key={article.id}>
                  <Link href={`/artikel/${article.slug}`} className="group flex gap-3 md:gap-5 py-4 md:py-6 items-start border-b border-gray-100 last:border-b-0 active:bg-gray-50">
                    {article.image && (
                      <div className="w-24 h-18 md:w-36 md:h-24 bg-gray-100 flex-shrink-0 overflow-hidden hover-elegant rounded-sm">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                          {article.category}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400 font-light">
                          {formatDateShort(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-[15px] md:text-lg font-serif font-bold leading-snug line-clamp-2 mb-1 md:mb-1.5 text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-light hidden md:block">
                        {article.excerpt || article.content.substring(0, 120) + "..."}
                      </p>
                      <span className="text-[11px] md:text-[10px] text-gray-500 mt-1 md:mt-1.5 block font-medium">
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
            <div className="mb-10 md:mb-14 lg:sticky lg:top-28">
              <div className="border-b border-gray-900 pb-3 mb-5 md:mb-6">
                <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Populer</h3>
              </div>
              
              {popularArticles.length > 0 ? (
                <div className="space-y-0">
                  {popularArticles.map((article, index) => (
                    <Link 
                      key={article.id} 
                      href={`/artikel/${article.slug}`}
                      className="group flex gap-4 py-4 items-start border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-xl md:text-2xl font-serif font-bold text-gray-200 group-hover:text-gray-400 transition-colors duration-300 leading-none mt-0.5 w-7 md:w-8 flex-shrink-0 text-right">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block mb-1">
                          {article.category}
                        </span>
                        <h4 className="text-[13px] md:text-sm font-serif font-bold leading-snug line-clamp-2 text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] md:text-[10px] text-gray-500 font-medium">
                            {article.author.name || 'Redaksi'}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[11px] md:text-[10px] text-gray-400 font-light">
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
              <div className="mt-10 md:mt-14">
                <div className="border-b border-gray-900 pb-3 mb-5 md:mb-6">
                  <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Kategori</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA"].map((cat) => (
                    <Link 
                      key={cat}
                      href={`/artikel?q=${cat}`}
                      className="text-[10px] font-bold uppercase tracking-[0.1em] border border-gray-200 px-3 py-2 md:px-3.5 hover:bg-gray-900 hover:text-white hover:border-gray-900 active:bg-black active:text-white transition-all duration-300"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* TENTANG KAMI MINI */}
              <div className="mt-10 md:mt-14 bg-gray-50 p-5 md:p-6 border-l-2 border-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-8 h-8">
                    <Image src="/logohl.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <span className="font-serif font-bold text-sm text-gray-900">Hegemoni LEX</span>
                </div>
                <p className="text-xs text-gray-500 leading-[1.8] mb-4 font-light">
                  Ruang perjumpaan gagasan hukum untuk membongkar sekat-sekat ketidaktahuan. Kritis, Berdaya, Berkeadilan.
                </p>
                <Link href="/tentang-kami/tim-kami" className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-gray-600 border-b border-gray-900 hover:border-gray-600 pb-0.5 transition-colors duration-300">
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
      <footer className="bg-gray-950 text-white py-12 md:py-24 px-4 md:px-6 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-16">
          
          {/* KOLOM 1: Brand & Deskripsi */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image src="/logohl.png" alt="Hegemoni LEX Logo" fill className="object-contain invert"/>
              </div>
              <div className="text-xl font-serif font-bold tracking-tight">Hegemoni LEX</div>
            </div>
            <p className="text-gray-500 text-sm leading-[1.8] font-light mb-6">
              Ruang perjumpaan gagasan hukum untuk membongkar sekat-sekat ketidaktahuan. Kritis, Berdaya, Berkeadilan.
            </p>
            <div className="flex gap-3">
                <a href="#" className="text-[10px] font-bold border border-gray-800 px-3 py-1.5 hover:bg-white hover:text-black hover:border-white transition-all duration-300">INSTAGRAM</a>
                <a href="#" className="text-[10px] font-bold border border-gray-800 px-3 py-1.5 hover:bg-white hover:text-black hover:border-white transition-all duration-300">LINKEDIN</a>
            </div>
          </div>
          
          {/* GRID MENU LINK */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-20">
            
            {/* Kolom Menu 1: TENTANG */}
            <div>
              <h4 className="font-bold mb-6 text-[10px] tracking-[0.2em] text-gray-600 uppercase">Tentang</h4>
              <ul className="space-y-4 text-xs font-bold tracking-wider text-gray-400">
                <li><Link href="/tentang-kami/tim-kami" className="hover:text-white transition-colors duration-300">TIM KAMI</Link></li>
                <li><Link href="/hubungi-kami" className="hover:text-white transition-colors duration-300">HUBUNGI KAMI</Link></li>
                <li><Link href="/dashboard/writer/create" className="hover:text-white transition-colors duration-300">KIRIM TULISAN</Link></li>
                <li><Link href="/galeri" className="hover:text-white transition-colors duration-300">GALERI</Link></li>
                <li><Link href="/artikel" className="hover:text-white transition-colors duration-300">PUBLIKASI</Link></li>
              </ul>
            </div>

            {/* Kolom Menu 2: DUKUNG KAMI */}
            <div>
              <h4 className="font-bold mb-6 text-[10px] tracking-[0.2em] text-gray-600 uppercase">Dukung Kami</h4>
              <ul className="space-y-4 text-xs font-bold tracking-wider text-gray-400">
                <li><Link href="/donasi" className="hover:text-white transition-colors duration-300">DONASI</Link></li>
                <li><Link href="/merch" className="hover:text-white transition-colors duration-300">MERCH</Link></li>
              </ul>
            </div>

            {/* Kolom Menu 3: INFORMASI */}
            <div>
              <h4 className="font-bold mb-6 text-[10px] tracking-[0.2em] text-gray-600 uppercase">Informasi</h4>
              <ul className="space-y-4 text-xs font-bold tracking-wider text-gray-400">
                <li><Link href="/disclaimer" className="hover:text-white transition-colors duration-300">DISCLAIMER</Link></li>
                <li><Link href="/lapor" className="hover:text-white transition-colors duration-300">LAPOR MASALAH</Link></li>
              </ul>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 md:mt-24 pt-6 md:pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-wider md:tracking-widest gap-3 md:gap-4">
          <span>© 2026 HEGEMONI LEX PORTAL.</span>
          <span>DIBUAT DENGAN NEXT.JS OLEH TIM MAHASISWA</span>
        </div>
      </footer>
    </div>
  );
}