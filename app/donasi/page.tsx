// app/donasi/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function DonasiPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* HERO */}
      <div className="pt-36 pb-20 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-600">
            Dukung Kami
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Donasi untuk <br />
            <span className="italic border-b-2 border-black pb-1">Literasi Hukum</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Setiap kontribusi Anda membantu kami menyediakan edukasi hukum yang berkualitas, independen, 
            dan dapat diakses oleh seluruh masyarakat Indonesia.
          </p>
        </div>
      </div>

      {/* DONASI INFO */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* INFO REKENING */}
          <div className="bg-gray-50 border border-gray-200 p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl">
                💳
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl">Transfer Bank</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Metode Donasi</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Bank</p>
                <p className="text-2xl font-serif font-bold">BCA</p>
              </div>

              <div className="bg-white border border-gray-200 p-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Nomor Rekening</p>
                <p className="text-2xl font-mono font-bold tracking-wider">8415 0908 22</p>
              </div>

              <div className="bg-white border border-gray-200 p-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Atas Nama</p>
                <p className="text-2xl font-serif font-bold">Efrial Ruliandi Silalahi</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
              <strong>Catatan:</strong> Setelah melakukan transfer, Anda dapat mengirimkan konfirmasi donasi 
              melalui halaman <Link href="/hubungi-kami" className="underline font-bold">Hubungi Kami</Link>.
            </div>
          </div>

          {/* IMPACT */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Donasi Anda Membantu</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Hegemoni Lex berkomitmen untuk menyediakan platform edukasi hukum yang terbuka dan berkualitas. 
                Dukungan finansial Anda sangat berarti bagi keberlanjutan misi kami.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border-l-4 border-black bg-gray-50">
                <span className="text-2xl">📚</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Konten Edukasi</h4>
                  <p className="text-gray-600 text-sm">Produksi artikel, opini, dan analisis hukum berkualitas tinggi.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border-l-4 border-black bg-gray-50">
                <span className="text-2xl">🛠️</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Pengembangan Platform</h4>
                  <p className="text-gray-600 text-sm">Biaya server, domain, dan pengembangan fitur baru untuk pengalaman pengguna yang lebih baik.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border-l-4 border-black bg-gray-50">
                <span className="text-2xl">🎓</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Program Edukasi</h4>
                  <p className="text-gray-600 text-sm">Mendukung program literasi hukum di kampus dan komunitas.</p>
                </div>
              </div>
            </div>

            <Link href="/merch" className="inline-block bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
              Lihat Merchandise Kami →
            </Link>
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
