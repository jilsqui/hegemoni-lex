import Image from 'next/image';
import Link from 'next/link';

const partners = [
  {
    name: 'BPAN (Barisan Pemuda Adat Nusantara)',
    shortName: 'BPAN',
    logo: '/Logo BPAN.png',
    description: 'Kolaborasi literasi kebijakan dan pengawasan publik yang berpihak pada warga.',
  },
  {
    name: 'XR Indonesia (Extinction Rebellion)',
    shortName: 'XRID',
    logo: '/XRID_logo.png',
    description: 'Kemitraan untuk penguatan advokasi lingkungan, hak sipil, dan partisipasi sosial.',
  },
  {
    name: 'Pomanara',
    shortName: 'Pomanara',
    logo: '',
    description: 'Kolaborasi penguatan jejaring warga untuk pendidikan publik, advokasi, dan gerakan komunitas.',
  },
];

export default function MitraPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="pt-24 md:pt-32 pb-10 md:pb-14 px-4 md:px-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block py-1 px-3 border border-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-500">
            Profil
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
            Jaringan Kolaborasi
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-500 leading-relaxed">
            Kami tumbuh bersama komunitas dan lembaga yang memiliki visi serupa: memperluas literasi hukum dan kebijakan publik secara kritis, terbuka, dan berdampak.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {partners.map((partner) => (
            <article
              key={partner.shortName}
              className="group bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm hover:shadow-[0_16px_48px_-24px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Mitra Resmi
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 border border-gray-200 text-gray-500">
                  {partner.shortName}
                </span>
              </div>

              <div className="h-28 md:h-32 bg-gray-50 border border-gray-100 rounded-sm flex items-center justify-center p-4 md:p-6 mb-6">
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.shortName}`}
                    width={220}
                    height={100}
                    className="max-h-full w-auto object-contain"
                  />
                ) : (
                  <span className="text-lg md:text-xl font-serif font-bold text-gray-400 tracking-widest uppercase">
                    {partner.shortName}
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-serif font-bold mb-2 group-hover:text-gray-700 transition-colors">
                {partner.name}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {partner.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 md:mt-14 border border-gray-200 bg-gray-50 p-5 md:p-7 text-center">
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
            Tertarik bergabung ke jaringan Hegemoni LEX? Hubungi kami untuk kolaborasi program, publikasi, atau edukasi komunitas.
          </p>
          <Link
            href="/hubungi-kami"
            className="inline-block mt-4 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-gray-800 transition-colors"
          >
            Hubungi Kami
          </Link>
        </div>
      </main>
    </div>
  );
}
