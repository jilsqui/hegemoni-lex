// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ScrollPopOut from '@/components/ScrollPopOut';
export const revalidate = 0; 

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

  // 2. AMBIL ARTIKEL LAINNYA (Kecuali yang sudah jadi featured)
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { id: featuredArticle?.id || '' } // Jangan tampilkan artikel featured di list bawah
    },
    orderBy: { publishedAt: 'desc' },
    take: 9, 
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION (DINAMIS) */}
      <header className="pt-44 pb-20 px-6 border-b-2 border-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-600">
              Portal Hukum Independen
            </span>

            <h1 className="text-4xl md:text-5xl font-serif font-light leading-snug mb-8 text-gray-900 tracking-wide">
              Kritis. <br />
              Berdaya. <br />
              <span className="font-normal italic border-b border-black pb-1">Berkeadilan.</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-md leading-relaxed font-light">
              Wadah kolektif untuk diskursus hukum, legislasi, dan hak asasi manusia di Indonesia.
            </p>
          </div>

          {/* KOTAK FOKUS UTAMA */}
          <div className="relative h-full min-h-[400px] border border-black bg-gray-50 flex flex-col justify-end mt-8 lg:mt-0 group overflow-hidden">
            
            {/* Tampilkan Gambar Background Jika Ada */}
            {featuredArticle?.image && (
                 <img 
                    src={featuredArticle.image} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700 grayscale"
                 />
            )}

            <div className="relative z-10 p-10">
                <div className="absolute top-0 right-0 bg-black text-white py-3 px-5 -mt-10 mr-0">
                <div className="text-3xl font-serif leading-none">2026</div>
                <div className="text-[9px] uppercase tracking-widest opacity-80 mt-1 text-right">Fokus Utama</div>
                </div>
                
                {featuredArticle ? (
                    <>
                        <span className="bg-black text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest mb-4 inline-block">
                            {featuredArticle.category}
                        </span>
                        <h3 className="text-3xl font-serif mb-4 leading-tight font-medium">
                            {featuredArticle.title}
                        </h3>
                        <p className="text-gray-900 mb-8 text-base leading-relaxed font-medium line-clamp-3">
                            {featuredArticle.excerpt || featuredArticle.content.substring(0, 120) + "..."}
                        </p>
                        <Link href={`/artikel/${featuredArticle.slug}`} className="text-sm font-bold border-b border-black w-max pb-1 hover:border-gray-500 transition-all uppercase tracking-widest">
                            BACA LAPORAN →
                        </Link>
                    </>
                ) : (
                    <div className="text-gray-400 italic">Belum ada artikel unggulan.</div>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. INTERACTIVE QUOTE BAR (Tetap Sama) */}
      <div className="bg-black text-white py-12 px-6 border-y-2 border-black flex justify-center items-center group cursor-help transition-colors duration-500 hover:bg-[#050505]">
        <div className="relative h-20 w-full max-w-4xl flex items-center justify-center overflow-hidden">
            <h2 className="absolute transition-all duration-500 ease-in-out opacity-100 group-hover:opacity-0 group-hover:blur-md group-hover:-translate-y-4 font-serif text-2xl md:text-3xl italic tracking-wide z-10 text-center">
              "Fiat Justitia Ruat Caelum"
            </h2>
            <p className="absolute transition-all duration-700 ease-out delay-100 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-300 text-center leading-relaxed z-10 px-4">
              Hendaklah keadilan ditegakkan, walaupun langit akan runtuh.
            </p>
        </div>
      </div>
      
      {/* 3. LIST ARTIKEL TERBARU */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-200 pb-6 gap-6">
          <h2 className="text-4xl font-serif font-medium leading-none">Publikasi Terbaru</h2>
          <a href="/artikel" className="text-xs font-bold hover:underline decoration-1 underline-offset-4 uppercase tracking-widest">LIHAT ARSIP LENGKAP</a>
        </div>

        {articles.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 w-full col-span-3">
              <p className="text-gray-400 font-serif italic text-xl">Belum ada artikel publikasi lainnya.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((article) => (
              <ScrollPopOut key={article.id}>
              <Link href={`/artikel/${article.slug}`} className="group cursor-pointer">
                <article className="flex flex-col h-full">
                  
                  <div className="aspect-[4/3] w-full bg-gray-100 border border-black mb-5 relative overflow-hidden hover-shake">
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
                        {article.category}
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
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 font-light">
                      {article.excerpt || article.content.substring(0, 150) + "..."}
                    </p>
                  </div>
                </article>
              </Link>
              </ScrollPopOut>
            ))}
          </div>
        )}
      </main>

      {/* ... kode main sebelumnya ... */}

      {/* FOOTER REVISI */}
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