// app/dashboard/admin/users/EditUserModal.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditUserModalProps {
    user: { id: string; name: string | null; email: string };
    onClose: () => void;
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
    const router = useRouter();
    const [form, setForm] = useState({ email: user.email, password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Tutup modal saat tekan Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/users?id=${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal memperbarui user');
            }

            setSuccess('User berhasil diperbarui!');
            router.refresh();

            // Tutup modal otomatis setelah 1.2 detik
            setTimeout(() => onClose(), 1200);

        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Overlay gelap
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full max-w-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-serif font-bold text-black">Edit User</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{user.name || 'Tanpa Nama'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors text-xl font-light leading-none"
                        aria-label="Tutup"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Pesan Error */}
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Pesan Sukses */}
                    {success && (
                        <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium">
                            ✓ {success}
                        </div>
                    )}

                    {/* Field Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="w-full bg-gray-50 border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors text-black"
                            placeholder="email@contoh.com"
                        />
                    </div>

                    {/* Field Password */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">
                            Password Baru
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors text-black"
                            placeholder="Kosongkan jika tidak ingin diubah"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            * Biarkan kosong jika password tidak ingin diganti
                        </p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
