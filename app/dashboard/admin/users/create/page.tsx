// app/dashboard/admin/users/create/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan penulis');
      }

      // Jika Sukses:
      router.push('/dashboard/admin/users'); // Kembali ke tabel
      router.refresh(); // Segarkan data agar nama baru muncul
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/admin/users" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black">
          ← Kembali
        </Link>
        <h1 className="text-3xl font-serif font-bold">Tambah Penulis Baru</h1>
      </div>

      <div className="bg-white p-8 border border-gray-200 shadow-sm">
        
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border-l-4 border-red-500 font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">Nama Lengkap</label>
                <input 
                    type="text" 
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Sudarsono, S.H."
                    required
                    className="w-full bg-gray-50 border border-gray-300 p-3 focus:outline-none focus:border-black transition-colors"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">Alamat Email</label>
                <input 
                    type="email" 
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="penulis@hegemoni.lex"
                    required
                    className="w-full bg-gray-50 border border-gray-300 p-3 focus:outline-none focus:border-black transition-colors"
                />
            </div>

            {/* Password */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">Password Awal</label>
                <input 
                    type="password" 
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Buat password yang kuat"
                    required
                    className="w-full bg-gray-50 border border-gray-300 p-3 focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-[10px] text-gray-400 mt-1">*Penulis bisa mengganti password ini nanti.</p>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Penulis'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}