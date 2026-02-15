// app/dashboard/writer/posts/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

// Helper untuk mapping status ke label tampilan
function getStatusLabel(status: string) {
  switch (status) {
    case 'PUBLISHED': return 'Published';
    case 'DRAFT': return 'Draft';
    case 'PENDING': return 'Pending Review';
    case 'REJECTED': return 'Rejected';
    default: return status;
  }
}

export default async function PostsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  // Ambil user dari DB untuk dapatkan ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // Ambil semua artikel milik writer ini
  const myArticles = await prisma.article.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Tulisan Saya</h1>
            <p className="text-gray-500 text-sm">Kelola semua karya tulis Anda di sini. Total: {myArticles.length} artikel.</p>
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
                {myArticles.map((article) => {
                    const statusLabel = getStatusLabel(article.status);
                    return (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 font-bold font-serif text-lg text-gray-800">
                            {article.title}
                        </td>
                        <td className="p-4">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm border border-gray-200">
                                {article.category.replace(/_/g, " ")}
                            </span>
                        </td>
                        <td className="p-4">
                             <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full flex w-max items-center gap-1
                                ${statusLabel === 'Published' ? 'bg-green-100 text-green-700' : ''}
                                ${statusLabel === 'Draft' ? 'bg-gray-200 text-gray-600' : ''}
                                ${statusLabel === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${statusLabel === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                             `}>
                                <span className={`w-1.5 h-1.5 rounded-full 
                                     ${statusLabel === 'Published' ? 'bg-green-600' : ''}
                                     ${statusLabel === 'Draft' ? 'bg-gray-500' : ''}
                                     ${statusLabel === 'Pending Review' ? 'bg-yellow-600' : ''}
                                     ${statusLabel === 'Rejected' ? 'bg-red-600' : ''}
                                `}></span>
                                {statusLabel}
                             </span>
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-xs">
                            {new Date(article.updatedAt).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </td>
                        <td className="p-4 text-right">
                            {article.status === 'PUBLISHED' && (
                                <Link href={`/artikel/${article.slug}`} className="text-xs font-bold text-blue-600 hover:underline mr-4 uppercase tracking-wider">
                                    Lihat
                                </Link>
                            )}
                        </td>
                    </tr>
                    );
                })}
            </tbody>
        </table>
        
        {myArticles.length === 0 && (
            <div className="p-10 text-center text-gray-400">
                Belum ada artikel. Mulai menulis sekarang!
            </div>
        )}
      </div>
    </div>
  );
}