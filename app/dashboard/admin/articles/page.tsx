// app/dashboard/admin/articles/page.tsx
'use client';

import { useState, useEffect } from "react";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  isFeatured: boolean;
  isArchived: boolean;
  viewCount: number;
  image: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string | null;
    email: string;
  };
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/published-list');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // SET FEATURED
  const handleSetFeatured = async (articleId: string) => {
    if (!confirm('Jadikan artikel ini sebagai Fokus Utama di halaman depan?')) return;

    try {
      const res = await fetch('/api/admin/set-featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });

      if (res.ok) {
        alert('Fokus Utama berhasil diperbarui!');
        // Update local state
        setArticles(prev => prev.map(a => ({
          ...a, 
          isFeatured: a.id === articleId
        })));
      } else {
        alert('Gagal memperbarui.');
      }
    } catch { alert('Terjadi kesalahan jaringan.'); }
  };

  // TAKEDOWN
  const handleTakedown = async (articleId: string) => {
    if (!confirm('Yakin ingin men-takedown artikel ini? Artikel akan dihapus dari publikasi.')) return;

    try {
      const res = await fetch('/api/admin/takedown', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });

      if (res.ok) {
        alert('Artikel berhasil di-takedown.');
        setArticles(prev => prev.filter(a => a.id !== articleId));
      } else {
        alert('Gagal takedown.');
      }
    } catch { alert('Terjadi kesalahan jaringan.'); }
  };

  // TOGGLE ARCHIVE
  const handleArchiveToggle = async (articleId: string, currentArchived: boolean) => {
    const action = currentArchived ? 'memulihkan dari arsip' : 'mengarsipkan';
    if (!confirm(`Yakin ingin ${action} artikel ini?`)) return;

    try {
      const res = await fetch('/api/admin/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, isArchived: !currentArchived })
      });

      if (res.ok) {
        alert(`Artikel berhasil di-${currentArchived ? 'pulihkan' : 'arsipkan'}.`);
        setArticles(prev => prev.map(a => 
          a.id === articleId ? { ...a, isArchived: !currentArchived } : a
        ));
      } else {
        alert('Gagal memproses.');
      }
    } catch { alert('Terjadi kesalahan jaringan.'); }
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchFilter = filter === 'all' ? true 
      : filter === 'featured' ? article.isFeatured 
      : article.isArchived;
    
    const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchFilter && matchSearch;
  });

  // Stats
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
  const featuredCount = articles.filter(a => a.isFeatured).length;
  const archivedCount = articles.filter(a => a.isArchived).length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Kelola Artikel</h1>
        <p className="text-gray-500 text-sm">Atur highlight, takedown, arsip, dan pantau views artikel.</p>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm rounded-r-md">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Artikel</h3>
          <div className="text-2xl font-serif font-bold">{articles.length}</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-purple-500 shadow-sm rounded-r-md">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Views</h3>
          <div className="text-2xl font-serif font-bold">{totalViews.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-yellow-500 shadow-sm rounded-r-md">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Fokus Utama</h3>
          <div className="text-2xl font-serif font-bold">{featuredCount}</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-gray-500 shadow-sm rounded-r-md">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Diarsipkan</h3>
          <div className="text-2xl font-serif font-bold">{archivedCount}</div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Semua', count: articles.length },
            { key: 'featured', label: '⭐ Highlight', count: featuredCount },
            { key: 'archived', label: '📦 Arsip', count: archivedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${
                filter === tab.key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-200 px-4 py-2 text-sm outline-none focus:border-black transition-colors w-full md:w-64 rounded text-black placeholder:text-gray-400 bg-white"
        />
      </div>

      {/* ARTICLE LIST */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Memuat data...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white p-10 text-center border border-gray-200 rounded-lg">
          <p className="text-gray-400 font-bold uppercase tracking-widest">Tidak ada artikel ditemukan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div 
              key={article.id} 
              className={`bg-white border rounded-lg shadow-sm p-5 transition-all ${
                article.isFeatured ? 'border-yellow-400 ring-1 ring-yellow-200' : 
                article.isArchived ? 'border-gray-300 opacity-70' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-4 justify-between">
                
                {/* LEFT: Article Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                      {article.category}
                    </span>
                    {article.isFeatured && (
                      <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                        ⭐ FOKUS UTAMA
                      </span>
                    )}
                    {article.isArchived && (
                      <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                        📦 ARSIP
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-serif font-bold mb-2 truncate">{article.title}</h3>

                  <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider font-bold flex-wrap">
                    <span>✍️ {article.author.name || article.author.email}</span>
                    <span>📅 {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">👁</span> 
                      <span className="text-sm font-mono text-purple-600">{(article.viewCount || 0).toLocaleString()}</span> views
                    </span>
                  </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                  {/* Set Featured */}
                  <button
                    onClick={() => handleSetFeatured(article.id)}
                    disabled={article.isFeatured}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                      article.isFeatured
                        ? 'bg-yellow-100 text-yellow-500 cursor-not-allowed'
                        : 'border border-yellow-400 text-yellow-700 hover:bg-yellow-50'
                    }`}
                    title="Jadikan Fokus Utama"
                  >
                    ⭐ Highlight
                  </button>

                  {/* Toggle Archive */}
                  <button
                    onClick={() => handleArchiveToggle(article.id, article.isArchived)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded border transition-all ${
                      article.isArchived
                        ? 'border-green-400 text-green-700 hover:bg-green-50'
                        : 'border-gray-400 text-gray-700 hover:bg-gray-50'
                    }`}
                    title={article.isArchived ? 'Pulihkan dari Arsip' : 'Arsipkan'}
                  >
                    {article.isArchived ? '📤 Pulihkan' : '📦 Arsipkan'}
                  </button>

                  {/* Takedown */}
                  <button
                    onClick={() => handleTakedown(article.id)}
                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                    title="Takedown Artikel"
                  >
                    🚫 Takedown
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
