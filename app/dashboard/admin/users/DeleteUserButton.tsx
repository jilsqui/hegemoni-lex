// app/dashboard/admin/users/DeleteUserButton.tsx
'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus user "${userName}"? Semua artikel miliknya juga akan dihapus.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        alert("User berhasil dihapus.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus user.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-wider disabled:opacity-50"
    >
      {loading ? "..." : "Hapus"}
    </button>
  );
}
