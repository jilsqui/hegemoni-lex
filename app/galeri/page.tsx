import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UploadGalleryButton from "./components/UploadGalleryButton"; // Kita buat sebentar lagi
import AdminApprovalCard from "./components/AdminApprovalCard";   // Kita buat sebentar lagi

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role; // 'ADMIN', 'WRITER', atau undefined

  // 1. Ambil Data APPROVED (Untuk Semua Orang)
  const approvedGalleries = await prisma.gallery.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Ambil Data PENDING (Khusus Admin)
  let pendingGalleries: any[] = [];
  if (userRole === 'ADMIN') {
    pendingGalleries = await prisma.gallery.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
  }

  return (
    <div className="min-h-screen bg-white">
        {/* --- HEADER --- */}
        <div className="pt-20 md:pt-32 pb-8 md:pb-12 px-4 md:px-6 text-center bg-gray-50">
            <h1 className="font-serif font-bold text-3xl md:text-4xl mb-2">Galeri Kegiatan</h1>
            <p className="text-xs uppercase tracking-widest text-gray-500">Dokumentasi Aktivitas Hegemoni Lex</p>
            
            {/* TOMBOL UPLOAD (Hanya untuk ADMIN & WRITER) */}
            {(userRole === 'ADMIN' || userRole === 'WRITER') && (
                <div className="mt-8">
                    <UploadGalleryButton userRole={userRole} />
                </div>
            )}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            
            {/* --- SECTION ADMIN: MENUNGGU PERSETUJUAN --- */}
            {userRole === 'ADMIN' && pendingGalleries.length > 0 && (
                <div className="mb-16 p-6 border-2 border-yellow-400 bg-yellow-50 rounded-lg">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        ⚠️ Menunggu Persetujuan ({pendingGalleries.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {pendingGalleries.map((item) => (
                            <AdminApprovalCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            )}

            {/* --- SECTION PUBLIK: GALERI TAYANG --- */}
            {approvedGalleries.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
                    <span className="text-4xl">📷</span>
                    <p className="mt-4 text-gray-400 font-bold uppercase text-xs">Belum ada dokumentasi</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 md:gap-1">
                    {approvedGalleries.map((item) => (
                        <div key={item.id} className="group relative aspect-square bg-gray-100 cursor-pointer overflow-hidden">
                            <Image 
                                src={item.imageUrl} 
                                alt={item.title || 'Foto'} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                                <div>
                                    <h3 className="text-white font-serif font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-300 text-xs mt-1">{item.description}</p>
                                </div>
                            </div>
                            {/* Jika Admin, kasih tombol hapus kecil */}
                            {userRole === 'ADMIN' && (
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100">
                                    <form action={async () => {
                                        'use server';
                                        await prisma.gallery.delete({ where: { id: item.id }});
                                        // Note: Idealnya import deleteGallery dari actions, tapi ini shortcut untuk demo
                                    }}>
                                        <button className="bg-red-600 text-white text-[10px] px-2 py-1 rounded">Hapus</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}