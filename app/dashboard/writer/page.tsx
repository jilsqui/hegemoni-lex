// app/dashboard/writer/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function WriterDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // Ambil statistik real dari database
  const countPublished = await prisma.article.count({
    where: { authorId: user.id, status: 'PUBLISHED' },
  });

  const countPending = await prisma.article.count({
    where: { authorId: user.id, status: 'PENDING' },
  });

  const countDraft = await prisma.article.count({
    where: { authorId: user.id, status: 'DRAFT' },
  });

  const totalArticles = await prisma.article.count({
    where: { authorId: user.id },
  });

  return (
    <div>
      <header className="mb-10 flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Selamat Datang, {user.name || 'Penulis'}!</h1>
            <p className="text-gray-500">Mari berkarya dan menyuarakan keadilan lewat tulisan.</p>
        </div>
        <Link href="/dashboard/writer/create" className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
            + Mulai Menulis
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Artikel Terbit</div>
            <div className="text-4xl font-serif">{countPublished}</div>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Menunggu Review</div>
            <div className="text-4xl font-serif">{countPending}</div>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Draft Tersimpan</div>
            <div className="text-4xl font-serif">{countDraft}</div>
        </div>
      </div>

      {totalArticles === 0 && (
        <div className="bg-blue-50 border border-blue-100 p-8 rounded-lg text-center">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Belum ada tulisan?</h3>
          <p className="text-blue-700 mb-6 max-w-lg mx-auto">
              Gagasan hebat Anda layak didengar. Mulailah menulis artikel hukum pertama Anda hari ini.
          </p>
          <Link href="/dashboard/writer/create" className="inline-block bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
              Tulis Artikel Pertama
          </Link>
        </div>
      )}
    </div>
  );
}