// app/lapor/page.tsx
'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const { data: session } = useSession(); // Deteksi User Login
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("BUG"); // Default: Lapor Bug

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const res = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject,
                message,
                type,
                userEmail: session?.user?.email || null // Kirim email otomatis jika login
            }),
        });

        if (res.ok) {
            alert("✅ Terima kasih! Laporan Anda telah kami terima.");
            router.push('/'); // Balik ke beranda
        } else {
            alert("❌ Gagal mengirim laporan.");
        }
    } catch (error) {
        alert("Terjadi kesalahan jaringan.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 p-8 shadow-sm">
        
        {/* Header Form */}
        <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-serif font-bold mb-2">Pusat Bantuan & Laporan</h1>
            <p className="text-gray-500 text-sm">
                Temukan bug atau punya saran untuk pengembangan website Hegemoni Lex? Sampaikan di sini.
            </p>
        </div>

        {/* DETEKSI IDENTITAS OTOMATIS */}
        {session ? (
            <div className="bg-blue-50 border border-blue-100 p-4 mb-8 flex items-center gap-4 rounded-sm">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Melapor Sebagai</p>
                    <p className="font-bold text-gray-800">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
            </div>
        ) : (
            <div className="bg-yellow-50 border border-yellow-100 p-4 mb-8 rounded-sm text-sm text-yellow-800">
                ⚠️ Anda melapor sebagai <b>Pengunjung Tamu (Anonim)</b>. <Link href="/login" className="underline font-bold">Login di sini</Link> agar kami bisa membalas laporan Anda.
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Pilihan Tipe Laporan */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Jenis Laporan</label>
                <div className="flex gap-4">
                    <button 
                        type="button"
                        onClick={() => setType("BUG")}
                        className={`flex-1 py-3 text-sm font-bold border ${type === 'BUG' ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    >
                        🐛 Lapor Bug / Error
                    </button>
                    <button 
                        type="button"
                        onClick={() => setType("FEEDBACK")}
                        className={`flex-1 py-3 text-sm font-bold border ${type === 'FEEDBACK' ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    >
                        💡 Saran / Masukan
                    </button>
                </div>
            </div>

            {/* Input Judul */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Judul Laporan</label>
                <input 
                    type="text" 
                    placeholder={type === 'BUG' ? "Contoh: Tombol login tidak berfungsi..." : "Contoh: Tambahkan fitur mode gelap..."}
                    className="w-full p-3 border border-gray-300 outline-none focus:border-black transition-colors"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>

            {/* Input Pesan */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Detail Laporan</label>
                <textarea 
                    rows={6}
                    placeholder="Jelaskan secara detail apa yang terjadi..." 
                    className="w-full p-3 border border-gray-300 outline-none focus:border-black transition-colors resize-none"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
            >
                {isLoading ? "MENGIRIM..." : "KIRIM LAPORAN"}
            </button>

        </form>
      </div>
    </div>
  );
}