// app/merch/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Merchandise | Hegemoni Lex",
  description: "Koleksi buku dan merchandise Hegemoni Lex. Dukung gerakan literasi hukum dengan tampil keren dan berdaya.",
};

const fallbackProducts = [
  {
    slug: "sinopsis-buku-hegemoni-lex",
    title: "Sinopsis Buku Hegemoni Lex",
    subtitle: "Edisi pembuka untuk pembaca yang ingin memahami arah gerakan kami.",
    price: 0,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    category: "Buku",
    isFeatured: true,
    createdAt: new Date().toISOString(),
    bookMetadata: {
      author: "Hegemoni Lex",
      publisher: "Hegemoni Lex Studio",
      releaseYear: 2026,
      synopsis: "Koleksi sinopsis buku ini memberi gambaran singkat tentang semangat kritik, literasi, dan keadilan yang menjadi fondasi platform Hegemoni Lex.",
      format: "Digital + Cetak",
      pages: 96,
      language: "Indonesia",
    },
  },
];

function isNewProduct(createdAt: string | Date): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

export default async function MerchPage() {
  const products = await prisma.merchandiseProduct.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { bookMetadata: true },
  });

  const hasRealProducts = products.length > 0;
  const visibleProducts = (hasRealProducts ? products : fallbackProducts) as any[];
  const categories = Array.from(new Set(visibleProducts.map((p) => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

      {/* HERO */}
      <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 border-b border-gray-200 bg-gray-50 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-block py-1.5 px-4 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.25em] mb-6 md:mb-8 text-gray-600 rounded-full">
            📚 Merchandise & Buku
          </span>
          <h1 className="text-3xl md:text-6xl font-serif font-bold mb-4 md:mb-6 leading-tight">
            Koleksi Buku &<br className="hidden md:block" /> Merchandise Kami.
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Dukung gerakan literasi hukum dengan memiliki buku-buku karya para penulis Hegemoni Lex.
            Seluruh hasil penjualan digunakan untuk pengembangan platform.
          </p>
        </div>
      </div>

      {/* KATALOG MERCHANDISE */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-gray-200 pb-5 md:pb-6 gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold">Katalog Merchandise</h2>
            <p className="text-gray-500 text-sm mt-2">
              {hasRealProducts ? `${visibleProducts.length} produk tersedia.` : "Katalog sedang kami siapkan."}
            </p>
          </div>
          <Link href="/donasi" className="text-xs font-bold uppercase tracking-widest hover:underline">
            ← Halaman Donasi
          </Link>
        </div>

        {/* FILTER KATEGORI */}
        {hasRealProducts && categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="rounded-full border border-gray-300 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:border-black hover:text-black transition-all cursor-default">
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const isBook = (product.category || "").toLowerCase() === "buku";
            const isPreOrder = Number(product.price) === 0;
            const isNew = product.createdAt && isNewProduct(product.createdAt);

            return (
              <article
                key={product.slug}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gray-400 hover:shadow-xl"
              >
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                  {isPreOrder && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                      🔥 Pre Order
                    </span>
                  )}
                  {isNew && !isPreOrder && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                      ✨ Baru
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg">
                      ⭐ Unggulan
                    </span>
                  )}
                </div>

                {/* Cover Image */}
                <div className="relative overflow-hidden bg-gray-100 h-64">
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">{product.category}</p>
                  <h3 className="mt-2 text-xl md:text-2xl font-serif font-bold text-gray-900 group-hover:text-black transition-colors">
                    {product.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600 leading-relaxed">
                    {product.subtitle || product.bookMetadata?.synopsis}
                  </p>

                  {/* Book metadata pills */}
                  {isBook && product.bookMetadata && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {product.bookMetadata.author && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                          ✍️ {product.bookMetadata.author}
                        </span>
                      )}
                      {product.bookMetadata.pages && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                          📄 {product.bookMetadata.pages} hal
                        </span>
                      )}
                      {product.bookMetadata.format && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                          📐 {product.bookMetadata.format}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{product.bookMetadata?.author || "Hegemoni Lex"}</span>
                      {product.bookMetadata?.releaseYear && (
                        <span className="text-gray-400 ml-1">· {product.bookMetadata.releaseYear}</span>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-gray-900">
                      {isPreOrder ? "Pre Order" : product.orderContact ? "Hubungi kami" : "—"}
                    </span>
                  </div>

                  <Link
                    href={`/merch/${product.slug}`}
                    className="mt-4 inline-flex items-center justify-center w-full rounded-full border border-black py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white transition-all duration-300"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* ORDER INFO */}
        <div className="mt-12 md:mt-16 bg-gray-50 border border-gray-200 rounded-3xl p-5 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-serif font-bold mb-4">Info Pemesanan</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Tertarik dengan buku atau merchandise kami? Hubungi kami untuk pemesanan atau kunjungi halaman donasi
              untuk mendukung pengembangan platform Hegemoni Lex.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://wa.me/6281212231466" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md rounded-full"
              >
                WhatsApp Kami
              </a>
              <Link href="/hubungi-kami" className="border-2 border-black px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full">
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
