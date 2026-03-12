// app/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DeleteUserButton from "./DeleteUserButton";
import EditUserModal from "./EditUserModal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'WRITER' | 'READER';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClose = () => {
    setEditTarget(null);
    fetchUsers(); // refresh tabel setelah edit
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Kelola Pengguna</h1>
          <p className="text-gray-500 text-sm">Total {users.length} pengguna terdaftar</p>
        </div>
        <Link
          href="/dashboard/admin/users/create"
          className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
        >
          + Tambah Penulis
        </Link>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500">
              <th className="p-4">Nama User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Tanggal Gabung</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                  Belum ada pengguna.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      {user.name || 'Tanpa Nama'}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded border ${user.role === 'ADMIN' ? 'bg-black text-white border-black' :
                        user.role === 'WRITER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <div className="flex items-center justify-end gap-4">
                        {/* Tombol Edit */}
                        <button
                          onClick={() => setEditTarget(user)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors"
                        >
                          Edit
                        </button>
                        {/* Tombol Hapus */}
                        <DeleteUserButton userId={user.id} userName={user.name || user.email} />
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit — tampil hanya jika ada editTarget */}
      {editTarget && (
        <EditUserModal user={editTarget} onClose={handleEditClose} />
      )}
    </div>
  );
}