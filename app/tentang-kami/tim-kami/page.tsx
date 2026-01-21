// app/tentang-kami/tim-kami/page.tsx
import Image from 'next/image';

export default function TimKamiPage() {
  // Data Dummy Tim (Bisa Anda sesuaikan dengan data asli)
  const teamMembers = [
    { name: "Fitra Adyaksa", role: "Pemimpin Redaksi", image: "/team1.jpg" }, // Pastikan ada gambar placeholder atau ganti src
    { name: "Noel Kumaat", role: "Editor In Chief", image: "/team2.jpg" },
    { name: "Lex Hegemoni", role: "Kontributor Utama", image: "/team3.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* CATATAN: 
          Saya sudah menghapus kode <nav> manual di sini.
          Sekarang halaman ini akan otomatis menggunakan Navbar Global yang sama dengan Beranda.
          
          Saya tambahkan 'pt-32' (Padding Top) di bawah ini agar judul tidak tertutup Navbar.
      */}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block py-1 px-3 border border-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-gray-500">
              Redaksi & Kontributor
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 leading-tight">
              Di Balik Hegemoni Lex
            </h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light">
              Kami adalah Sekelompok orang yang percaya bahwa 
              pengetahuan hukum harus inklusif, membebaskan, dan dapat diakses oleh siapa saja.
            </p>
        </div>

        {/* TEAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            
            {/* CONTOH CARD MEMBER 1 (NOEL - Sesuai Screenshot) */}
            <div className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border border-gray-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder Image - Ganti dengan foto asli */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-serif italic">
                        <img src="/noel.jpg" alt="Noel Kumaat" className="w-full h-full object-cover" />
                    </div>
                    {/* Jika sudah ada foto, pakai ini:
                    <Image src="/foto-noel.jpg" alt="Noel Kumaat" fill className="object-cover" /> 
                    */}
                </div>
                <h3 className="text-xl font-serif font-bold mb-1">Noel Kumaat</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Co-Founder & Editor</p>
            </div>

            {/* CONTOH CARD MEMBER 2 */}
            <div className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border border-gray-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-serif italic">
                        Photo
                    </div>
                </div>
                <h3 className="text-xl font-serif font-bold mb-1">Fitra Adyaksa</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pemimpin Redaksi</p>
            </div>

             {/* CONTOH CARD MEMBER 3 */}
             <div className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border border-gray-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-serif italic">
                        Photo
                    </div>
                </div>
                <h3 className="text-xl font-serif font-bold mb-1">Kak Riel</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kontributor Hukum</p>
            </div>

        </div>

        {/* JOIN US SECTION */}
        <div className="mt-32 border-t border-gray-100 pt-20 text-center">
            <h2 className="text-2xl font-serif font-bold mb-4">Ingin Berkontribusi?</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">
                Ruang redaksi kami selalu terbuka untuk gagasan baru. Jika Anda memiliki tulisan opini atau analisis hukum, mari bergabung.
            </p>
            <a href="/dashboard/writer/register" className="inline-block bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                Gabung Penulis
            </a>
        </div>

      </main>
    </div>
  );
}