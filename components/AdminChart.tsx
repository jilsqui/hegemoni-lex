// components/AdminChart.tsx
'use client';

import { useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

type ChartProps = {
  articleData: { name: string; jumlah: number }[];
  visitorData: { date: string; jumlah: number }[];
};

const COLORS = ['#000000', '#4b5563', '#9ca3af', '#d1d5db'];

export default function AdminChart({ articleData, visitorData }: ChartProps) {
  // State untuk menyimpan pilihan grafik (default: visitor)
  const [activeTab, setActiveTab] = useState<'visitor' | 'article'>('visitor');

  return (
    <div className="bg-white p-1 md:p-4 border border-gray-200 shadow-sm rounded-xl">
      
      {/* HEADER PILIHAN GRAFIK */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-2">
         <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {activeTab === 'visitor' ? 'Tren Kunjungan Website' : 'Distribusi Artikel'}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
                {activeTab === 'visitor' 
                    ? 'Data jumlah pengunjung harian dalam 30 hari terakhir.' 
                    : 'Jumlah artikel berdasarkan kategori hukum.'}
            </p>
         </div>

         {/* TOMBOL TOGGLE */}
         <div className="flex bg-gray-100 p-1 rounded-lg">
             <button
                onClick={() => setActiveTab('visitor')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                    activeTab === 'visitor' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
             >
                Grafik Pengunjung
             </button>
             <button
                onClick={() => setActiveTab('article')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                    activeTab === 'article' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
             >
                Grafik Kategori
             </button>
         </div>
      </div>

      {/* AREA GRAFIK */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'visitor' ? (
            // GRAFIK 1: PENGUNJUNG (AREA CHART / CURVE)
            <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorVisit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="jumlah" 
                    stroke="#000000" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVisit)" 
                />
            </AreaChart>
          ) : (
            // GRAFIK 2: ARTIKEL (BAR CHART)
            <BarChart data={articleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                    {articleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
}