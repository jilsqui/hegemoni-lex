// app/dashboard/writer/posts/page.tsx
import Link from "next/link";

// Data Dummy (Contoh sementara)
const myArticles = [
  {
    id: 1,
    title: "Analisis Dampak RUU Kesehatan terhadap Tenaga Medis",
    category: "LEGISLASI",
    status: "Published",
    date: "24 Nov 2025",
    views: 1240
  },
  {
    id: 2,
    title: "Menggugat Pasal Karet dalam UU ITE Revisi Kedua",
    category: "OPINI",
    status: "Draft",
    date: "26 Nov 2025",
    views: 0
  },
  {
    id: 3,
    title: "Perlindungan Hukum bagi Konsumen Pinjaman Online",
    category: "HUKUM PERDATA",
    status: "Pending Review",
    date: "27 Nov 2025",
    views: 0
  }
];

export default function PostsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Tulisan Saya</h1>
            <p className="text-gray-500 text-sm">Kelola semua karya tulis Anda di sini.</p>
        </div>
        <Link href="/dashboard/writer/create" className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            + Tulis Baru
        </Link>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="p-4 font-bold">Judul Artikel</th>
                    <th className="p-4 font-bold">Kategori</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Tanggal</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {myArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 font-bold font-serif text-lg text-gray-800">
                            {article.title}
                        </td>
                        <td className="p-4">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm border border-gray-200">
                                {article.category}
                            </span>
                        </td>
                        <td className="p-4">
                             <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full flex w-max items-center gap-1
                                ${article.status === 'Published' ? 'bg-green-100 text-green-700' : ''}
                                ${article.status === 'Draft' ? 'bg-gray-200 text-gray-600' : ''}
                                ${article.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' : ''}
                             `}>
                                <span className={`w-1.5 h-1.5 rounded-full 
                                     ${article.status === 'Published' ? 'bg-green-600' : ''}
                                     ${article.status === 'Draft' ? 'bg-gray-500' : ''}
                                     ${article.status === 'Pending Review' ? 'bg-yellow-600' : ''}
                                `}></span>
                                {article.status}
                             </span>
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-xs">
                            {article.date}
                        </td>
                        <td className="p-4 text-right">
                            <button className="text-xs font-bold text-black hover:underline mr-4 uppercase tracking-wider">Edit</button>
                            <button className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-wider">Hapus</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Jika kosong */}
        {myArticles.length === 0 && (
            <div className="p-10 text-center text-gray-400">
                Belum ada artikel. Mulai menulis sekarang!
            </div>
        )}
      </div>
    </div>
  );
}