"use client";

import { useState } from "react";

export default function BookSynopsis({ synopsis }: { synopsis?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!synopsis) return null;

  const preview = synopsis.length > 220 ? synopsis.slice(0, 220) + "…" : synopsis;

  return (
    <section className="rounded-3xl border border-gray-200 bg-gray-50 p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Sinopsis Buku</p>
      <h2 className="mt-3 text-2xl font-serif font-bold text-gray-900">Baca Selengkapnya</h2>
      <p className="mt-4 text-base leading-7 text-gray-700">
        {expanded ? synopsis : preview}
      </p>
      {synopsis.length > 220 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black hover:underline"
        >
          {expanded ? "Tutup Ringkasan" : "Baca Selengkapnya"}
        </button>
      )}
    </section>
  );
}
