'use client';

import Image from "next/image";
import { updateGalleryStatus } from '@/app/action/gallery';
import { useState } from "react";

// Definisikan tipe data untuk props item agar tidak any
interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
}

export default function AdminApprovalCard({ item }: { item: GalleryItem }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    if (!confirm('Apakah Anda yakin ingin MENAYANGKAN foto ini ke publik?')) return;
    
    setLoading(true);
    const res = await updateGalleryStatus(item.id, 'APPROVED');
    setLoading(false);

    if (res?.error) {
      alert("Gagal menyetujui foto: " + res.error);
    }
  }

  async function handleReject() {
    if (!confirm('Apakah Anda yakin ingin MENOLAK dan MENGHAPUS foto ini?')) return;

    setLoading(true);
    // Kita set status ke REJECTED (atau bisa juga langsung delete tergantung logika di server action)
    const res = await updateGalleryStatus(item.id, 'REJECTED');
    setLoading(false);

    if (res?.error) {
      alert("Gagal menolak foto: " + res.error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-yellow-200 overflow-hidden flex flex-col h-full">
        {/* Preview Gambar */}
        <div className="relative h-40 w-full bg-gray-100">
            <Image 
              src={item.imageUrl} 
              alt={item.title || 'Preview'} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <span className="text-xs font-bold animate-pulse">Memproses...</span>
              </div>
            )}
        </div>

        {/* Detail & Tombol Aksi */}
        <div className="p-4 flex flex-col flex-grow">
            <h4 className="font-serif font-bold text-sm text-black mb-1 line-clamp-1">
              {item.title || 'Tanpa Judul'}
            </h4>
            <p className="text-[10px] text-gray-500 mb-4 line-clamp-2 flex-grow">
              {item.description || 'Tidak ada deskripsi.'}
            </p>
            
            <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button 
                  onClick={handleApprove} 
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-2 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    ✓ Terima
                </button>
                <button 
                  onClick={handleReject} 
                  disabled={loading}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-2 text-[10px] font-bold uppercase tracking-wider rounded border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                    ✕ Tolak
                </button>
            </div>
        </div>
    </div>
  );
}