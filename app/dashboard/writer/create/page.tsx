'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import WriterRichTextEditor from '@/components/WriterRichTextEditor';
import { DEFAULT_EDITOR_HTML, exportEditorContent, extractPlainText, importEditorContent } from '@/shared/richTextEditor/serializer';

const LOCAL_DRAFT_KEY = 'hegemoni-lex-writer-autosave';

type DraftSnapshot = {
  title: string;
  content: string;
  category: string;
  coverImage: string;
  imageSourceUrl: string;
  imageCopyright: string;
  references: string;
};

function buildFormData(payload: DraftSnapshot, status: 'DRAFT' | 'PENDING', coverFile: File | null) {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('content', payload.content);
  formData.append('category', payload.category);
  formData.append('status', status);
  formData.append('imageSourceUrl', payload.imageSourceUrl.trim());
  formData.append('imageCopyright', payload.imageCopyright.trim());
  formData.append('references', payload.references.trim());

  if (payload.coverImage.trim()) {
    formData.append('imageUrl', payload.coverImage.trim());
  }

  if (coverFile) {
    formData.append('imageFile', coverFile);
  }

  return formData;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDraft, setIsFetchingDraft] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedSignature = useRef('');
  const autosaveTimer = useRef<number | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(DEFAULT_EDITOR_HTML);
  const [category, setCategory] = useState('LEGISLASI');
  const [coverImage, setCoverImage] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [imageSourceUrl, setImageSourceUrl] = useState('');
  const [imageCopyright, setImageCopyright] = useState('');
  const [references, setReferences] = useState('');

  const categories = [
    'LEGISLASI', 'OPINI', 'HUKUM PERDATA', 'BISNIS',
    'KETENAGAKERJAAN', 'HUKUM PIDANA', 'HAK ASASI MANUSIA',
    'RESENSI BUKU', 'RESENSI FILM',
    'REGULASI', 'EKONOMI PUBLIK', 'SOSIAL & BUDAYA',
    'LINGKUNGAN', 'PENDIDIKAN', 'KESEHATAN',
    'TEKNOLOGI DAN DIGITAL', 'POLITIK DAN PEMERINTAHAN',
  ];

  const snapshot: DraftSnapshot = {
    title,
    content,
    category,
    coverImage,
    imageSourceUrl,
    imageCopyright,
    references,
  };

  const contentText = extractPlainText(content);
  const autosaveSignature = JSON.stringify(snapshot);

  useEffect(() => {
    if (draftId) return;

    const saved = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<DraftSnapshot>;
      setTitle(parsed.title || '');
      setContent(importEditorContent(parsed.content));
      setCategory(parsed.category || 'LEGISLASI');
      setCoverImage(parsed.coverImage || '');
      setImageSourceUrl(parsed.imageSourceUrl || '');
      setImageCopyright(parsed.imageCopyright || '');
      setReferences(parsed.references || '');
      setAutosaveStatus('saved');
    } catch (error) {
      console.error('Autosave restore error:', error);
      window.localStorage.removeItem(LOCAL_DRAFT_KEY);
    }
  }, [draftId]);

  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;

      setIsFetchingDraft(true);
      try {
        const res = await fetch(`/api/articles/${draftId}`, { cache: 'no-store' });
        if (!res.ok) {
          alert('❌ Draft tidak ditemukan atau tidak dapat diakses.');
          router.push('/dashboard/writer/posts');
          return;
        }

        const draft = await res.json();
        const draftReferences = Array.isArray(draft.references) ? draft.references.join('\n') : '';
        const nextSnapshot = {
          title: draft.title || '',
          content: importEditorContent(draft.content),
          category: draft.category || 'LEGISLASI',
          coverImage: draft.image || '',
          imageSourceUrl: draft.imageSourceUrl || '',
          imageCopyright: draft.imageCopyright || '',
          references: draftReferences,
        };

        setTitle(nextSnapshot.title);
        setContent(nextSnapshot.content);
        setCategory(nextSnapshot.category);
        setCoverImage(nextSnapshot.coverImage);
        setImageSourceUrl(nextSnapshot.imageSourceUrl);
        setImageCopyright(nextSnapshot.imageCopyright);
        setReferences(nextSnapshot.references);
        lastSavedSignature.current = JSON.stringify(nextSnapshot);

        window.localStorage.removeItem(LOCAL_DRAFT_KEY);
      } catch (error) {
        console.error(error);
        alert('❌ Gagal memuat draft.');
      } finally {
        setIsFetchingDraft(false);
      }
    };

    loadDraft();
  }, [draftId, router]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(coverImage.trim());
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile, coverImage]);

  useEffect(() => {
    if (isFetchingDraft || isLoading) return;
    if (autosaveSignature === lastSavedSignature.current) return;

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = window.setTimeout(() => {
      const autosaveDraft = async () => {
        if (!draftId || coverFile) {
          window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(snapshot));
          lastSavedSignature.current = autosaveSignature;
          setAutosaveStatus('saved');
          return;
        }

        setAutosaveStatus('saving');
        try {
          const res = await fetch(`/api/articles/${draftId}`, {
            method: 'PUT',
            body: buildFormData(snapshot, 'DRAFT', null),
          });

          if (!res.ok) {
            throw new Error('Autosave gagal');
          }

          lastSavedSignature.current = autosaveSignature;
          setAutosaveStatus('saved');
        } catch (error) {
          console.error('Autosave article error:', error);
          setAutosaveStatus('error');
        }
      };

      void autosaveDraft();
    }, 1500);

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [autosaveSignature, draftId, isFetchingDraft, isLoading, coverFile]);

  const handleSubmit = async (statusSubmission: 'PENDING' | 'DRAFT') => {
    const exportedContent = exportEditorContent(content);
    const payload: DraftSnapshot = {
      ...snapshot,
      content: exportedContent,
    };
    const plainContent = contentText;
    const titleTrimmed = title.trim();

    if (!titleTrimmed) {
      alert('Judul artikel wajib diisi.');
      return;
    }

    if (!plainContent) {
      alert('Isi artikel wajib diisi.');
      return;
    }

    if (plainContent.length < 40 && statusSubmission === 'PENDING') {
      alert('Isi artikel masih terlalu singkat untuk dikirim ke redaksi.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = draftId ? `/api/articles/${draftId}` : '/api/articles';
      const method = draftId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        body: buildFormData(payload, statusSubmission, coverFile),
      });

      if (res.ok) {
        window.localStorage.removeItem(LOCAL_DRAFT_KEY);
        alert(
          statusSubmission === 'DRAFT'
            ? '✅ Berhasil: Tulisan disimpan sebagai Draft.'
            : '✅ Berhasil: Artikel dikirim ke Redaksi dan menunggu persetujuan (Pending Review).'
        );

        router.push('/dashboard/writer/posts');
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert('❌ Gagal: ' + (errorData.error || 'Terjadi kesalahan server'));
      }
    } catch (error) {
      console.error(error);
      alert('❌ Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/writer/posts" className="flex h-10 w-10 items-center justify-center border border-gray-300 text-xl font-bold transition-colors hover:bg-black hover:text-white">
          ←
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-serif font-bold">{draftId ? 'Lanjutkan Draft' : 'Artikel Baru'}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${autosaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-800' : autosaveStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
              {autosaveStatus === 'saving' ? 'Autosave...' : autosaveStatus === 'error' ? 'Autosave gagal' : autosaveStatus === 'saved' ? 'Tersimpan' : 'Siap menulis'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{draftId ? 'Lanjutkan dan sempurnakan tulisan Anda.' : 'Tuangkan gagasan hukum Anda.'}</p>
        </div>
      </div>

      {isFetchingDraft && (
        <div className="mb-6 border border-gray-200 bg-white p-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          Memuat draft...
        </div>
      )}

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Judul Artikel</label>
              <input
                type="text"
                placeholder="Contoh: Analisis Kritis UU Cipta Kerja..."
                className="w-full border-2 border-gray-200 bg-white p-4 font-serif text-xl text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Isi Artikel</label>
              <WriterRichTextEditor value={content} onChange={(html) => setContent(importEditorContent(html))} />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Editor ini mendukung paste tabel dari Word/Excel, image paste, undo/redo, dan format rich text HTML.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Referensi (Satu baris satu referensi)</label>
              <textarea
                rows={5}
                placeholder="Contoh: https://www.bpk.go.id/...\nContoh: Putusan MA No. 123/Pid/2025"
                className="w-full resize-y border-2 border-gray-200 bg-white p-4 text-sm leading-relaxed text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black"
                value={references}
                onChange={(e) => setReferences(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 border border-gray-200 bg-white p-6">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Kategori</label>
              <select
                className="w-full cursor-pointer border border-gray-300 bg-gray-50 p-3 text-sm uppercase text-black outline-none focus:border-black"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 border border-gray-200 bg-white p-6">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Cover Image (Upload File JPG/PNG/WEBP atau URL)</label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="w-full text-sm text-gray-500 file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-gray-700 hover:file:bg-gray-200"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCoverFile(file);
                }}
              />

              <input
                type="text"
                placeholder="Atau gunakan URL: https://..."
                className="w-full border border-gray-300 bg-gray-50 p-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />

              <input
                type="text"
                placeholder="URL sumber foto (opsional)"
                className="w-full border border-gray-300 bg-gray-50 p-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black"
                value={imageSourceUrl}
                onChange={(e) => setImageSourceUrl(e.target.value)}
              />

              <input
                type="text"
                placeholder="Copyright/credit foto (opsional)"
                className="w-full border border-gray-300 bg-gray-50 p-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black"
                value={imageCopyright}
                onChange={(e) => setImageCopyright(e.target.value)}
              />

              <div className="relative aspect-video overflow-hidden border border-dashed border-gray-300 bg-gray-100 text-xs text-gray-400">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview Cover"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">Preview Image</div>
                )}
              </div>

              <p className="text-[10px] leading-tight text-gray-400">
                Prioritas: file upload. Jika file tidak dipilih, sistem akan pakai URL.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => void handleSubmit('PENDING')}
                disabled={isLoading || isFetchingDraft}
                className="w-full bg-black py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'MENGIRIM...' : draftId ? 'UPDATE & KIRIM KE REDAKSI' : 'KIRIM KE REDAKSI'}
              </button>

              <button
                type="button"
                onClick={() => void handleSubmit('DRAFT')}
                disabled={isLoading || isFetchingDraft}
                className="w-full border border-black bg-white py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {draftId ? 'UPDATE DRAFT' : 'SIMPAN SEBAGAI DRAFT'}
              </button>

              <p className="text-[10px] leading-relaxed text-gray-400">
                Status draft akan tetap disimpan otomatis saat Anda menulis. Untuk artikel baru, autosave disimpan di browser sampai Anda mengirimkan tulisan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
