// app/merch/page.tsx
import Link from "next/link";

export default function MerchPage() {
  // Data merchandise (bisa dipindahkan ke database nanti)
  const merchItems = [
    {
      id: 1,
      name: "Kaos Hegemoni Lex — Classic",
      description: "Kaos katun premium dengan logo Hegemoni Lex. Tersedia dalam hitam dan putih.",
      price: "Rp 120.000",
      image: null,
      badge: "BESTSELLER",
    },
    {
      id: 2,
      name: "Tote Bag — Fiat Justitia",
      description: "Tote bag kanvas dengan kutipan ikonik 'Fiat Justitia Ruat Caelum'. Cocok untuk kuliah maupun aktivitas sehari-hari.",
      price: "Rp 85.000",
      image: null,
      badge: "NEW",
    },
    {
      id: 3,
      name: "Sticker Pack — Legal Edition",
      description: "Set 10 stiker vinyl berkualitas tinggi dengan tema hukum dan keadilan. Tahan air.",
      price: "Rp 35.000",
      image: null,
      badge: null,
    },
    {
      id: 4,
      name: "Notebook — Lex Journal",
      description: "Notebook A5 hardcover dengan desain eksklusif Hegemoni Lex. 120 halaman ruled.",
      price: "Rp 65.000",
      image: null,
      badge: null,
    },
    {
      id: 5,
      name: "Hoodie Hegemoni Lex — Limited",
      description: "Hoodie premium bahan fleece dengan bordir logo eksklusif. Edisi terbatas.",
      price: "Rp 250.000",
      image: null,
      badge: "LIMITED",
    },
    {
      id: 6,
      name: "Pin Enamel — Scales of Justice",
      description: "Pin enamel metal dengan desain timbangan keadilan. Aksesoris wajib untuk pegiat hukum.",
      price: "Rp 45.000",
      image: null,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

      {/* HERO */}
      <div className="pt-36 pb-20 px-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-600">
            Merchandise
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Kenakan <span className="italic">Keadilan</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Dukung literasi hukum Indonesia dengan cara yang stylish. 
            Seluruh hasil penjualan digunakan untuk pengembangan platform Hegemoni Lex.
          </p>
        </div>
      </div>

      {/* MERCHANDISE GRID */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-200 pb-6 gap-6">
          <div>
            <h2 className="text-3xl font-serif font-bold">Katalog Merchandise</h2>
            <p className="text-gray-500 text-sm mt-2">Produk eksklusif dari Hegemoni Lex</p>
          </div>
          <Link href="/donasi" className="text-xs font-bold uppercase tracking-widest hover:underline">
            ← Halaman Donasi
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchItems.map((item) => (
            <div key={item.id} className="group border border-gray-200 hover:border-black transition-all duration-300 bg-white">
              {/* IMAGE PLACEHOLDER */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                <span className="font-serif italic text-2xl text-gray-300 group-hover:scale-110 transition-transform duration-500">
                  Hegemoni Lex
                </span>
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-black text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest">
                    {item.badge}
                  </span>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              </div>

              {/* INFO */}
              <div className="p-6">
                <h3 className="text-lg font-serif font-bold mb-2 group-hover:underline decoration-1 underline-offset-4">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-mono font-bold">{item.price}</span>
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                  >
                    Pesan
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER INFO */}
        <div className="mt-16 bg-gray-50 border border-gray-200 p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-serif font-bold mb-4">Cara Pemesanan</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Untuk pemesanan merchandise, silakan hubungi kami melalui WhatsApp atau Instagram. 
              Pembayaran dapat dilakukan via transfer bank (BCA) sesuai informasi di halaman donasi.
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
