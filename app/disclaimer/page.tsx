// app/disclaimer/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-20">
      
      {/* HEADER SIMPLE */}
      <nav className="border-b border-gray-100 py-6 px-6 mb-12 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
             <div className="relative w-8 h-8">
                <Image src="/logohl.png" alt="Logo" fill className="object-contain" /> 
             </div>
             <span className="font-serif font-bold text-lg">Hegemoni Lex</span>
        </Link>
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all">
            Kembali
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8">Disclaimer</h1>
        <p className="text-gray-500 text-sm mb-12 uppercase tracking-widest font-bold">Terakhir Diperbarui: Januari 2026</p>

        <div className="prose prose-lg text-gray-800 leading-relaxed space-y-8 text-justify">
            
            <section>
                <h3 className="text-xl font-bold font-serif mb-3">1. Identitas Platform</h3>
                <p>
                    Hegemoni Lex adalah sebuah inisiatif independen (startup) yang dikelola oleh tim pengembang dan mahasiswa hukum. Kami <strong>bukanlah firma hukum, lembaga bantuan hukum, atau institusi pemerintah</strong>.
                </p>
                <p>
                    Seluruh konten yang dimuat dalam situs ini bertujuan sebagai sarana <strong>edukasi, literasi, dan diskursus akademik</strong> semata.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">2. Bukan Nasihat Hukum (Legal Advice)</h3>
                <p>
                    Artikel, opini, dan analisis yang tayang di Hegemoni Lex tidak dapat dimaknai sebagai nasihat hukum formal (<em>legal opinion</em>). Informasi yang tersedia mungkin tidak mencerminkan perkembangan hukum terbaru atau putusan pengadilan terkini.
                </p>
                <p>
                    Kami sangat menyarankan pembaca untuk berkonsultasi langsung dengan advokat atau ahli hukum yang berwenang jika menghadapi masalah hukum spesifik. Hegemoni Lex tidak bertanggung jawab atas kerugian materiil maupun imateriil yang timbul akibat penggunaan informasi dari situs ini sebagai dasar tindakan hukum.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">3. Konten Pengguna (User Generated Content)</h3>
                <p>
                    Sebagian konten di Hegemoni Lex ditulis oleh kontributor luar (penulis tamu). Pandangan dan opini yang tertuang dalam tulisan tersebut adalah <strong>tanggung jawab pribadi penulis</strong> dan tidak selalu mencerminkan sikap resmi redaksi Hegemoni Lex.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">4. Hak Cipta</h3>
                <p>
                    Hegemoni Lex menghormati hak kekayaan intelektual. Jika Anda menemukan konten di situs kami yang melanggar hak cipta Anda, silakan hubungi kami melalui halaman Lapor Masalah atau email admin, dan kami akan segera menindaklanjutinya.
                </p>
            </section>

            <div className="pt-8 border-t border-gray-200 mt-12">
                <p className="text-sm text-gray-500 italic">
                    Jika memiliki pertanyaan lebih lanjut mengenai penyangkalan ini, silakan hubungi tim kami di <a href="mailto:admin@hegemoni.lex" className="underline text-black">admin@hegemoni.lex</a>
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}