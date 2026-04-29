import Link from 'next/link';
import { getPreviewText } from '@/lib/utils';

type ArticleSnippet = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  publishedAt?: Date | string | null;
};

type HomeHybridWidgetProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  articles: ArticleSnippet[];
  emptyTitle: string;
  emptyDescription: string;
  emptyHint: string;
};

function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  });
}

export default function HomeHybridWidget({
  eyebrow,
  title,
  description,
  href,
  articles,
  emptyTitle,
  emptyDescription,
  emptyHint,
}: HomeHybridWidgetProps) {
  const lead = articles[0];
  const rest = articles.slice(1, 4);
  const hasItems = articles.length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_50px_-35px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:px-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-gray-400">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-gray-900">{title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${hasItems ? 'bg-gray-900 text-white' : 'bg-amber-100 text-amber-800'}`}>
          {hasItems ? 'Dynamic' : 'Coming Soon'}
        </span>
      </div>

      {hasItems ? (
        <div className="space-y-4 p-4 md:p-5">
          <Link href={`/artikel/${lead.slug}`} className="group block overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              {lead.image ? (
                <img
                  src={lead.image}
                  alt={lead.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 text-white/20">
                  <span className="font-serif text-5xl italic">HL</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute left-0 right-0 bottom-0 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/65">{lead.category.replace(/_/g, ' ')}</p>
                <h4 className="mt-2 text-lg font-serif font-bold leading-tight text-white">{lead.title}</h4>
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/75 line-clamp-3">
                  {getPreviewText(lead.excerpt, lead.content, 120)}
                </p>
              </div>
            </div>
          </Link>

          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/artikel/${article.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:border-gray-900 hover:bg-gray-950 hover:text-white"
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 group-hover:border-white/20 group-hover:text-white/60">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400 group-hover:text-white/55">
                      {article.category.replace(/_/g, ' ')} · {formatDateShort(article.publishedAt)}
                    </p>
                    <h4 className="mt-1 font-serif text-sm font-bold leading-snug line-clamp-2">{article.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gray-400">Narasi aktif</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
            <Link href={href} className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.18em] text-gray-900 underline underline-offset-4">
              Lihat semua →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 md:p-5">
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gray-400">{emptyTitle}</p>
            <h4 className="mt-3 text-2xl font-serif font-bold text-gray-900">Coming soon</h4>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{emptyDescription}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{emptyHint}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['Riset', 'Wawasan', 'Kurasi'].map((item) => (
              <div key={item} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400">{item}</p>
              </div>
            ))}
          </div>

          <Link href={href} className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black">
            Jelajahi kategori →
          </Link>
        </div>
      )}
    </section>
  );
}
