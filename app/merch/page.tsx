// app/merch/page.tsx
import Link from "next/link";

export default function MerchPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

      {/* HERO */}
      <div className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 md:mb-8 text-gray-600">
            Merchandise
          </span>
          <h1 className="text-3xl md:text-6xl font-serif font-bold mb-4 md:mb-6 leading-tight">
            Ayo Tampil Keren.
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Dukung kami dengan kamu tampil keren dan kekinian.
            Seluruh hasil penjualan digunakan untuk pengembangan platform Hegemoni Lex.
          </p>
        </div>
      </div>

      {/* MERCHANDISE COMING SOON */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-gray-200 pb-5 md:pb-6 gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold">Merchandise</h2>
            <p className="text-gray-500 text-sm mt-2">Katalog sedang kami siapkan.</p>
          </div>
          <Link href="/donasi" className="text-xs font-bold uppercase tracking-widest hover:underline">
            ← Halaman Donasi
          </Link>
        </div>

        <div className="border border-dashed border-gray-300 bg-gray-50 p-10 md:p-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Merch</p>
          <h3 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-3">Coming Soon</h3>
          <p className="text-sm md:text-base text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Koleksi terbaru sedang dipersiapkan. Nantikan update resmi dari Hegemoni Lex.
          </p>
        </div>

        {/* ORDER INFO */}
        <div className="mt-12 md:mt-16 bg-gray-50 border border-gray-200 p-5 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-serif font-bold mb-4">Info Merchandise</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Sambil menunggu katalog rilis, kamu tetap bisa mendukung pengembangan platform lewat halaman donasi
              atau menghubungi kami untuk informasi terbaru merchandise.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://wa.me/6281234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
              >
                WhatsApp Kami
              </a>
              <Link href="/hubungi-kami" className="border-2 border-black px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER MINI */}
      <div className="border-t border-gray-200 py-8 px-6 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2026 Hegemoni Lex — Kritis. Berdaya. Berkeadilan.</p>
      </div>
    </div>
  );
}
