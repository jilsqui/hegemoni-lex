import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BookSynopsis from "@/components/BookSynopsis";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.merchandiseProduct.findUnique({
    where: { slug },
    include: { bookMetadata: true },
  });

  if (!product) return {};

  return {
    title: `${product.title} | Hegemoni Lex Merchandise`,
    description: product.bookMetadata?.synopsis || product.subtitle || `Detail buku ${product.title} dari Hegemoni Lex.`,
    alternates: { canonical: `https://hegemoni-lex.vercel.app/merch/${product.slug}` },
  };
}

export default async function MerchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.merchandiseProduct.findUnique({
    where: { slug },
    include: { bookMetadata: true },
  });

  if (!product) notFound();

  const meta = product.bookMetadata;
  const isBook = (product.category || "Buku").toLowerCase() === "buku";
  const isPreOrder = Number(product.price) === 0;

  // Susun baris detail hanya dari data yang terisi agar tampil rapi.
  const detailRows: { label: string; value: string; icon: string }[] = [];
  if (meta?.author) detailRows.push({ label: "Penulis", value: meta.author, icon: "✍️" });
  if (meta?.publisher) detailRows.push({ label: "Penerbit", value: meta.publisher, icon: "🏢" });
  if (meta?.dimensions) detailRows.push({ label: "Dimensi", value: meta.dimensions, icon: "📐" });
  if (meta?.pages) detailRows.push({ label: "Tebal", value: `${meta.pages} halaman`, icon: "📄" });
  if (meta?.edition) detailRows.push({ label: "Cetakan", value: meta.edition, icon: "🔢" });
  if (meta?.isbn) detailRows.push({ label: "ISBN/QRCBN", value: meta.isbn, icon: "🔖" });
  if (meta?.format) detailRows.push({ label: "Finishing", value: meta.format, icon: "📦" });
  if (meta?.language) detailRows.push({ label: "Bahasa", value: meta.language, icon: "🌐" });

  if (detailRows.length === 0) {
    detailRows.push({ label: "Kategori", value: product.category || "Merchandise", icon: "🏷️" });
  }

  // Ambil digit kontak untuk link WhatsApp (0812... -> 62812...).
  const rawDigits = (product.orderContact || "").replace(/\D/g, "");
  const waNumber = rawDigits.startsWith("0") ? `62${rawDigits.slice(1)}` : rawDigits;

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

      {/* HERO WITH COVER */}
      <section className="relative pt-24 md:pt-32 pb-0 border-b border-gray-200 bg-gray-50 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="mx-auto max-w-6xl px-4 md:px-6 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6">
            <Link href="/merch" className="hover:text-black transition-colors">Merchandise</Link>
            <span>›</span>
            <span className="text-gray-400">{product.category || "Buku"}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-10 md:pb-16">
            {/* Left: Info */}
            <div className="flex-1 flex flex-col justify-center lg:max-w-[55%]">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="inline-block py-1 px-3 border border-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 rounded-full">
                  {product.category || "Buku"}
                </span>
                {isPreOrder && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    🔥 Pre Order
                  </span>
                )}
                {product.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                    ⭐ Unggulan
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed font-light italic">
                  {product.subtitle}
                </p>
              )}

              {/* Author & Year */}
              {isBook && meta && (
                <div className="mt-5 flex items-center gap-3">
                  {meta.author && (
                    <span className="text-sm font-semibold text-gray-800">
                      oleh {meta.author}
                    </span>
                  )}
                  {meta.releaseYear && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">{meta.releaseYear}</span>
                    </>
                  )}
                </div>
              )}

              {/* Quick Info Pills */}
              {isBook && meta && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {meta.pages && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 shadow-sm">
                      📄 {meta.pages} halaman
                    </span>
                  )}
                  {meta.format && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 shadow-sm">
                      📦 {meta.format}
                    </span>
                  )}
                  {meta.dimensions && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 shadow-sm">
                      📐 {meta.dimensions}
                    </span>
                  )}
                  {meta.isbn && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 shadow-sm">
                      🔖 ISBN: {meta.isbn}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Cover Image */}
            <div className="flex-shrink-0 flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="w-64 md:w-72 lg:w-80 overflow-hidden rounded-3xl border border-gray-200 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"}
                    alt={product.title}
                    className="w-full h-auto object-cover aspect-[3/4]"
                  />
                </div>
                {/* Decorative shadow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/10 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left Column: Synopsis + Details */}
          <div className="space-y-6">
            {/* Synopsis */}
            {isBook && <BookSynopsis synopsis={product.bookMetadata?.synopsis} />}

            {/* Detail Table */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Detail {isBook ? "Buku" : "Produk"}</p>
              <h2 className="mt-2 text-xl font-serif font-bold text-gray-900 mb-5">Spesifikasi</h2>
              <dl className="space-y-0 divide-y divide-gray-100">
                {detailRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
                      <span className="text-base">{row.icon}</span>
                      {row.label}
                    </dt>
                    <dd className="text-right font-semibold text-sm text-gray-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right Column: Order CTA */}
          <div className="space-y-6">
            {/* ORDER CTA — Main */}
            <div className="rounded-3xl border-2 border-black bg-black p-6 md:p-8 text-white shadow-xl sticky top-24">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400">Pemesanan</p>
              
              {isPreOrder && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/90">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </span>
                  Pre Order — Tersedia Segera
                </div>
              )}

              {product.orderContact ? (
                <>
                  <h3 className="mt-4 text-lg font-serif font-bold text-white">Tertarik Memesan?</h3>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                    Hubungi kontak di bawah ini untuk pemesanan dan informasi ketersediaan.
                  </p>
                  
                  <div className="mt-5 rounded-2xl bg-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Kontak Pemesanan</p>
                    <p className="mt-1.5 text-xl font-bold text-white">{product.orderContact}</p>
                  </div>

                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya tertarik memesan buku "${product.title}". Apakah masih tersedia?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 w-full rounded-full bg-white px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.418A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.994-1.952a.5.5 0 00-.39-.082l-3.27.993.926-3.108a.5.5 0 00-.063-.427A9.954 9.954 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                    </svg>
                    Pesan via WhatsApp
                  </a>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-lg font-serif font-bold text-white">Ingin Memesan?</h3>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                    Seluruh hasil penjualan membantu pengembangan konten, riset, dan literasi hukum di Hegemoni Lex.
                  </p>
                  <Link
                    href="/hubungi-kami"
                    className="mt-6 flex items-center justify-center w-full rounded-full bg-white px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-gray-100 transition-all"
                  >
                    Hubungi Kami untuk Pemesanan →
                  </Link>
                </>
              )}
            </div>

            {/* Back to Catalog */}
            <Link
              href="/merch"
              className="flex items-center justify-center w-full rounded-full border border-gray-300 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600 hover:border-black hover:text-black transition-all"
            >
              ← Kembali ke Katalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
