// app/dashboard/admin/page.tsx
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; 
import AdminChart from '@/components/AdminChart';
import AdminNotification from '@/components/AdminNotification'; 
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // --- 1. AMBIL DATA STATISTIK UTAMA ---
  const totalUsers = await prisma.user.count();
  const countPending = await prisma.article.count({ where: { status: 'PENDING' } });
  const countPublished = await prisma.article.count({ where: { status: 'PUBLISHED', isArchived: false } });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  
  // Hitung Total Pengunjung (Visitor)
  const totalVisitors = await prisma.visitor.count();
  const todayVisitors = await prisma.visitor.count({
    where: {
      createdAt: {
        gte: startOfToday,
        lt: endOfToday,
      },
    },
  });

  const todayArticleViews = await prisma.articleView.count({
    where: {
      viewDate: startOfToday,
    },
  });

  // Hitung Total Komentar
  const totalComments = await prisma.comment.count();

  // Hitung Total Views (Semua Artikel)
  const totalViewsAgg = await prisma.article.aggregate({ _sum: { viewCount: true } });
  const totalViews = totalViewsAgg._sum.viewCount || 0;

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
    where: {
      status: 'PUBLISHED',
      isArchived: false,
    },
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
  const visitorMap = new Map<string, { date: string; jumlah: number }>();
  
  // Inisialisasi map dengan 0 untuk 30 hari terakhir agar grafik tidak bolong
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayKey = d.toISOString().slice(0, 10);
    visitorMap.set(dayKey, {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      jumlah: 0,
    });
  }

  // Isi map dengan data asli dari database
  rawVisitors.forEach(v => {
      const dayKey = v.createdAt.toISOString().slice(0, 10);
      if (visitorMap.has(dayKey)) {
          const current = visitorMap.get(dayKey)!;
          visitorMap.set(dayKey, { ...current, jumlah: current.jumlah + 1 });
      }
  });

  // Convert ke Array untuk Recharts
  const visitorChartData = Array.from(visitorMap.values());

  const rawArticleViews = await prisma.articleView.groupBy({
    by: ['viewDate'],
    where: {
      viewDate: {
        gte: thirtyDaysAgo,
      },
    },
    _count: { id: true },
    orderBy: { viewDate: 'asc' },
  });

  const articleViewMap = new Map<string, { date: string; jumlah: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayKey = d.toISOString().slice(0, 10);
    articleViewMap.set(dayKey, {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      jumlah: 0,
    });
  }

  rawArticleViews.forEach((v) => {
    const dayKey = v.viewDate.toISOString().slice(0, 10);
    if (articleViewMap.has(dayKey)) {
      const current = articleViewMap.get(dayKey)!;
      articleViewMap.set(dayKey, { ...current, jumlah: v._count.id });
    }
  });

  const articleViewChartData = Array.from(articleViewMap.values());

  const topArticleIdsToday = await prisma.articleView.groupBy({
    by: ['articleId'],
    where: { viewDate: startOfToday },
    _count: { articleId: true },
    orderBy: { _count: { articleId: 'desc' } },
    take: 5,
  });

  const topArticles = topArticleIdsToday.length
    ? await prisma.article.findMany({
        where: {
          id: { in: topArticleIdsToday.map((item) => item.articleId) },
        },
        select: { id: true, title: true },
      })
    : [];

  const titleById = new Map(topArticles.map((item) => [item.id, item.title]));
  const topArticleData = topArticleIdsToday.map((item) => ({
    name: titleById.get(item.articleId) || 'Artikel',
    jumlah: item._count.articleId,
  }));


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


      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        
        {/* 1. PENDING */}
        <div className="bg-white p-5 border-l-4 border-yellow-400 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Verifikasi</h3>
                <div className="text-3xl font-serif font-bold text-black">{countPending}</div>
            </div>
            <span className="absolute right-2 bottom-0 text-5xl text-yellow-400 opacity-10 font-serif font-bold">!</span>
        </div>

          {/* 2. PENGUNJUNG HARI INI */}
        <div className="bg-white p-5 border-l-4 border-purple-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pengunjung Hari Ini</h3>
               <div className="text-3xl font-serif font-bold text-black">{todayVisitors.toLocaleString()}</div>
             </div>
             <span className="absolute right-2 bottom-2 text-3xl text-purple-500 opacity-20">👁</span>
        </div>

          {/* 3. TOTAL PENGUNJUNG */}
          <div className="bg-white p-5 border-l-4 border-fuchsia-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Pengunjung</h3>
               <div className="text-3xl font-serif font-bold text-black">{totalVisitors.toLocaleString()}</div>
             </div>
             <span className="absolute right-2 bottom-2 text-3xl text-fuchsia-500 opacity-20">◎</span>
          </div>

          {/* 4. TAYANG */}
        <div className="bg-white p-5 border-l-4 border-green-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Artikel Tayang</h3>
                <div className="text-3xl font-serif font-bold text-black">{countPublished}</div>
             </div>
             <span className="absolute right-2 bottom-0 text-5xl text-green-500 opacity-10 font-serif font-bold">✓</span>
        </div>

        {/* 5. USERS */}
        <div className="bg-white p-5 border-l-4 border-blue-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total User</h3>
                <div className="text-3xl font-serif font-bold text-black">{totalUsers}</div>
             </div>
             <span className="absolute right-2 bottom-0 text-5xl text-blue-500 opacity-10 font-serif font-bold">@</span>
        </div>

      </div>

      {/* STATS ROW 2: Views & Komentar (Private - Hanya Admin) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 border-l-4 border-indigo-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Views (Semua Artikel)</h3>
                <div className="text-3xl font-serif font-bold text-black">{totalViews.toLocaleString()}</div>
                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">Hanya terlihat oleh Admin</p>
             </div>
             <span className="absolute right-2 bottom-2 text-3xl text-indigo-500 opacity-20">👁</span>
        </div>
          <div className="bg-white p-5 border-l-4 border-pink-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">View Artikel Hari Ini</h3>
               <div className="text-3xl font-serif font-bold text-black">{todayArticleViews.toLocaleString()}</div>
               <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">Unique per perangkat per hari</p>
             </div>
             <span className="absolute right-2 bottom-2 text-3xl text-pink-500 opacity-20">↗</span>
          </div>
        <div className="bg-white p-5 border-l-4 border-orange-500 shadow-sm rounded-r-md flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Komentar</h3>
                <div className="text-3xl font-serif font-bold text-black">{totalComments.toLocaleString()}</div>
                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">Hanya terlihat oleh Admin</p>
             </div>
             <span className="absolute right-2 bottom-2 text-3xl text-orange-500 opacity-20">💬</span>
        </div>
      </div>

      {/* GRAFIK DINAMIS (Visitor / Article) */}
      <AdminChart 
        articleData={articleChartData} 
        visitorData={visitorChartData} 
        articleViewData={articleViewChartData}
        topArticleData={topArticleData}
      />

    </div>
  );
}