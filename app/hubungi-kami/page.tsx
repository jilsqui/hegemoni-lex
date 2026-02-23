// app/profil/hubungi-kami/page.tsx
export default function HubungiKamiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 mt-16 md:mt-24 min-h-screen text-center">
      <div className="bg-black text-white py-10 md:py-16 px-5 md:px-8 rounded-sm shadow-xl">
        <h1 className="font-serif font-bold text-2xl md:text-5xl mb-4 md:mb-6">Ingin Berkolaborasi?</h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
          Kami selalu terbuka untuk gagasan baru. Jika Anda memiliki tulisan opini, 
          analisis hukum, atau ingin bekerjasama dalam kegiatan, mari bergabung bersama kami.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto text-left mt-8 md:mt-12">
           <div className="bg-white/10 p-4 md:p-6 rounded border border-white/20">
              <h3 className="font-bold uppercase tracking-widest text-xs text-yellow-500 mb-2">Kirim Tulisan</h3>
              <p className="text-white text-sm">
                 Punya naskah hukum yang kritis? Kirimkan naskah Anda untuk dimuat di rubrik Opini atau Analisis.
              </p>
           </div>
           <div className="bg-white/10 p-6 rounded border border-white/20">
              <h3 className="font-bold uppercase tracking-widest text-xs text-yellow-500 mb-2">Kerjasama & Event</h3>
              <p className="text-white text-sm">
                 Ingin mengundang Hegemoni Lex sebagai media partner atau pembicara? Hubungi humas kami.
              </p>
           </div>
        </div>

        <div className="mt-8 md:mt-12">
            <a href="mailto:redaksi@hegemonilex.id" className="bg-white text-black px-6 py-3 md:px-8 md:py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors inline-block active:bg-gray-300">
               Hubungi Via Email ✉️
            </a>
        </div>
      </div>
    </div>
  );
}