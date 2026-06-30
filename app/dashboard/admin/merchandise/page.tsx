"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const CATEGORIES = ["Buku", "Kaos", "Tote Bag", "Stiker", "Merchandise Lain"];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  price: "0",
  category: "Buku",
  status: "PUBLISHED",
  orderContact: "",
  isFeatured: false,
  // Book metadata
  author: "",
  publisher: "",
  isbn: "",
  releaseYear: "",
  edition: "",
  dimensions: "",
  pages: "",
  format: "Soft Cover",
  language: "Indonesia",
  synopsis: "",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  DRAFT: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  ARCHIVED: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

export default function AdminMerchandisePage() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [synopsisCharCount, setSynopsisCharCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const isBook = form.category === "Buku";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      if (name === "synopsis") setSynopsisCharCount(value.length);
    }
  };

  // Image preview handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/merchandise");
      if (!res.ok) throw new Error("Gagal memuat daftar merchandise");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
    setError("");
    setSynopsisCharCount(0);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/merchandise/${id}`);
      if (!res.ok) throw new Error("Gagal memuat produk");
      const data = await res.json();
      setEditingId(id);
      setForm({
        title: data.title || "",
        subtitle: data.subtitle || "",
        price: String(data.price ?? 0),
        category: data.category || "Buku",
        status: data.status || "PUBLISHED",
        orderContact: data.orderContact || "",
        isFeatured: Boolean(data.isFeatured),
        author: data.bookMetadata?.author || "",
        publisher: data.bookMetadata?.publisher || "",
        isbn: data.bookMetadata?.isbn || "",
        releaseYear: data.bookMetadata?.releaseYear ? String(data.bookMetadata.releaseYear) : "",
        edition: data.bookMetadata?.edition || "",
        dimensions: data.bookMetadata?.dimensions || "",
        pages: data.bookMetadata?.pages ? String(data.bookMetadata.pages) : "",
        format: data.bookMetadata?.format || "Soft Cover",
        language: data.bookMetadata?.language || "Indonesia",
        synopsis: data.bookMetadata?.synopsis || "",
      });
      setSynopsisCharCount(data.bookMetadata?.synopsis?.length || 0);
      setImagePreview(data.imageUrl || null);
      setMessage("");
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Gagal memuat produk untuk diedit");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Hapus produk "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/merchandise/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghapus produk");
      }
      setMessage(`"${title}" berhasil dihapus.`);
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus produk");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      let imageUrl = "";
      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", imageFile);

        const uploadRes = await fetch("/api/uploads/article-image", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload gambar gagal");
        imageUrl = uploadData.url;
      }

      const payload: any = {
        title: form.title,
        subtitle: form.subtitle,
        price: Number(form.price || 0),
        category: form.category || "Buku",
        status: form.status || "PUBLISHED",
        orderContact: form.orderContact || null,
        isFeatured: Boolean(form.isFeatured),
        bookMetadata: {
          author: form.author || null,
          publisher: form.publisher || null,
          isbn: form.isbn || null,
          releaseYear: form.releaseYear || null,
          edition: form.edition || null,
          dimensions: form.dimensions || null,
          pages: form.pages || null,
          format: form.format || null,
          language: form.language || "Indonesia",
          synopsis: form.synopsis || null,
          tags: [],
        },
      };

      // Saat membuat produk baru, hanya kirim imageUrl jika ada upload baru.
      if (imageUrl) payload.imageUrl = imageUrl;

      const res = editingId
        ? await fetch(`/api/merchandise/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/merchandise", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk");

      setMessage(editingId ? `Berhasil: ${data.title} telah diperbarui.` : `Berhasil: ${data.title} telah ditambahkan ke merchandise.`);
      resetForm();
      await loadProducts();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Admin Panel</p>
              <h1 className="mt-2 text-3xl font-serif font-bold text-black">
                {editingId ? "✏️ Edit Merchandise" : "📚 Tambah Merchandise"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Upload cover buku dan detail produk untuk promosi merchandise. Untuk kategori <strong>Buku</strong>, lengkapi penulis, ISBN, dimensi, dan sinopsis.
              </p>
            </div>
            <Link
              href="/merch"
              target="_blank"
              className="shrink-0 flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 hover:border-black hover:text-black transition-all"
            >
              👁️ Lihat Halaman Publik
            </Link>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3 animate-[fadeIn_0.3s_ease]">
            <span className="text-lg">✅</span> {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3 animate-[fadeIn_0.3s_ease]">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        {/* FORM */}
        <form ref={formRef} onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Judul */}
            <label className="grid gap-2 text-sm text-gray-700 font-medium">
              <span>Judul Produk <span className="text-red-500">*</span></span>
              <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="Masyarakat Adat; Sebuah Harapan dan Perjuangan" />
            </label>

            {/* Subtitle */}
            <label className="grid gap-2 text-sm text-gray-700 font-medium">
              Subtitle / Tagline
              <input name="subtitle" value={form.subtitle} onChange={handleChange} className={inputClass} placeholder="Edisi pembuka..." />
            </label>

            {/* Kategori */}
            <label className="grid gap-2 text-sm text-gray-700 font-medium">
              Kategori
              <select name="category" value={form.category} onChange={handleChange} className={`${inputClass} bg-white`}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            {/* Status */}
            <label className="grid gap-2 text-sm text-gray-700 font-medium">
              Status
              <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} bg-white`}>
                <option value="PUBLISHED">🟢 Published</option>
                <option value="DRAFT">🟡 Draft</option>
                <option value="ARCHIVED">⚪ Archived</option>
              </select>
            </label>

            {/* Harga */}
            <label className="grid gap-2 text-sm text-gray-700 font-medium">
              Harga (Rp) — isi 0 untuk Pre Order
              <input type="number" name="price" value={form.price} onChange={handleChange} className={inputClass} />
            </label>

            {/* Kontak */}
            <label className="grid gap-2 text-sm text-gray-700 font-medium">
              Kontak Pemesanan (WhatsApp)
              <input name="orderContact" value={form.orderContact} onChange={handleChange} placeholder="0812-1223-1466 (Admin Buku)" className={inputClass} />
            </label>

            {/* IMAGE UPLOAD WITH PREVIEW */}
            <div className="md:col-span-2">
              <p className="text-sm text-gray-700 font-medium mb-2">Cover / Foto Produk</p>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Upload Area */}
                <label className="flex-1 cursor-pointer">
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-black p-6 text-center transition-all duration-300 hover:bg-gray-50 group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                    <p className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : "Klik untuk upload gambar cover"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, atau WebP (maks 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Preview Thumbnail */}
                {imagePreview && (
                  <div className="relative group shrink-0">
                    <div className="w-32 h-44 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                      <img
                        src={imagePreview}
                        alt="Preview cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    >
                      ✕
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-1">Preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${form.isFeatured ? 'bg-black' : 'bg-gray-300'}`}></div>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${form.isFeatured ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">
                  ⭐ Tampilkan sebagai produk unggulan (Featured)
                </span>
              </label>
            </div>

            {/* BOOK METADATA SECTION */}
            {isBook && (
              <>
                <div className="md:col-span-2 mt-2">
                  <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
                    <span className="text-xl">📖</span>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-800">Detail Buku</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Informasi spesifik untuk produk buku</p>
                    </div>
                  </div>
                </div>

                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Penulis
                  <input name="author" value={form.author} onChange={handleChange} className={inputClass} placeholder="Efrial Ruliandi Silalahi" />
                </label>
                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Penerbit
                  <input name="publisher" value={form.publisher} onChange={handleChange} className={inputClass} />
                </label>

                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  ISBN / QRCBN
                  <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="978-623-435-058-6" className={inputClass} />
                </label>
                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Tahun Terbit
                  <input type="number" name="releaseYear" value={form.releaseYear} onChange={handleChange} placeholder="2022" className={inputClass} />
                </label>

                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Cetakan / Edisi
                  <input name="edition" value={form.edition} onChange={handleChange} placeholder="Pertama, 2022" className={inputClass} />
                </label>
                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Dimensi
                  <input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="14 cm x 21 cm" className={inputClass} />
                </label>

                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Jumlah Halaman
                  <input type="number" name="pages" value={form.pages} onChange={handleChange} placeholder="233" className={inputClass} />
                </label>
                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Finishing / Format
                  <input name="format" value={form.format} onChange={handleChange} placeholder="Soft Cover" className={inputClass} />
                </label>

                <label className="grid gap-2 text-sm text-gray-700 font-medium">
                  Bahasa
                  <input name="language" value={form.language} onChange={handleChange} className={inputClass} />
                </label>

                <label className="grid gap-2 text-sm text-gray-700 font-medium md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span>Sinopsis / Deskripsi Buku</span>
                    <span className={`text-[10px] font-normal ${synopsisCharCount > 500 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {synopsisCharCount} karakter
                    </span>
                  </div>
                  <textarea
                    name="synopsis"
                    value={form.synopsis}
                    onChange={handleChange}
                    rows={8}
                    className={inputClass}
                    placeholder="Tuliskan deskripsi lengkap buku di sini. Sinopsis ini akan ditampilkan di halaman detail buku..."
                  />
                </label>
              </>
            )}

            {/* ACTION BAR */}
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
              <p className="text-xs text-gray-500">
                💡 Data akan otomatis tampil di <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">/merch</code> dan <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">/merch/[slug]</code>
              </p>
              <div className="flex items-center gap-3">
                {editingId && (
                  <button type="button" onClick={resetForm} className="rounded-full border border-gray-300 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-700 hover:border-black hover:text-black transition-all">
                    Batal Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.35em] text-white disabled:opacity-60 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </span>
                  ) : editingId ? "Update Produk" : "Simpan Produk"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* PRODUCT LIST */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-serif font-bold text-black">📦 Daftar Merchandise</h2>
              <p className="mt-1 text-sm text-gray-600">Kelola semua produk merchandise dari sini.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-gray-500 font-bold">
                {products.length} item
              </span>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-emerald-600 font-bold">
                {products.filter(p => p.status === 'PUBLISHED').length} published
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📚</p>
                <p className="text-sm text-gray-500 font-medium">Belum ada produk merchandise.</p>
                <p className="text-xs text-gray-400 mt-1">Tambahkan produk pertama Anda menggunakan form di atas.</p>
              </div>
            ) : (
              products.map((product) => {
                const statusStyle = STATUS_COLORS[product.status] || STATUS_COLORS.DRAFT;
                const isProductBook = (product.category || "Buku").toLowerCase() === "buku";
                const meta = product.bookMetadata;

                return (
                  <article
                    key={product.id}
                    className="group rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      {/* Cover Thumbnail */}
                      <div className="shrink-0 hidden sm:block">
                        {product.imageUrl ? (
                          <div className="w-20 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-28 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <span className="text-2xl">{isProductBook ? "📖" : "🛍️"}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {/* Category & Featured Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">{product.category || "Buku"}</p>
                              {product.isFeatured && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            {/* Title */}
                            <h3 className="mt-1.5 text-lg font-serif font-bold text-black truncate">{product.title}</h3>
                            {/* Synopsis preview */}
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                              {product.subtitle || meta?.synopsis || "Tidak ada deskripsi"}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {product.status}
                          </span>
                        </div>

                        {/* Book Metadata Pills */}
                        {isProductBook && meta && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {meta.author && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                                ✍️ {meta.author}
                              </span>
                            )}
                            {meta.pages && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                                📄 {meta.pages} hal
                              </span>
                            )}
                            {meta.releaseYear && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                                📅 {meta.releaseYear}
                              </span>
                            )}
                            {meta.isbn && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                                🔖 {meta.isbn}
                              </span>
                            )}
                            {meta.format && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
                                📐 {meta.format}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {product.orderContact && (
                              <span className="inline-flex items-center gap-1">📞 {product.orderContact}</span>
                            )}
                            {Number(product.price) === 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600 font-semibold border border-blue-100">
                                Pre Order
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {product.status === 'PUBLISHED' && (
                              <Link
                                href={`/merch/${product.slug}`}
                                target="_blank"
                                className="rounded-full border border-gray-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
                              >
                                👁️ Lihat
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEdit(product.id)}
                              className="rounded-full border border-black px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-all"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id, product.title)}
                              className="rounded-full border border-red-400 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
