// app/artikel/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ArticleRating from '@/components/ArticleRating';
import ViewCounter from '@/components/ViewCounter';
import ArticleContent from '@/components/ArticleContent';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { markdownLikeToHtml } from '@/lib/articleFormatting';
import { getPreviewText } from '@/lib/utils';

// Agar halaman ini selalu mengambil data terbaru (tidak cache mati)
export const revalidate = 300;

// UPDATE: Tipe props untuk Next.js 15 (params adalah Promise)
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const BASE_URL = 'https://hegemonilex.com';

function toAbsoluteUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/')) return `${BASE_URL}${imageUrl}`;
  return `${BASE_URL}/${imageUrl}`;
}

// Dynamic SEO Meta Tags per Artikel
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (!article) {
    return {
      title: 'Artikel Hegemoni Lex',
      description: 'Baca artikel dan analisis hukum terbaru di Hegemoni Lex.',
    };
  }

  const title = article.title || 'Artikel Hegemoni Lex';
  const description = getPreviewText(article.excerpt, article.content || '', 160) || 'Baca artikel dan analisis hukum terbaru di Hegemoni Lex.';
  const url = `${BASE_URL}/artikel/${slug}`;
  const image = toAbsoluteUrl(article.image) || `${BASE_URL}/logohl.png`;
  const publishedIso = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined;
  const authorName = article.author?.name || article.author?.email || 'Tim Redaksi';

  return {
    title,
    description,
    keywords: [article.category, 'hukum', 'kebijakan publik', 'hegemoni lex'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'HEGEMONI LEX',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: publishedIso,
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@hegemoni_lex',
      site: '@hegemoni_lex',
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  
  // 1. SOLUSI ERROR: Await params sebelum digunakan
  const { slug } = await params; 

  // 2. Cek jika slug kosong (mencegah error Prisma)
  if (!slug) {
     return notFound();
  }

  // 3. AMBIL DATA DARI DATABASE
  let article: any = null;
  try {
    article = await prisma.article.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error('Article detail DB fallback:', error);
  }

  // 4. JIKA ARTIKEL TIDAK DITEMUKAN
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
         <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-gray-200">404</h1>
         <h2 className="font-serif text-2xl font-bold mb-6">Artikel Tidak Ditemukan</h2>
         <p className="text-gray-500 mb-8 text-center max-w-md text-sm leading-relaxed">
           Mungkin artikel ini telah dihapus, ditarik oleh redaksi, atau link yang Anda tuju salah.
         </p>
         <Link href="/" className="border-b border-black pb-1 text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
           ← KEMBALI KE BERANDA
         </Link>
      </div>
    );
  }

  let latestArticles: any[] = [];
  try {
    latestArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isArchived: false,
        NOT: { id: article.id },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error('Latest article list fallback:', error);
  }

  const authorName = article.author?.name || article.author?.email || 'Tim Redaksi';
  const publishedLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const formatDateShort = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // 5. JIKA DITEMUKAN: TAMPILKAN ARTIKEL
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20 overflow-x-hidden">
      
      {/* View Counter (invisible, tracks views) */}
      <ViewCounter articleId={article.id} />
      <div className="pt-14 md:pt-20">
        <article className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_40px_-32px_rgba(0,0,0,0.45)]">
            {article.image ? (
              <div className="relative w-full h-[180px] md:h-[280px] lg:h-[420px] bg-gray-100">
                <img src={article.image} alt={article.title} className="absolute inset-0 h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute left-4 top-4 md:left-8 md:top-8 z-10">
                  <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    {article.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-8 md:pb-8 z-10">
                  <h1 className="w-full text-[18px] md:text-[32px] lg:text-[44px] font-serif font-bold leading-[1.25] text-white [text-wrap:balance] [overflow-wrap:break-word] drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] lg:max-w-[75%]">
                    {article.title}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="px-5 py-10 md:px-8 md:py-14 border-b border-gray-200">
                <span className="rounded-md bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  {article.category.replace(/_/g, ' ')}
                </span>
                <h1 className="mt-4 text-2xl md:text-5xl font-serif font-bold leading-tight text-gray-900">{article.title}</h1>
              </div>
            )}

            <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-serif font-bold text-gray-600">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{authorName}</p>
                  <p className="text-xs text-gray-500">{publishedLabel}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">~ {Math.max(3, Math.round((article.content?.length || 0) / 900))} min read</div>
            </div>
          </header>

          {(article.imageSourceUrl || article.imageCopyright) && (
            <div className="mt-3 text-[11px] text-gray-500 flex flex-wrap gap-2">
              {article.imageSourceUrl && (
                <a href={article.imageSourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-black">
                  Sumber Foto
                </a>
              )}
              {article.imageCopyright && <span>Copyright: {article.imageCopyright}</span>}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8">
              <ArticleContent
                html={markdownLikeToHtml(article.content || '')}
                className="article-prose prose prose-sm md:prose-lg prose-gray prose-p:whitespace-pre-wrap prose-li:whitespace-pre-wrap prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-4 max-w-none font-serif leading-relaxed text-gray-800"
              />

              {Array.isArray(article.references) && article.references.length > 0 && (
                <section className="mt-10 border-t border-gray-200 pt-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-3 text-gray-600">Referensi</h2>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 break-words">
                    {article.references.map((item: unknown, index: number) => {
                      if (typeof item !== 'string' || !item.trim()) return null;
                      const isUrl = /^https?:\/\//i.test(item);
                      return (
                        <li key={`${item}-${index}`} className="break-words overflow-wrap-anywhere">
                          {isUrl ? (
                            <a href={item} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-black break-all">
                              {item}
                            </a>
                          ) : (
                            item
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}
            </div>

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-3">Penulis</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-serif font-bold text-gray-600">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-serif font-bold text-base text-gray-900 leading-tight">{authorName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Kontributor Hegemoni Lex</p>
                  </div>
                </div>
              </div>

              {latestArticles.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Artikel Terkait</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {latestArticles.slice(0, 4).map((item) => (
                      <Link key={item.id} href={`/artikel/${item.slug}`} className="group flex gap-3 p-4 hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] italic font-serif">HL</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-700 font-semibold mb-1">{item.category.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-bold leading-snug text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">{item.title}</p>
                          <p className="mt-1 text-[11px] text-gray-400">{formatDateShort(item.publishedAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>
      </div>

      {latestArticles.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 md:px-6 mt-12 md:mt-16">
          <div className="mb-6 md:mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rekomendasi</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mt-2">Tulisan Terbaru</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {latestArticles.map((item) => (
              <Link key={item.id} href={`/artikel/${item.slug}`} className="group block rounded-xl border border-gray-200 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic text-sm">Hegemoni Lex</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="inline-block mb-2 rounded bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-serif font-bold text-[15px] leading-snug line-clamp-2 text-gray-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {getPreviewText(item.excerpt, item.content || '', 110)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {item.author?.name || item.author?.email || 'Tim Redaksi'} · {formatDateShort(item.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

{/* --- FITUR RATING --- */}
<div className="max-w-xl mx-auto px-4 md:px-0 mt-10 md:mt-14">
    <ArticleRating articleId={article.id} />
</div>

      {/* FOOTER KECIL */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-10 md:mt-20 pt-8 md:pt-10 border-t border-black">
        <p className="text-center text-[10px] uppercase tracking-widest text-gray-400">
            © 2026 Hegemoni Lex Portal
        </p>
      </div>
    </div>
  );
}