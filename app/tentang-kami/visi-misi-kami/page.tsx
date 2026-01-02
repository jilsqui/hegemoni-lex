// app/tentang-kami/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* CATATAN: 
          Navbar manual dihapus agar menggunakan Navbar Global (dari layout.tsx).
          Header di bawah ini diberi padding-top (pt-32) agar tidak tertutup Navbar Global.
      */}

      {/* 1. HEADER HALAMAN */}
      <header className="pt-32 pb-20 px-6 border-b-2 border-black bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block py-1 px-3 border border-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-600">
              Manifesto & Tujuan
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6 leading-tight">
              Visi & Misi Kami
            </h1>
        </div>
      </header>

      {/* 2. KONTEN VISI (STATEMENT BESAR) */}
      <section className="py-24 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] border-l-4 border-black pl-4 py-1">Visi Utama</h2>
            </div>
            <div className="md:w-2/3">
                <p className="text-3xl md:text-4xl font-serif leading-snug text-gray-900">
                  "Terwujudnya masyarakat Indonesia yang <span className="italic border-b-2 border-black">melek hukum</span>, kritis terhadap kekuasaan, dan mampu memperjuangkan keadilan substantif di era digital."
                </p>
            </div>
        </div>
      </section>

      {/* 3. KONTEN MISI (GRID LIST) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3">
                 <h2 className="text-sm font-bold uppercase tracking-[0.2em] border-l-4 border-gray-300 pl-4 py-1 text-gray-500">Misi Kami</h2>
            </div>
            <div className="md:w-2/3">
                <div className="grid grid-cols-1 gap-12">
                    
                    {/* Misi 1 */}
                    <div className="group">
                        <span className="text-6xl font-serif text-gray-200 font-bold group-hover:text-black transition-colors duration-500">01.</span>
                        <h3 className="text-xl font-bold uppercase tracking-wider mt-2 mb-4">Demokratisasi Akses Hukum</h3>
                        <p className="text-gray-600 font-light leading-relaxed">
                            Menyediakan akses terhadap pengetahuan hukum yang akurat, gratis, dan mudah dipahami bagi seluruh lapisan masyarakat tanpa terkecuali, meruntuhkan tembok bahasa hukum yang rumit.
                        </p>
                    </div>

                    {/* Misi 2 */}
                    <div className="group">
                        <span className="text-6xl font-serif text-gray-200 font-bold group-hover:text-black transition-colors duration-500">02.</span>
                        <h3 className="text-xl font-bold uppercase tracking-wider mt-2 mb-4">Pendidikan Kritis</h3>
                        <p className="text-gray-600 font-light leading-relaxed">
                            Membangun nalar kritis publik dalam membaca produk legislasi dan kebijakan negara, agar hukum tidak hanya dipatuhi, tetapi juga dipahami konteks politik dan sosialnya.
                        </p>
                    </div>

                    {/* Misi 3 */}
                    <div className="group">
                        <span className="text-6xl font-serif text-gray-200 font-bold group-hover:text-black transition-colors duration-500">03.</span>
                        <h3 className="text-xl font-bold uppercase tracking-wider mt-2 mb-4">Advokasi Digital</h3>
                        <p className="text-gray-600 font-light leading-relaxed">
                            Menjadi garda terdepan dalam mengawal isu-isu hak digital, privasi data, dan kebebasan berekspresi di ruang siber Indonesia.
                        </p>
                    </div>

                </div>
            </div>
        </div>
      </section>

      {/* 4. NILAI DASAR (Cards) */}
      <section className="py-20 px-6 bg-black text-white">
          <div className="max-w-6xl mx-auto">
              <h2 className="text-center font-serif text-3xl mb-16">Nilai Dasar Hegemoni Lex</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="border border-gray-700 p-8 hover:bg-white hover:text-black transition-colors duration-500">
                      <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Value 01</div>
                      <h4 className="text-xl font-bold mb-2">Independensi</h4>
                      <p className="text-sm opacity-80 leading-relaxed">Kami tidak terikat pada partai politik atau kepentingan korporasi manapun.</p>
                  </div>
                  <div className="border border-gray-700 p-8 hover:bg-white hover:text-black transition-colors duration-500">
                      <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Value 02</div>
                      <h4 className="text-xl font-bold mb-2">Integritas</h4>
                      <p className="text-sm opacity-80 leading-relaxed">Menyajikan data dan analisis hukum yang dapat dipertanggungjawabkan secara akademis.</p>
                  </div>
                  <div className="border border-gray-700 p-8 hover:bg-white hover:text-black transition-colors duration-500">
                      <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Value 03</div>
                      <h4 className="text-xl font-bold mb-2">Inklusivitas</h4>
                      <p className="text-sm opacity-80 leading-relaxed">Hukum adalah milik semua, tanpa memandang gender, kelas sosial, atau latar belakang.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* FOOTER dihapus agar menggunakan Footer Global dari layout.tsx, atau biarkan jika layout belum punya footer */}
      
    </div>
  );
}