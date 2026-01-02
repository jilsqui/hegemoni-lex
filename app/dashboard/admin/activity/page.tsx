// app/dashboard/admin/activity/page.tsx
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; 
import ActivityReport from '@/components/ActivityReport';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // 1. AMBIL SEMUA ARTIKEL (Diurutkan terbaru)
  const articles = await prisma.article.findMany({
    include: { author: true },
    orderBy: { updatedAt: 'desc' },
    take: 50 // Batasi 50 aktivitas terakhir agar PDF tidak meledak
  });

  // 2. AMBIL SEMUA USER (Diurutkan terbaru)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // 3. GABUNGKAN & FORMAT DATA UNTUK LAPORAN
  // Kita ubah formatnya agar seragam
  const activityData = [
    ...articles.map(post => ({
        id: `post-${post.id}`,
        date: post.updatedAt.toISOString(), // Gunakan updatedAt sebagai waktu aktivitas
        type: 'ARTIKEL',
        action: post.status, // PUBLISHED / PENDING
        detail: post.title,
        actor: post.author.name || 'Unknown'
    })),
    ...users.map(user => ({
        id: `user-${user.id}`,
        date: user.createdAt.toISOString(),
        type: 'USER',
        action: 'REGISTER',
        detail: `Pendaftaran ${user.email}`,
        actor: user.name || 'User Baru'
    }))
  ];

  // 4. URUTKAN KEMBALI BERDASARKAN WAKTU (Terbaru di atas)
  activityData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
       
       {/* Header Sederhana dengan Tombol Kembali */}
       <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-serif font-bold">Log Aktivitas & Laporan</h1>
                <p className="text-xs text-gray-500 mt-1">Rekapitulasi jejak digital platform untuk keperluan audit.</p>
            </div>
            <Link 
                href="/dashboard/admin" 
                className="px-4 py-2 bg-white border border-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-sm"
            >
                ← Kembali ke Dashboard
            </Link>
       </div>

       {/* Render Komponen Laporan (Client Component) */}
       <ActivityReport data={activityData} />

    </div>
  );
}