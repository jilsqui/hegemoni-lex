'use client';

import Image from 'next/image';
import Link from 'next/link';

type MissionItem = {
  title: string;
  subtitle: string;
  image: string;
  description: string;
  linkCategory?: string;
};

export default function MissionCinematic({ items }: { items: MissionItem[] }) {
  const themeAccents = ['#1e40af', '#059669', '#d97706', '#7c3aed'];
  const clonedItems = [...items, ...items];

  return (
    <section className="bg-white py-12 md:py-20 px-4 md:px-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 md:mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-3 block">Misi Kami</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight text-gray-900">Empat Poros Hegemoni Lex</h2>
          <p className="text-sm md:text-base text-gray-500 mt-3 max-w-2xl leading-relaxed">
            Hukum, kebijakan publik, opini, dan edukasi kami hadirkan sebagai arus gagasan yang hidup, tajam, dan relevan untuk publik.
          </p>
        </div>

        <div className="overflow-hidden">
          <div className="animate-marquee-cards gap-4 md:gap-5 lg:gap-6 hover:[animation-play-state:paused]">
            {clonedItems.map((item, index) => {
              const accent = themeAccents[index % 4];

              return (
                <Link
                  key={`${item.title}-${index}`}
                  href={`/artikel?q=${encodeURIComponent(item.linkCategory || item.title)}`}
                  className="group block w-[82vw] sm:w-[44vw] lg:w-[280px] xl:w-[282px] rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{ outlineColor: accent }}
                  aria-label={`Buka topik ${item.title}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 82vw, (max-width: 1024px) 44vw, 282px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                    />
                  </div>

                  <div className="p-4 md:p-5">
                    <p className="text-[11px] uppercase font-semibold tracking-[0.16em] text-gray-600 mb-2">{item.subtitle}</p>
                    <h3 className="text-lg md:text-xl font-serif font-bold leading-tight mb-2" style={{ color: accent }}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.description}</p>
                  </div>

                  <div className="h-1.5 transition-all duration-300 group-hover:h-2" style={{ backgroundColor: accent }} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
