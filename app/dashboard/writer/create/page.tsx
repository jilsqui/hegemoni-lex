// app/dashboard/writer/create/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE DATA FORM
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("LEGISLASI");
  const [coverImage, setCoverImage] = useState("");

  const categories = [
    "LEGISLASI", "OPINI", "HUKUM_PERDATA", "BISNIS", 
    "KETENAGAKERJAAN", "PROSEDUR", "HUKUM_PIDANA", "HAK_ASASI_MANUSIA"
  ];

  // FUNGSI SUBMIT (Menangani Draft vs Pending)
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>, statusSubmission: string) => {
    e.preventDefault(); // Mencegah reload halaman
    setIsLoading(true);

    try {
        // Kirim data ke API Route
        const res = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                category,
                image: coverImage,
                status: statusSubmission // <-- PENTING: Mengirim status (DRAFT atau PENDING)
            }),
        });

        if (res.ok) {
            // Tampilkan pesan sukses sesuai aksi
            if (statusSubmission === 'DRAFT') {
                alert("✅ Berhasil: Tulisan disimpan sebagai Draft.");
            } else {
                alert("✅ Berhasil: Artikel dikirim ke Redaksi dan menunggu persetujuan (Pending Review).");
            }
            
            // Redirect kembali ke daftar tulisan & Refresh data
            router.push('/dashboard/writer/posts'); 
            router.refresh(); 
        } else {
            // Tampilkan pesan error dari server
            const errorData = await res.json();
            alert("❌ Gagal: " + (errorData.error || "Terjadi kesalahan server"));
        }

    } catch (error) {
        console.error(error);
        alert("❌ Terjadi kesalahan jaringan.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/writer/posts" className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-bold">
            ←
        </Link>
        <div>
            <h1 className="text-3xl font-serif font-bold">Artikel Baru</h1>
            <p className="text-gray-500 text-sm">Tuangkan gagasan hukum Anda.</p>
        </div>
      </div>

      <form className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* KOLOM KIRI: INPUT UTAMA (Judul & Isi) */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Input Judul */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Judul Artikel</label>
                    <input 
                        type="text" 
                        placeholder="Contoh: Analisis Kritis UU Cipta Kerja..." 
                        className="w-full p-4 border-2 border-gray-200 focus:border-black outline-none font-serif text-xl placeholder:text-gray-300 transition-colors bg-white text-black"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Input Konten (Textarea) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Isi Artikel</label>
                    <textarea 
                        rows={15}
                        placeholder="Mulai menulis di sini..." 
                        className="w-full p-4 border-2 border-gray-200 focus:border-black outline-none text-base leading-relaxed placeholder:text-gray-300 transition-colors bg-white resize-y text-black"
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <p className="text-[10px] text-gray-400">*Gunakan markdown untuk format teks sederhana.</p>
                </div>

            </div>

            {/* KOLOM KANAN: PENGATURAN (Kategori, Gambar, Tombol) */}
            <div className="space-y-6">
                
                {/* Pilihan Kategori */}
                <div className="bg-white p-6 border border-gray-200 space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Kategori</label>
                    <select 
                        className="w-full p-3 border border-gray-300 outline-none text-sm bg-gray-50 focus:border-black uppercase cursor-pointer text-black"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>

                {/* Input Cover Image dengan Preview */}
                <div className="bg-white p-6 border border-gray-200 space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Cover Image URL</label>
                    
                    <input 
                        type="text" 
                        placeholder="https://..." 
                        className="w-full p-3 border border-gray-300 outline-none text-sm bg-gray-50 focus:border-black text-black placeholder:text-gray-400"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)} 
                    />

                    {/* Area Preview Gambar */}
                    <div className="aspect-video bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs overflow-hidden relative">
                        {coverImage ? (
                            <img 
                                src={coverImage} 
                                alt="Preview Cover" 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            <span>Preview Image</span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                        *Pastikan link berakhiran .jpg, .png, atau .webp agar muncul.
                    </p>
                </div>

                {/* TOMBOL AKSI (Kirim vs Draft) */}
                <div className="space-y-3 pt-4">
                    {/* Tombol 1: Kirim ke Redaksi (PENDING) */}
                    <button 
                        type="button"
                        onClick={(e) => handleSubmit(e, 'PENDING')}
                        disabled={isLoading}
                        className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        {isLoading ? "MENGIRIM..." : "KIRIM KE REDAKSI"}
                    </button>
                    
                    {/* Tombol 2: Simpan Draft (DRAFT) */}
                    <button 
                        type="button"
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        disabled={isLoading}
                        className="w-full bg-white text-black border border-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        SIMPAN SEBAGAI DRAFT
                    </button>
                </div>

            </div>
        </div>

      </form>
    </div>
  );
}