// components/ArticleRating.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ArticleRating({ articleId }: { articleId: string }) {
  const { data: session, status } = useSession();
  
  // STATE
  const [average, setAverage] = useState(0);    // Nilai Rata-rata Global
  const [count, setCount] = useState(0);        // Jumlah Orang yang Vote
  const [userRating, setUserRating] = useState(0); // Nilai User Sendiri
  const [hover, setHover] = useState(0);        // Efek Hover Mouse
  const [loading, setLoading] = useState(false);

  // Ambil Data Saat Loading
  useEffect(() => {
    // Buat URL endpoint
    let url = `/api/ratings?articleId=${articleId}`;
    if (session?.user?.email) {
        url += `&userEmail=${session.user.email}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAverage(data.average);
        setCount(data.count);
        setUserRating(data.userRating);
      });
  }, [session, articleId]);

  // Fungsi Kirim Rating
  const handleRating = async (value: number) => {
    if (!session?.user?.email) return;

    // Optimistic UI (Update tampilan dulu biar cepat)
    setHover(0);
    setLoading(true);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          userEmail: session.user.email,
          value
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        // Update data real dari server (rata-rata baru & jumlah baru)
        setAverage(data.average);
        setCount(data.count);
        setUserRating(value);
      }
    } catch (error) {
      alert("Gagal mengirim rating");
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN JIKA BELUM LOGIN ---
  if (status === 'unauthenticated') {
    return (
      <div className="bg-gray-50 border border-gray-200 p-6 text-center my-8 rounded-sm">
        <div className="flex justify-center items-center gap-2 mb-3 text-yellow-500 text-2xl">
            {/* Tampilkan Bintang Rata-rata (Statis) */}
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(average) ? "opacity-100" : "opacity-30 text-gray-400"}>★</span>
            ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Rating: {average} / 5 ({count} Suara)
        </p>
        <Link 
            href="/login" 
            className="inline-block bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
        >
            Login untuk memberi Rating
        </Link>
      </div>
    );
  }

  // --- TAMPILAN JIKA SUDAH LOGIN ---
  return (
    <div className="py-8 border-y border-gray-100 my-8">
      <div className="flex flex-col items-center gap-3">
        
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {userRating > 0 ? "Rating Anda Tersimpan" : "Berikan Penilaian Anda"}
        </span>
        
        {/* LOGIKA BINTANG */}
        <div className="flex gap-2 items-center">
            <div className="flex text-4xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => {
                // Logika Warna:
                // 1. Jika mouse di-hover -> Ikuti mouse
                // 2. Jika tidak hover -> Tampilkan Rata-rata (Average)
                const isActive = hover > 0 
                    ? star <= hover 
                    : star <= Math.round(average); // Gunakan average untuk tampilan default
                
                return (
                    <button
                        key={star}
                        type="button"
                        className={`transition-all duration-200 transform ${isActive ? "text-yellow-500 scale-110" : "text-gray-200 scale-100"}`}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        disabled={loading}
                    >
                        ★
                    </button>
                );
            })}
            </div>
        </div>

        {/* LOGIKA TEKS INFO */}
        <div className="text-center mt-1">
            <p className="text-2xl font-serif font-bold text-black">
                {average} <span className="text-sm text-gray-400 font-sans font-normal">/ 5.0</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                Berdasarkan {count} Suara Pembaca
            </p>
            
            {userRating > 0 && (
                <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 px-3 py-1 rounded-full inline-block">
                    ✓ Anda memberi nilai {userRating}
                </p>
            )}
        </div>

      </div>
    </div>
  );
}