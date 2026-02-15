'use client';

import { useState } from 'react';
import { uploadGalleryAction } from '@/app/action/gallery'; // Pastikan path ini sesuai folder action Anda

export default function UploadGalleryButton({ userRole }: { userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await uploadGalleryAction(formData);
    
    if (res?.error) {
        alert("Gagal: " + res.error);
    } else {
        alert(res?.message || "Berhasil!");
        setIsOpen(false);
        // Refresh halaman otomatis terjadi via server action
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
      >
        + Upload Foto Baru
      </button>

      {/* MODAL / POPUP FORM */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white p-8 w-full max-w-md rounded shadow-2xl relative">
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold"
                >
                    ✕
                </button>
                
                <h3 className="font-serif font-bold text-xl mb-1">Upload Dokumentasi</h3>
                <p className="text-xs text-gray-500 mb-6">
                    {userRole === 'ADMIN' ? 'Foto akan langsung tayang.' : 'Foto akan menunggu persetujuan Admin.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="text" name="title" placeholder="Judul Kegiatan" required className="w-full border border-gray-300 p-3 text-sm text-black placeholder:text-gray-400 focus:outline-black transition-colors bg-white"/>
                    </div>
                    <div>
                        <textarea name="description" placeholder="Deskripsi Singkat" rows={2} className="w-full border border-gray-300 p-3 text-sm text-black placeholder:text-gray-400 focus:outline-black transition-colors bg-white"></textarea>
                    </div>
                    <div>
                        <input type="file" name="image" accept="image/*" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"/>
                    </div>
                    
                    <button disabled={loading} className="w-full bg-black text-white py-3 text-xs font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400 transition-all">
                        {loading ? 'Mengupload...' : 'Kirim Foto'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}