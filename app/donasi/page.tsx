// app/donasi/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function DonasiPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* HERO */}
      <div className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-600">
            Dukung Kami
          </span>
          <h1 className="text-2xl md:text-6xl font-serif font-bold mb-4 md:mb-6 leading-tight">
            Ayo Berdonasi.
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Setiap kontribusi kamu membantu kami dalam menyediakan literasi hukum dan kebijakan publik yang
            berkualitas, independen, dan dapat diakses publik.
          </p>
        </div>
      </div>

      {/* DONASI INFO */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* INFO REKENING */}
          <div className="bg-gray-50 border border-gray-200 p-5 md:p-10">
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

              <div className="bg-white border border-gray-200 p-4 md:p-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Nomor Rekening</p>
                <p className="text-xl md:text-2xl font-mono font-bold tracking-wider">8415 0908 22</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 md:p-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Atas Nama</p>
                <p className="text-lg md:text-2xl font-serif font-bold">Efrial Ruliandi Silalahi</p>
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
                Hegemoni Lex berkomitmen untuk menyediakan platform mengenai hukum dan kebijakan publik yang inklusif, 
                independen, dan berkualitas. Dukungan kamu sangat berarti bagi keberlanjutan misi kami.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border-l-4 border-emerald-600 bg-emerald-50 rounded-r-lg transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5">
                <span className="text-2xl flex-shrink-0">📚</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-1 text-emerald-800">Literasi Publik</h4>
                  <p className="text-gray-600 text-sm">Memproduksi artikel mengenai hukum dan kebijakan publik.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5">
                <span className="text-2xl flex-shrink-0">🤝</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-1 text-amber-800">Kolaborasi</h4>
                  <p className="text-gray-600 text-sm">Mengajak kamu semua untuk berkolaborasi dalam aksi nyata. Pelatihan, seminar, kampanye, podcast, dan lainnya.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border-l-4 border-blue-700 bg-blue-50 rounded-r-lg transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5">
                <span className="text-2xl flex-shrink-0">⚙️</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-1 text-blue-900">Pengembangan Platform</h4>
                  <p className="text-gray-600 text-sm">Biaya server, domain, dan pengembangan fitur baru untuk pengalaman menarik dan kenyamanan yang menyenangkan bagi pengguna Hegemoni Lex.</p>
                </div>
              </div>
            </div>

            <a href="https://saweria.co/hegemonilex" target="_blank" rel="noopener noreferrer" className="inline-block bg-emerald-600 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md rounded-lg">
              Donasi Sekarang →
            </a>
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
