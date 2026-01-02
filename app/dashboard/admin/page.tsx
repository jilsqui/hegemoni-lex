// app/dashboard/admin/page.tsx
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; 
import AdminChart from '@/components/AdminChart';
import AdminNotification from '@/components/AdminNotification'; 
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // --- 1. AMBIL DATA STATISTIK UTAMA ---
  const totalUsers = await prisma.user.count();
  const countPending = await prisma.article.count({ where: { status: 'PENDING' } });
  const countPublished = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  
  // Hitung Total Pengunjung (Visitor)
  // Karena tabel Visitor baru dibuat, mungkin masih 0.
  const totalVisitors = await prisma.visitor.count();

  // --- 2. DATA UNTUK NOTIFIKASI ---
  const pendingPosts = await prisma.article.findMany({
    where: { status: 'PENDING' },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const recentApproved = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' },
    take: 3
  });

  // --- 3. DATA GRAFIK ARTIKEL ---
  const articlesByCategory = await prisma.article.groupBy({
    by: ['category'],
    _count: { category: true },
  });
  const articleChartData = articlesByCategory.map((item) => ({
    name: item.category,
    jumlah: item._count.category,
  }));

  // --- 4. DATA GRAFIK PENGUNJUNG (30 HARI TERAKHIR) ---
  // Kita ambil raw data visitor, lalu kelompokkan berdasarkan tanggal di JS
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rawVisitors = await prisma.visitor.findMany({
    where: {
        createdAt: {
            gte: thirtyDaysAgo
        }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Format data: { "12 Jan": 5, "13 Jan": 10, ... }
  const visitorMap = new Map<string, number>();
  
  // Inisialisasi map dengan 0 untuk 30 hari terakhir agar grafik tidak bolong
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); // "27 Des"
    visitorMap.set(label, 0);
  }

  // Isi map dengan data asli dari database
  rawVisitors.forEach(v => {
      const label = v.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (visitorMap.has(label)) {
          visitorMap.set(label, (visitorMap.get(label) || 0) + 1);
      }
  });

  // Convert ke Array untuk Recharts
  const visitorChartData = Array.from(visitorMap).map(([date, jumlah]) => ({ date, jumlah }));


  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-4">
        <div>
            <h1 className="text-xl font-serif font-bold text-black">Dashboard Admin</h1>
            <p className="text-gray-400 text-[10px] mt-1">
                Halo {session.user?.name}, platform berjalan lancar.
            </p>
        </div>
        <div className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <span className="text-xs font-bold">←</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">
                    Web Utama
                </span>
             </Link>
             <div className="h-6 w-[1px] bg-gray-200"></div>
             <AdminNotification pendingPosts={pendingPosts} recentApproved={recentApproved} />
        </div>
      </header>


      {/* STATS CARDS GRID (Sekarang ada 4 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* 1. PENDING */}
        <div className="bg-white p-5 border-l-4 border-yellow-400 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Verifikasi</h3>
                <div className="text-3xl font-serif font-bold text-black">{countPending}</div>
            </div>
            <span className="absolute right-2 bottom-0 text-5xl text-yellow-400 opacity-10 font-serif font-bold">!</span>
        </div>

        {/* 2. PENGUNJUNG (BARU - DI SAMPING PENDING) */}
        <div className="bg-white p-5 border-l-4 border-purple-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pengunjung</h3>
                <div className="text-3xl font-serif font-bold text-black">{totalVisitors}</div>
             </div>
             {/* Icon Mata Sederhana */}
             <span className="absolute right-2 bottom-2 text-3xl text-purple-500 opacity-20">👁</span>
        </div>

        {/* 3. TAYANG */}
        <div className="bg-white p-5 border-l-4 border-green-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Artikel Tayang</h3>
                <div className="text-3xl font-serif font-bold text-black">{countPublished}</div>
             </div>
             <span className="absolute right-2 bottom-0 text-5xl text-green-500 opacity-10 font-serif font-bold">✓</span>
        </div>

        {/* 4. USERS */}
        <div className="bg-white p-5 border-l-4 border-blue-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total User</h3>
                <div className="text-3xl font-serif font-bold text-black">{totalUsers}</div>
             </div>
             <span className="absolute right-2 bottom-0 text-5xl text-blue-500 opacity-10 font-serif font-bold">@</span>
        </div>

      </div>

      {/* GRAFIK DINAMIS (Visitor / Article) */}
      <AdminChart 
        articleData={articleChartData} 
        visitorData={visitorChartData} 
      />

    </div>
  );
}