'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { referencesToText } from '@/lib/articleFormatting';
import WriterRichTextEditor from '@/components/WriterRichTextEditor';
import { DEFAULT_EDITOR_HTML, exportEditorContent, extractPlainText, importEditorContent } from '@/shared/richTextEditor/serializer';

type ArticlePayload = {
  id: string;
  title: string;
  content: string;
  category: string;
  image: string | null;
  imageSourceUrl: string | null;
  imageCopyright: string | null;
  references: unknown;
};

const categories = [
  'LEGISLASI', 'OPINI', 'HUKUM PERDATA', 'BISNIS',
  'KETENAGAKERJAAN', 'HUKUM PIDANA', 'HAK ASASI MANUSIA',
  'RESENSI BUKU', 'RESENSI FILM',
  'REGULASI', 'EKONOMI PUBLIK', 'SOSIAL & BUDAYA',
  'LINGKUNGAN', 'PENDIDIKAN', 'KESEHATAN',
  'TEKNOLOGI DAN DIGITAL', 'POLITIK DAN PEMERINTAHAN',
];

export default function AdminEditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(DEFAULT_EDITOR_HTML);
  const [category, setCategory] = useState('LEGISLASI');
  const [coverImage, setCoverImage] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [imageSourceUrl, setImageSourceUrl] = useState('');
  const [imageCopyright, setImageCopyright] = useState('');
  const [references, setReferences] = useState('');

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await fetch(`/api/admin/articles/${params.id}`);
        if (!res.ok) {
          alert('Artikel tidak ditemukan.');
          router.push('/dashboard/admin/articles');
          return;
        }

        const data: ArticlePayload = await res.json();
        setTitle(data.title || '');
        setContent(importEditorContent(data.content));
        setCategory(data.category || 'LEGISLASI');
        setCoverImage(data.image || '');
        setImageSourceUrl(data.imageSourceUrl || '');
        setImageCopyright(data.imageCopyright || '');
        setReferences(referencesToText(data.references));
      } catch {
        alert('Gagal memuat artikel.');
        router.push('/dashboard/admin/articles');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadArticle();
    }
  }, [params.id, router]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(coverImage.trim());
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile, coverImage]);

  const handleSave = async () => {
    const exportedContent = exportEditorContent(content);
    const plainContent = extractPlainText(exportedContent);

    if (!title.trim() || !plainContent || !category.trim()) {
      alert('Judul, isi, dan kategori wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', exportedContent);
      formData.append('category', category.trim());
      formData.append('imageUrl', coverImage.trim());
      formData.append('imageSourceUrl', imageSourceUrl.trim());
      formData.append('imageCopyright', imageCopyright.trim());
      formData.append('references', references.trim());
      if (coverFile) {
        formData.append('imageFile', coverFile);
      }

      const res = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Gagal menyimpan perubahan.');
        return;
      }

      alert('Perubahan artikel berhasil disimpan.');
      router.push('/dashboard/admin/articles');
      router.refresh();
    } catch {
      alert('Terjadi kesalahan jaringan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Memuat data artikel...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/admin/articles" className="px-3 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white">
          ← Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold">Edit Artikel</h1>
          <p className="text-xs text-gray-500">Admin dapat memperbarui foto, isi tulisan, dan metadata referensi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 focus:border-black outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Isi Tulisan</label>
            <WriterRichTextEditor value={content} onChange={(html) => setContent(importEditorContent(html))} />
            <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
              Admin kini memakai editor yang sama dengan writer: dukungan paste tabel Word/Excel, gambar, undo/redo, dan rich text sinkron.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Referensi (Satu baris satu referensi)</label>
            <textarea
              rows={5}
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 focus:border-black outline-none text-sm leading-relaxed bg-white resize-y"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 outline-none text-sm bg-gray-50 focus:border-black"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-gray-200 p-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Foto Utama</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
            <input
              type="text"
              placeholder="Atau URL gambar"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full p-3 border border-gray-300 outline-none text-sm bg-gray-50 focus:border-black"
            />
            <input
              type="text"
              placeholder="URL sumber foto"
              value={imageSourceUrl}
              onChange={(e) => setImageSourceUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 outline-none text-sm bg-gray-50 focus:border-black"
            />
            <input
              type="text"
              placeholder="Copyright/credit foto"
              value={imageCopyright}
              onChange={(e) => setImageCopyright(e.target.value)}
              className="w-full p-3 border border-gray-300 outline-none text-sm bg-gray-50 focus:border-black"
            />
            <div className="aspect-video bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs overflow-hidden">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span>Preview foto</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
