// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getPreviewText } from '@/lib/utils';
import ScrollPopOut from '@/components/ScrollPopOut';
import MissionCinematic from '@/components/MissionCinematic';
import HomeHybridWidget from '@/components/HomeHybridWidget';
export const revalidate = 120;

export default async function Home() {
  let featuredArticle: any = null;
  let latestArticles: any[] = [];
  let popularArticles: any[] = [];
  let trendingArticles: any[] = [];
  let groupedCategorySections: Array<{ category: string; articles: any[] }> = [];
  let opinionWidgetArticles: any[] = [];
  let legalWidgetArticles: any[] = [];
  let hamWidgetArticles: any[] = [];

  try {
    // 1. AMBIL FOKUS UTAMA (Featured)
    featuredArticle = await prisma.article.findFirst({
      where: {
          status: 'PUBLISHED',
          isArchived: false,
          isFeatured: true
      },
      include: { author: true }
    });

    // Fallback: Jika admin lupa set fokus utama, ambil artikel published paling baru
    if (!featuredArticle) {
      featuredArticle = await prisma.article.findFirst({
          where: { status: 'PUBLISHED', isArchived: false },
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          include: { author: true }
      });
    }

    // 2. AMBIL ARTIKEL TERBARU (Kecuali featured)
    latestArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isArchived: false,
        NOT: { id: featuredArticle?.id || '' }
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 9,
      include: { author: { select: { name: true } } },
    });

    // 3. AMBIL ARTIKEL POPULER (by viewCount)
    popularArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', isArchived: false },
      orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
      take: 5,
      include: { author: { select: { name: true } } },
    });

    // 4. AMBIL TRENDING (4 artikel terbaru untuk strip sidebar, exclude featured)
    trendingArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isArchived: false,
        NOT: { id: featuredArticle?.id || '' }
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    });

    const groupedSourceArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isArchived: false,
        NOT: { id: featuredArticle?.id || '' }
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 40,
      include: { author: { select: { name: true } } },
    });

    const buckets = new Map<string, any[]>();
    groupedSourceArticles.forEach((article) => {
      const key = article.category || 'LAINNYA';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(article);
    });

    const scored = Array.from(buckets.entries())
      .map(([category, articles]) => {
        const avgViews = articles.reduce((sum, item) => sum + (item.viewCount || 0), 0) / articles.length;
        const latestTimestamp = new Date(articles[0]?.publishedAt || articles[0]?.createdAt || 0).getTime();
        return {
          category,
          articles,
          score: articles.length * 3 + avgViews * 0.03 + latestTimestamp / 1_000_000_000_000,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    groupedCategorySections = scored.map((item) => ({
      category: item.category,
      articles: item.articles.slice(0, 4),
    }));

    // Fallback: jika hasil grouping masih sedikit, isi dari artikel terbaru agar layout desktop tetap padat.
    if (groupedCategorySections.length < 4) {
      const existing = new Set(groupedCategorySections.map((item) => item.category));
      const latestBuckets = new Map<string, any[]>();

      latestArticles.forEach((article) => {
        if (existing.has(article.category)) return;
        if (!latestBuckets.has(article.category)) latestBuckets.set(article.category, []);
        latestBuckets.get(article.category)!.push(article);
      });

      for (const [category, articles] of latestBuckets.entries()) {
        if (groupedCategorySections.length >= 4) break;
        groupedCategorySections.push({
          category,
          articles: articles.slice(0, 4),
        });
      }
    }

    if (groupedCategorySections.length === 0 && latestArticles.length > 0) {
      groupedCategorySections = [
        {
          category: 'TERBARU',
          articles: latestArticles.slice(0, 4),
        },
      ];
    }

    const legalCategories = new Set([
      'LEGISLASI',
      'REGULASI',
      'HUKUM PERDATA',
      'HUKUM PIDANA',
      'BISNIS',
      'KETENAGAKERJAAN',
      'EKONOMI PUBLIK',
    ]);

    opinionWidgetArticles = groupedSourceArticles.filter((article) => article.category === 'OPINI').slice(0, 4);
    legalWidgetArticles = groupedSourceArticles.filter((article) => legalCategories.has(article.category)).slice(0, 4);
    hamWidgetArticles = groupedSourceArticles.filter((article) => article.category === 'HAK ASASI MANUSIA').slice(0, 4);
  } catch (error) {
    console.error('Home page DB fallback:', error);
  }

  const missionImages = [
    '/hukum.jpeg',
    '/kebijakan-publik.jpeg',
    '/opini.jpeg',
    '/edukasi.jpeg',
  ];

  const missionItems = [
    {
      title: 'Hukum',
      subtitle: 'Kerangka Dasar',
      image: missionImages[0],
      description: 'Ruang analisis hukum yang tajam, kritis, dan berpijak pada realitas sosial serta keadilan publik.',
      linkCategory: 'HUKUM',
    },
    {
      title: 'Kebijakan Publik',
      subtitle: 'Arah Negara',
      image: missionImages[1],
      description: 'Membaca kebijakan secara substantif: dampak, konsistensi norma, serta relevansinya untuk warga.',
      linkCategory: 'KEBIJAKAN PUBLIK',
    },
    {
      title: 'Opini',
      subtitle: 'Gagasan Terbuka',
      image: missionImages[2],
      description: 'Mewadahi suara dan argumentasi dari berbagai perspektif untuk memperkaya percakapan publik.',
      linkCategory: 'OPINI',
    },
    {
      title: 'Edukasi',
      subtitle: 'Literasi Bersama',
      image: missionImages[3],
      description: 'Mendorong pemahaman hukum yang lebih mudah diakses agar pengetahuan bisa berdaya guna.',
      linkCategory: 'EDUKASI',
    },
  ];

  // Helper: format tanggal
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCategory = (category: string) => category.replace(/_/g, ' ');
  const getCategoryKey = (category: string) => formatCategory(category).toUpperCase();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* ================================================================ */}
      {/* 1. HERO SECTION - EDITORIAL MAGAZINE STYLE                       */}
      {/* ================================================================ */}
      <header className="pt-16 md:pt-24">
        
        {/* FEATURED ARTICLE - Full Width Hero */}
        {featuredArticle ? (
          <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-10 pb-6 md:pb-12">
            <div className="mb-6 md:mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 block mb-2">Sorotan</span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">Fokus Utama & Terbaru</h2>
              <p className="text-sm text-gray-500 mt-2">Artikel yang paling relevan dan sedang naik dibaca.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-11 lg:grid-cols-10 gap-6 md:gap-8 items-start">
              <article className="md:col-span-6 lg:col-span-6 rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_14px_36px_-26px_rgba(0,0,0,0.4)]">
                <Link href={`/artikel/${featuredArticle.slug}`} tabIndex={-1} className="block group">
                  <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden hover-elegant">
                    {featuredArticle.image ? (
                      <img src={featuredArticle.image} alt={featuredArticle.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                        <span className="font-serif text-white/10 text-7xl italic">HL</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 md:p-5 lg:p-6">
                  <span className="inline-flex rounded-md bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700 mb-3">
                    {formatCategory(featuredArticle.category)}
                  </span>
                  <Link href={`/artikel/${featuredArticle.slug}`} className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                    <h1 className="text-2xl md:text-[24px] lg:text-[28px] font-serif font-bold leading-[1.3] text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-3">
                      {featuredArticle.title}
                    </h1>
                  </Link>
                  <p className="text-sm md:text-[15px] leading-[1.65] text-gray-600 line-clamp-3 mb-4">
                    {getPreviewText(featuredArticle.excerpt, featuredArticle.content, 190)}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] text-gray-500">
                      {(featuredArticle.author.name || 'Tim Redaksi')} · {formatDateShort(featuredArticle.publishedAt)}
                    </p>
                    <Link href={`/artikel/${featuredArticle.slug}`} className="text-[13px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                      Baca Lengkap →
                    </Link>
                  </div>
                </div>
              </article>

              <aside className="md:col-span-5 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Terbaru</span>
                  <Link href="/artikel" className="text-[11px] font-semibold text-emerald-700 hover:underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                    Lihat Semua
                  </Link>
                </div>

                <div className="space-y-3">
                  {trendingArticles.length > 0 ? (
                    trendingArticles.slice(0, 4).map((article) => (
                      <Link
                        key={article.id}
                        href={`/artikel/${article.slug}`}
                        className="group flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition-all duration-200 hover:bg-gray-50 hover:border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                      >
                        <div className="w-[70px] h-[70px] lg:w-20 lg:h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 hover-elegant">
                          {article.image ? (
                            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic text-xs">HL</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-gray-600 mb-1">{formatCategory(article.category)}</p>
                          <h3 className="text-[14px] lg:text-[15px] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
                            {article.title}
                          </h3>
                          <p className="text-[12px] text-gray-500 mt-1">{formatDateShort(article.publishedAt)}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-gray-400 text-sm">
                      Belum ada artikel terbaru lainnya.
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
            <span className="inline-block py-1.5 px-4 border border-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 md:mb-8 text-gray-500">
              Portal Hukum Independen
            </span>
            <h1 className="text-3xl md:text-6xl font-serif font-light leading-snug mb-6 md:mb-8 text-gray-900 tracking-wide">
              Menulis. Berefleksi. <span className="font-normal italic border-b border-black pb-1">Berdampak.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-md mx-auto leading-relaxed font-light mb-8 md:mb-10">
              Ruang menulis dan dialog mengenai hukum dan kebijakan publik.
            </p>
            <Link href="/artikel" className="inline-block bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.15em] px-8 py-3.5 hover:bg-black transition-colors duration-300">
              Jelajahi Artikel →
            </Link>
          </div>
        )}

      </header>

      <MissionCinematic items={missionItems} />

      {groupedCategorySections.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 md:px-6 py-10 md:py-20 border-b border-gray-200">
          <div className="mb-8 md:mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Sorotan Dinamis</span>
            <h2 className="text-2xl md:text-[2.75rem] font-serif font-medium leading-tight text-gray-900">Topik yang Sedang Bergerak</h2>
            <p className="text-sm md:text-base text-gray-500 mt-3 max-w-2xl font-light leading-relaxed">Disusun otomatis berdasarkan volume tulisan, kebaruan, dan ketertarikan pembaca.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="lg:col-span-8 space-y-10 md:space-y-12">
              {groupedCategorySections.map((section, index) => {
              const categoryKey = getCategoryKey(section.category);
              const layoutType = index % 3;
              const lead = section.articles[0];
              const rest = section.articles.slice(1);

              if (!lead) return null;

              if (categoryKey === 'OPINI') {
                return (
                  <section key={section.category} className="pb-10 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4 md:mb-5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Sorotan</span>
                        <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                      </div>
                      <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">
                        Lihat Semua →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
                      <Link href={`/artikel/${lead.slug}`} className="lg:col-span-7 relative min-h-[320px] md:min-h-[460px] overflow-hidden rounded-sm border border-gray-200 group">
                        {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute left-4 top-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/70">Suara & Tafsir</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 mb-2">{formatDateShort(lead.publishedAt)}</p>
                          <h4 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight mb-3 line-clamp-3">{lead.title}</h4>
                        </div>
                      </Link>

                      <div className="lg:col-span-5 border border-gray-200 rounded-sm p-4 md:p-6 bg-white flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">Pembacaan Opini</p>
                          <h4 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-tight mb-4 line-clamp-4">{lead.title}</h4>
                          <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed line-clamp-6">
                            {getPreviewText(lead.excerpt, lead.content, 260)}
                          </p>
                        </div>
                        <div className="pt-5 mt-5 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold">{formatDateShort(lead.publishedAt)}</span>
                          <Link href={`/artikel/${lead.slug}`} className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-700 hover:text-black">Baca lengkap →</Link>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              if (categoryKey === 'REGULASI') {
                const total = section.articles.length;

                if (total === 1) {
                  return (
                    <section key={section.category} className="pb-8 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4 md:mb-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Kerangka Hukum</span>
                          <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                        </div>
                        <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Semua →</Link>
                      </div>
                      <Link href={`/artikel/${lead.slug}`} className="relative block min-h-[300px] md:min-h-[440px] rounded-sm overflow-hidden border border-gray-200 group">
                        {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Dokumen Utama</span>
                          <h4 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight mt-2 line-clamp-3">{lead.title}</h4>
                        </div>
                      </Link>
                    </section>
                  );
                }

                if (total === 2) {
                  return (
                    <section key={section.category} className="pb-8 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4 md:mb-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Kerangka Hukum</span>
                          <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                        </div>
                        <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Semua →</Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {section.articles.map((article, idx) => (
                          <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 rounded-sm overflow-hidden group">
                            {article.image && <img src={article.image} alt={article.title} className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105" />}
                            <div className="p-4 md:p-5">
                              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">{String(idx + 1).padStart(2, '0')}</p>
                              <h4 className="font-serif font-bold text-base md:text-lg leading-snug line-clamp-3">{article.title}</h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                }

                return (
                  <section key={section.category} className="pb-10 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4 md:mb-5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Kerangka Hukum</span>
                        <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                      </div>
                      <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">
                        Lihat Semua →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                      <Link href={`/artikel/${lead.slug}`} className="lg:col-span-5 relative min-h-[260px] md:min-h-[360px] overflow-hidden rounded-sm border border-gray-200 group">
                        {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Dokumen Utama</span>
                          <h4 className="text-xl md:text-3xl font-serif font-bold text-white leading-tight mt-2 line-clamp-3">{lead.title}</h4>
                        </div>
                      </Link>

                      <div className="lg:col-span-7 space-y-3">
                        {(rest.length > 0 ? rest : section.articles.slice(1, 4)).map((article, articleIndex) => (
                          <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 rounded-sm p-4 hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-[32px_1fr] md:grid-cols-[40px_1fr_auto] gap-3 md:gap-4 items-start">
                              <span className="text-xl md:text-2xl font-serif text-gray-300 leading-none">{String(articleIndex + 1).padStart(2, '0')}</span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1">{formatDateShort(article.publishedAt)}</p>
                                <h4 className="font-serif font-bold text-sm md:text-base leading-snug line-clamp-2">{article.title}</h4>
                              </div>
                              <span className="hidden md:block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 whitespace-nowrap pt-1">Regulasi</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              }

              if (categoryKey === 'HAK ASASI MANUSIA') {
                const total = section.articles.length;

                if (total === 1) {
                  return (
                    <section key={section.category} className="pb-8 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4 md:mb-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Hak & Martabat</span>
                          <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                        </div>
                        <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Semua →</Link>
                      </div>
                      <Link href={`/artikel/${lead.slug}`} className="relative block min-h-[300px] md:min-h-[460px] rounded-sm overflow-hidden border border-gray-200 group">
                        {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Martabat, Akses, Perlindungan</span>
                          <h4 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight mt-2 line-clamp-3">{lead.title}</h4>
                          <p className="text-white/75 text-sm md:text-base font-light leading-relaxed mt-3 max-w-2xl line-clamp-3">
                            {getPreviewText(lead.excerpt, lead.content, 180)}
                          </p>
                        </div>
                      </Link>
                    </section>
                  );
                }

                if (total === 2) {
                  return (
                    <section key={section.category} className="pb-8 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4 md:mb-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Hak & Martabat</span>
                          <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                        </div>
                        <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Semua →</Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {section.articles.map((article) => (
                          <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 rounded-sm overflow-hidden group">
                            {article.image && <img src={article.image} alt={article.title} className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105" />}
                            <div className="p-4 md:p-5">
                              <h4 className="font-serif font-bold text-base md:text-lg leading-snug line-clamp-3">{article.title}</h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                }

                return (
                  <section key={section.category} className="pb-10 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4 md:mb-5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 block">Hak & Martabat</span>
                        <h3 className="text-xl md:text-3xl font-serif font-bold text-gray-900">{formatCategory(section.category)}</h3>
                      </div>
                      <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">
                        Lihat Semua →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                      <div className="lg:col-span-4 space-y-3">
                        {section.articles.slice(0, 2).map((article, articleIndex) => (
                          <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 rounded-sm p-4 hover:bg-gray-50 transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">{String(articleIndex + 1).padStart(2, '0')}</p>
                            <h4 className="font-serif font-bold text-sm md:text-base leading-snug line-clamp-3">{article.title}</h4>
                          </Link>
                        ))}
                      </div>

                      <Link href={`/artikel/${lead.slug}`} className="lg:col-span-8 relative min-h-[280px] md:min-h-[420px] overflow-hidden rounded-sm border border-gray-200 group">
                        {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Martabat, Akses, Perlindungan</span>
                          <h4 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight mt-2 line-clamp-3">{lead.title}</h4>
                          <p className="text-white/75 text-sm md:text-base font-light leading-relaxed mt-3 max-w-2xl line-clamp-3">
                            {getPreviewText(lead.excerpt, lead.content, 180)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </section>
                );
              }

              if (layoutType === 0) {
                const total = section.articles.length;
                if (total === 1) {
                  return (
                    <div key={section.category} className="pb-10 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-2xl font-serif font-bold">{formatCategory(section.category)}</h3>
                        <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Topik →</Link>
                      </div>
                      <Link href={`/artikel/${lead.slug}`} className="relative block min-h-[250px] md:min-h-[340px] rounded-sm overflow-hidden group border border-gray-200">
                        {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute bottom-0 p-4 md:p-6">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">{formatCategory(section.category)}</span>
                          <h3 className="text-lg md:text-2xl font-serif font-bold text-white mt-2 line-clamp-2">{lead.title}</h3>
                        </div>
                      </Link>
                    </div>
                  );
                }

                if (total === 2) {
                  return (
                    <div key={section.category} className="pb-10 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-2xl font-serif font-bold">{formatCategory(section.category)}</h3>
                        <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Topik →</Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {section.articles.map((article) => (
                          <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 rounded-sm overflow-hidden group">
                            {article.image && <img src={article.image} alt={article.title} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" />}
                            <div className="p-4">
                              <h4 className="font-serif font-bold text-base line-clamp-2">{article.title}</h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={section.category} className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 pb-10 border-b border-gray-100">
                    <Link href={`/artikel?q=${section.category}`} className="lg:col-span-7 relative min-h-[220px] md:min-h-[320px] overflow-hidden rounded-sm bg-gray-100 block group">
                      {lead.image && <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 p-4 md:p-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">{formatCategory(section.category)}</span>
                        <h3 className="text-lg md:text-2xl font-serif font-bold text-white mt-2 line-clamp-2">{lead.title}</h3>
                      </div>
                    </Link>
                    <div className="lg:col-span-5 divide-y divide-gray-100 border border-gray-100 rounded-sm">
                      {rest.map((article) => (
                        <Link key={article.id} href={`/artikel/${article.slug}`} className="block p-4 hover:bg-gray-50 transition-colors">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1">{formatDateShort(article.publishedAt)}</p>
                          <h4 className="text-sm md:text-base font-serif font-bold text-gray-900 line-clamp-2">{article.title}</h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              if (layoutType === 1) {
                return (
                  <div key={section.category} className="pb-10 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg md:text-2xl font-serif font-bold">{formatCategory(section.category)}</h3>
                      <Link href={`/artikel?q=${section.category}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black">Lihat Topik →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {[lead, ...rest].slice(0, 2).map((article) => (
                        <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 rounded-sm overflow-hidden group">
                          {article.image && <img src={article.image} alt={article.title} className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" />}
                          <div className="p-4">
                            <h4 className="font-serif font-bold text-base line-clamp-2">{article.title}</h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={section.category} className="pb-10 border-b border-gray-100">
                  <h3 className="text-lg md:text-2xl font-serif font-bold mb-4">{formatCategory(section.category)}</h3>
                  <div className="space-y-3">
                    {[lead, ...rest].slice(0, 4).map((article, idx) => (
                      <Link key={article.id} href={`/artikel/${article.slug}`} className="block border border-gray-200 hover:bg-gray-50 transition-colors rounded-sm p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg font-serif text-gray-300 leading-none w-6">{String(idx + 1).padStart(2, '0')}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">{formatDateShort(article.publishedAt)}</p>
                            <h4 className="text-sm md:text-base font-serif font-bold line-clamp-2">{article.title}</h4>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
              <div className="space-y-6 rounded-3xl border border-gray-200 bg-gray-50/70 p-4 md:p-5 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.4)]">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block mb-1">Kolom Kanan</span>
                      <h3 className="text-lg md:text-2xl font-serif font-bold text-gray-900">Ringkasan Topik</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Editorial</span>
                  </div>

                  <div className="space-y-3">
                    {groupedCategorySections.slice(0, 4).map((section) => {
                      const leadArticle = section.articles[0];
                      if (!leadArticle) return null;

                      return (
                        <Link key={section.category} href={`/artikel?q=${section.category}`} className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-950 hover:text-white">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{formatCategory(section.category)}</p>
                              <h4 className="line-clamp-3 font-serif text-sm font-bold leading-snug md:text-base">{leadArticle.title}</h4>
                            </div>
                            <span className="pt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-300">{String(section.articles.length).padStart(2, '0')}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <HomeHybridWidget
                    eyebrow="OPINI"
                    title="Gagasan, Tafsir, dan Suara"
                    description="Ruang opini yang bergerak dinamis berdasarkan tulisan terbaru dari kategori opini."
                    href="/artikel?q=OPINI"
                    articles={opinionWidgetArticles}
                    emptyTitle="Opini"
                    emptyDescription="Widget ini akan menampilkan tulisan opini terbaru begitu kategori ini terisi."
                    emptyHint="Semua konten opini akan terkumpul otomatis di sini."
                  />

                  <HomeHybridWidget
                    eyebrow="HUKUM & REGULASI"
                    title="Kerangka, Aturan, dan Dampaknya"
                    description="Memetakan regulasi, legislasi, dan pembacaan kebijakan secara otomatis dari artikel yang masuk."
                    href="/artikel?q=REGULASI"
                    articles={legalWidgetArticles}
                    emptyTitle="Regulasi"
                    emptyDescription="Saat belum ada artikel regulasi yang tayang, widget ini tampil sebagai ruang kurasi yang sedang dibangun."
                    emptyHint="Akan berubah menjadi daftar dinamis ketika artikel regulasi hadir."
                  />

                  <HomeHybridWidget
                    eyebrow="HAK ASASI MANUSIA"
                    title="Martabat, Perlindungan, Akses"
                    description="Sorotan dinamis untuk tulisan HAM yang menempatkan manusia sebagai pusat pembacaan."
                    href="/artikel?q=HAK%20ASASI%20MANUSIA"
                    articles={hamWidgetArticles}
                    emptyTitle="HAM"
                    emptyDescription="Jika kategori HAM belum berisi cukup artikel, ruang ini akan tampil sebagai coming soon dengan identitas visual yang tetap hidup."
                    emptyHint="Begitu artikel diterbitkan, widget akan langsung beralih ke mode dinamis."
                  />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="border-b border-gray-900 pb-3 mb-5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">Kategori</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA", "RESENSI BUKU", "RESENSI FILM", "REGULASI", "TEKNOLOGI DAN DIGITAL", "POLITIK DAN PEMERINTAHAN"].map((cat) => (
                      <Link
                        key={cat}
                        href={`/artikel?q=${cat}`}
                        className="border border-gray-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border-l-2 border-gray-900 bg-white p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-8 h-8">
                      <Image src="/logohl.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-serif font-bold text-sm text-gray-900">Hegemoni LEX</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-[1.8] mb-4 font-light">
                    Platform literasi hukum dan kebijakan publik; Bertumbuh dan Berdampak
                  </p>
                  <Link href="/tentang-kami/tim-kami" className="inline-flex items-center gap-1 border-b border-gray-900 pb-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-900 transition-colors duration-300 hover:text-gray-600 hover:border-gray-600">
                    Tentang Kami →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}
      
      {/* ================================================================ */}
      {/* 4. MAIN CONTENT: 2-COLUMN LAYOUT (Articles + Sidebar)            */}
      {/* ================================================================ */}
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-8 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT COLUMN: Publikasi Terbaru */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 pb-3 md:pb-4 gap-3 md:gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1.5 md:mb-2 block">Artikel</span>
                <h2 className="text-2xl md:text-4xl font-serif font-medium leading-none text-gray-900">Fokus Utama & Terbaru</h2>
              </div>
              <Link href="/artikel" className="text-[11px] md:text-[10px] font-bold hover:text-black uppercase tracking-[0.15em] text-gray-400 transition-colors duration-300 border-b border-transparent hover:border-black pb-0.5">
                LIHAT SEMUA →
              </Link>
            </div>

            <div className="w-full h-px bg-gray-200 mb-6 md:mb-10" />

            {latestArticles.length === 0 ? (
              <div className="text-center py-16 md:py-24 bg-gray-50/50 border border-dashed border-gray-200">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-400 font-serif italic text-lg md:text-xl mb-2">Belum ada artikel publikasi.</p>
                <p className="text-gray-300 text-xs">Artikel akan tampil di sini setelah dipublikasikan.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* FIRST ARTICLE: Large Editorial Card */}
                {latestArticles[0] && (
                  <ScrollPopOut>
                  <Link href={`/artikel/${latestArticles[0].slug}`} className="group block pb-6 md:pb-10 mb-6 md:mb-10 border-b border-gray-200">
                    <article className="card-lift rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_14px_36px_-26px_rgba(0,0,0,0.4)]">
                      {latestArticles[0].image && (
                        <div className="aspect-[16/10] md:aspect-[16/9] w-full bg-gray-100 mb-4 md:mb-6 overflow-hidden hover-elegant rounded-xl">
                          <img 
                            src={latestArticles[0].image} 
                            alt={latestArticles[0].title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 md:gap-3 mb-2.5 md:mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 uppercase tracking-[0.15em] bg-gray-900 text-white">
                          {formatCategory(latestArticles[0].category)}
                        </span>
                        <span className="text-[11px] md:text-[10px] text-gray-400 font-light">
                          {formatDate(latestArticles[0].publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-3xl font-serif font-bold mb-2 md:mb-3 leading-[1.2] text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                        {latestArticles[0].title}
                      </h3>
                      <p className="text-gray-500 text-[13px] md:text-sm leading-[1.7] line-clamp-2 md:line-clamp-3 font-light max-w-2xl">
                        {getPreviewText(latestArticles[0].excerpt, latestArticles[0].content, 200)}
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
                      <Link href={`/artikel/${article.slug}`} className="group block h-full">
                        <article className="h-full border border-gray-200 rounded-sm p-3 md:p-4 card-lift bg-white">
                          {article.image && (
                            <div className="aspect-[4/3] w-full bg-gray-100 mb-4 overflow-hidden hover-elegant rounded-sm">
                              <img 
                                src={article.image} 
                                alt={article.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 block mb-1.5 md:mb-2">
                            {formatCategory(article.category)}
                          </span>
                          <h3 className="text-base md:text-lg font-serif font-bold leading-snug line-clamp-2 mb-1.5 md:mb-2 text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-light mb-2 hidden md:block">
                            {getPreviewText(article.excerpt, article.content, 120)}
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
                <div className="grid grid-cols-1 gap-4 md:gap-5 mt-2">
                  {latestArticles.slice(3).map((article, index) => (
                    <ScrollPopOut key={article.id}>
                      <Link href={`/artikel/${article.slug}`} className="group block border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-gray-50 hover:shadow-[0_16px_36px_-28px_rgba(0,0,0,0.4)] h-full">
                        <article className="flex flex-col sm:flex-row">
                          <div className="sm:w-[190px] sm:flex-shrink-0">
                            <div className="h-full min-h-[132px] bg-gray-100 overflow-hidden hover-elegant">
                              {article.image ? (
                                <img
                                  src={article.image}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic">Hegemoni Lex</div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 p-4 md:p-5">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{formatCategory(article.category)}</span>
                              <span className="text-xs md:text-sm font-serif font-bold text-gray-200">{String(index + 4).padStart(2, '0')}</span>
                            </div>
                            <h3 className="text-[15px] md:text-lg font-serif font-bold leading-snug line-clamp-2 mb-2 text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                              {article.title}
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 font-light mb-2">
                              {getPreviewText(article.excerpt, article.content, 120)}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="font-light">{formatDateShort(article.publishedAt)}</span>
                              <span className="text-gray-300">·</span>
                              <span className="font-medium text-gray-500">{article.author.name || 'Tim Redaksi'}</span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </ScrollPopOut>
                  ))}
                </div>
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
                      className="group flex gap-4 py-4 items-start border-b border-gray-100 last:border-b-0 rounded-sm px-2 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl md:text-2xl font-serif font-bold text-gray-200 group-hover:text-gray-400 transition-colors duration-300 leading-none mt-0.5 w-7 md:w-8 flex-shrink-0 text-right">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block mb-1">
                          {formatCategory(article.category)}
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
                <p className="text-gray-300 text-sm italic font-serif">Belum ada data artikel populer.</p>
              )}

              {/* KATEGORI SECTION */}
              <div className="mt-10 md:mt-14">
                <div className="border-b border-gray-900 pb-3 mb-5 md:mb-6">
                  <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Kategori</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["LEGISLASI", "OPINI", "HUKUM PERDATA", "HUKUM PIDANA", "BISNIS", "KETENAGAKERJAAN", "HAK ASASI MANUSIA", "RESENSI BUKU", "RESENSI FILM", "REGULASI", "TEKNOLOGI DAN DIGITAL", "POLITIK DAN PEMERINTAHAN"].map((cat) => (
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
                  Platform literasi hukum dan kebijakan publik; Bertumbuh dan Berdampak
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
      {/* 5. FOOTER                                                        */}
      {/* ================================================================ */}
      <footer className="bg-gray-950 text-white py-12 md:py-24 px-4 md:px-6 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 md:gap-16">
          
          {/* KOLOM 1: Brand & Deskripsi */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="relative w-10 h-10">
                <Image src="/logohl.png" alt="Hegemoni LEX Logo" fill className="object-contain invert"/>
              </div>
              <div className="text-xl font-serif font-bold tracking-tight">HEGEMONI LEX</div>
            </div>
            <p className="text-gray-500 text-sm leading-[1.8] font-light mb-4 md:mb-6">
              Platform literasi hukum dan kebijakan publik; Bertumbuh dan Berdampak
            </p>
            {/* Contact info - safenet style */}
            <div className="space-y-2 mb-4 md:mb-6">
              <a href="mailto:hegemonilex@gmail.com" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                <span>✉</span> hegemonilex@gmail.com
              </a>
            </div>
            <div className="flex gap-3">
              <a href="https://instagram.com/hegemoni_lex" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold border border-gray-800 px-3 py-1.5 hover:bg-white hover:text-black hover:border-white transition-all duration-300">INSTAGRAM</a>
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
        </div>
      </footer>
    </div>
  );
}