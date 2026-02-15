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
        <p className="text-gray-500 text-sm mb-12 uppercase tracking-widest font-bold">Terakhir Diperbarui: Februari 2026</p>

        <div className="prose prose-lg text-gray-800 leading-relaxed space-y-8 text-justify">
            
            <section>
                <h3 className="text-xl font-bold font-serif mb-3">1. Identitas Platform</h3>
                <p>
                    Hegemoni Lex adalah platform edukasi hukum independen yang dikelola oleh tim pengembang dan mahasiswa hukum. Platform ini <strong>bukan merupakan firma hukum, kantor advokat, lembaga bantuan hukum (LBH), atau instansi pemerintah</strong> dalam bentuk apa pun. Hegemoni Lex tidak terafiliasi dengan institusi pemerintahan, organisasi politik, maupun badan hukum tertentu.
                </p>
                <p>
                    Seluruh konten yang dipublikasikan dalam situs ini ditujukan semata-mata untuk kepentingan <strong>edukasi, literasi hukum, dan diskursus akademik</strong>.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">2. Bukan Nasihat Hukum (Legal Advice)</h3>
                <p>
                    Seluruh artikel, opini, analisis, dan materi yang tersedia di Hegemoni Lex bersifat <strong>informatif dan edukatif</strong>. Konten yang dipublikasikan <strong>tidak dapat dan tidak boleh ditafsirkan sebagai nasihat hukum</strong> (<em>legal advice</em>), pendapat hukum (<em>legal opinion</em>), atau rekomendasi tindakan hukum dalam bentuk apa pun.
                </p>
                <p>
                    Informasi yang disajikan mungkin tidak mencerminkan perkembangan peraturan perundang-undangan terbaru, yurisprudensi terkini, atau perubahan kebijakan hukum yang berlaku. Pembaca <strong>diwajibkan untuk berkonsultasi dengan advokat, konsultan hukum, atau lembaga bantuan hukum yang berwenang</strong> sebelum mengambil keputusan hukum berdasarkan informasi dari situs ini.
                </p>
                <p>
                    Hegemoni Lex beserta seluruh tim redaksi, kontributor, dan afiliasinya <strong>tidak bertanggung jawab atas segala bentuk kerugian</strong>, baik materiil maupun imateriil, langsung maupun tidak langsung, yang timbul dari penggunaan atau ketergantungan terhadap informasi yang tersedia di platform ini.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">3. Konten Pengguna (User-Generated Content)</h3>
                <p>
                    Hegemoni Lex menerima dan mempublikasikan tulisan dari kontributor eksternal (penulis tamu). Segala pandangan, opini, argumen, dan analisis yang tertuang dalam tulisan kontributor merupakan <strong>ekspresi dan tanggung jawab pribadi penulis masing-masing</strong>, serta tidak serta-merta mencerminkan sikap, pandangan, atau kebijakan editorial Hegemoni Lex.
                </p>
                <p>
                    Tim redaksi berhak melakukan penyuntingan editorial tanpa mengubah substansi tulisan demi menjaga kualitas dan standar publikasi.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">4. Hak Kekayaan Intelektual</h3>
                <p>
                    Seluruh konten orisinal yang dipublikasikan di Hegemoni Lex, termasuk namun tidak terbatas pada teks, grafis, logo, dan desain, dilindungi oleh <strong>Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta</strong> serta ketentuan hukum kekayaan intelektual yang berlaku di Republik Indonesia.
                </p>
                <p>
                    Penggunaan ulang, reproduksi, distribusi, atau modifikasi konten dari situs ini tanpa izin tertulis dari Hegemoni Lex dilarang keras. Pengutipan untuk keperluan akademik diperbolehkan dengan tetap mencantumkan sumber secara jelas.
                </p>
                <p>
                    Apabila Anda menemukan konten di situs kami yang diduga melanggar hak cipta Anda, silakan segera menghubungi kami melalui halaman <Link href="/lapor" className="underline text-black font-bold">Lapor Masalah</Link> untuk ditindaklanjuti sesuai prosedur <em>notice and takedown</em>.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">5. Tautan Eksternal</h3>
                <p>
                    Situs ini dapat memuat tautan (<em>hyperlink</em>) ke situs web pihak ketiga. Hegemoni Lex <strong>tidak memiliki kendali dan tidak bertanggung jawab</strong> atas konten, kebijakan privasi, atau praktik situs pihak ketiga tersebut. Pengunjung yang mengakses tautan eksternal bertanggung jawab sepenuhnya atas risiko yang ditimbulkan.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">6. Batasan Tanggung Jawab</h3>
                <p>
                    Sejauh diperbolehkan oleh hukum yang berlaku, Hegemoni Lex <strong>menolak segala bentuk jaminan</strong>, baik tersurat maupun tersirat, mengenai keakuratan, kelengkapan, keandalan, kesesuaian, atau ketersediaan informasi, produk, layanan, atau materi terkait yang tersedia di situs ini. Segala bentuk ketergantungan terhadap informasi di situs ini sepenuhnya menjadi risiko pengunjung.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold font-serif mb-3">7. Perubahan Disclaimer</h3>
                <p>
                    Hegemoni Lex berhak untuk mengubah, memperbarui, atau merevisi ketentuan disclaimer ini sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Pengunjung dianjurkan untuk meninjau halaman ini secara berkala guna mengetahui perubahan terbaru. Dengan terus mengakses dan menggunakan situs ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum.
                </p>
            </section>

            <div className="pt-8 border-t border-gray-200 mt-12">
                <p className="text-sm text-gray-500 italic">
                    Jika memiliki pertanyaan lebih lanjut mengenai disclaimer ini, silakan hubungi tim kami melalui halaman <Link href="/hubungi-kami" className="underline text-black">Hubungi Kami</Link> atau melalui email di <a href="mailto:admin@hegemonilex.id" className="underline text-black">admin@hegemonilex.id</a>.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}