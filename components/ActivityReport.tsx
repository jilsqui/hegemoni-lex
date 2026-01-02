// components/ActivityReport.tsx
'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ActivityItem = {
  id: string;
  date: string;
  type: string;    // "ARTIKEL" atau "USER"
  action: string;  // "PUBLISHED", "REGISTER", "PENDING"
  detail: string;  // Judul Artikel atau Nama User
  actor: string;   // Siapa yang melakukan
};

export default function ActivityReport({ data }: { data: ActivityItem[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // STATE UNTUK FILTER TANGGAL
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<ActivityItem[]>(data);

  // Efek untuk reset data jika prop data berubah (misal refresh)
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // --- LOGIKA FILTER ---
  const handleFilter = () => {
    if (!startDate || !endDate) {
        alert("Harap pilih 'Tanggal Mulai' dan 'Tanggal Akhir' terlebih dahulu.");
        return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Set ke awal hari

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set ke akhir hari

    // Lakukan penyaringan
    const results = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
    });

    setFilteredData(results);
  };

  // --- LOGIKA RESET ---
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilteredData(data); // Kembalikan ke data asli
  };

  // --- LOGIKA PEMBUATAN PDF ---
  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();

    // 1. KOP SURAT
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("HEGEMONI LEX PORTAL", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Laporan Aktivitas Sistem & Audit Konten", 105, 26, { align: "center" });
    
    // Tampilkan Periode di PDF jika sedang difilter
    if (startDate && endDate) {
        const startStr = new Date(startDate).toLocaleDateString('id-ID');
        const endStr = new Date(endDate).toLocaleDateString('id-ID');
        doc.text(`Periode Laporan: ${startStr} s/d ${endStr}`, 105, 31, { align: "center" });
    } else {
        doc.text("Periode Laporan: Semua Waktu", 105, 31, { align: "center" });
    }
    
    doc.setLineWidth(0.5);
    doc.line(15, 36, 195, 36);

    // 2. META DATA
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 45);
    doc.text(`Total Record : ${filteredData.length} Data`, 15, 50); // Gunakan filteredData

    // 3. TABEL DATA (Gunakan filteredData)
    const tableRows = filteredData.map((item, index) => [
      index + 1,
      new Date(item.date).toLocaleDateString('id-ID') + ' ' + new Date(item.date).toLocaleTimeString('id-ID'),
      item.type,
      item.action,
      item.detail,
      item.actor
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['No', 'Waktu', 'Tipe', 'Status', 'Detail Aktivitas', 'Aktor']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 30 },
      }
    });

    // 4. FOOTER
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Mengetahui,", 140, finalY);
    doc.text("Administrator", 140, finalY + 20);
    doc.text("( Tanda Tangan Digital )", 140, finalY + 25);

    doc.save(`Laporan_Aktivitas_${new Date().toISOString().slice(0,10)}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
      
      {/* HEADER JUDUL */}
      <div className="mb-6 border-b border-gray-100 pb-4">
           <h2 className="text-lg font-bold font-serif">Riwayat Aktivitas</h2>
           <p className="text-xs text-gray-500">Filter berdasarkan tanggal untuk mencetak laporan spesifik.</p>
      </div>

      {/* --- FILTER BAR (BARU) --- */}
      <div className="flex flex-col md:flex-row items-end gap-4 mb-8 bg-gray-50 p-4 rounded border border-gray-100">
        
        {/* Input Tanggal Mulai */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dari Tanggal</label>
            <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 p-2 text-sm rounded-sm outline-none focus:border-black"
            />
        </div>

        {/* Input Tanggal Akhir */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sampai Tanggal</label>
            <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 p-2 text-sm rounded-sm outline-none focus:border-black"
            />
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2">
            <button 
                onClick={handleFilter}
                className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-sm"
            >
                Terapkan Filter
            </button>
            
            {/* Tombol Reset hanya muncul jika sudah difilter */}
            {(filteredData.length !== data.length || startDate) && (
                <button 
                    onClick={handleReset}
                    className="bg-white border border-gray-300 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors rounded-sm"
                >
                    Reset Semula
                </button>
            )}
        </div>

        <div className="flex-1 text-right">
             <button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-green-600 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm rounded-sm"
            >
                {isGenerating ? "Mencetak..." : "📄 Download PDF"}
            </button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-black text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    <th className="py-3 pl-2">Waktu</th>
                    <th className="py-3">Tipe</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Detail</th>
                    <th className="py-3">Aktor</th>
                </tr>
            </thead>
            <tbody className="text-xs text-gray-700">
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 pl-2 font-mono text-[10px] text-gray-500">
                                {new Date(item.date).toLocaleDateString('id-ID')}
                                <br/>
                                {new Date(item.date).toLocaleTimeString('id-ID')}
                            </td>
                            <td className="py-3 font-bold">{item.type}</td>
                            <td className="py-3">
                                <span className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase ${
                                    item.action === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                    item.action === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {item.action}
                                </span>
                            </td>
                            <td className="py-3 font-medium">{item.detail}</td>
                            <td className="py-3 text-gray-500">{item.actor}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">
                            Tidak ada aktivitas ditemukan pada rentang tanggal ini.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

    </div>
  );
}