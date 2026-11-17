import React from 'react';
import { AiOutlineBarChart, AiOutlineHeart, AiOutlineRise, AiOutlineStar, AiOutlineTeam } from 'react-icons/ai';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';

import BarChart from '../components/ui/BarChart';

export default function AnalyticsPage({ wishlistData, readingData, variant = 'wishlist' }) {
  const topBooks = wishlistData || [];
  const moodTrends = readingData?.moodTrends || [];
  const isReading = variant === 'reading';
  const bars = isReading ? moodTrends : topBooks;
  const chartData = bars.slice(0, 6).map((item) => ({
    name: isReading ? item.name || item.moodTag || 'Mood' : item.book?.title || 'Buku',
    value: Number(isReading ? item.bookCount || item.totalReads || 0 : item.wishlistCount || 0),
  }));

  return (
    <div>
      <PageHeader eyebrow={isReading ? 'Reading Analytics' : 'Wishlist Intelligence'} title={isReading ? 'Reading Analytics' : 'Wishlist Intelligence'} description={isReading ? 'Analisa aktivitas membaca, keterlibatan, dan preferensi pembaca ReadVibe.' : 'Sinyal permintaan komunitas untuk membantu keputusan pengadaan koleksi.'} />
      <div className="row g-3 mb-4">
        {isReading ? <><div className="col-lg col-sm-6"><StatCard icon={<AiOutlineTeam />} value="4.982" label="Pembaca Aktif" trend="↑ 12% vs bulan lalu" /></div><div className="col-lg col-sm-6"><StatCard icon={<AiOutlineBarChart />} value="18.740" label="Sesi Membaca" trend="↑ 18%" tone="lilac" /></div><div className="col-lg col-sm-6"><StatCard icon="◷" value="154.320" label="Menit Membaca" trend="↑ 21%" tone="gold" /></div><div className="col-lg col-sm-6"><StatCard icon={<AiOutlineHeart />} value="68%" label="Tingkat Keterlibatan" trend="↑ 6 pp" tone="coral" /></div></> : <><div className="col-lg-4 col-sm-6"><StatCard icon={<AiOutlineHeart />} value={topBooks.reduce((sum, item) => sum + Number(item.wishlistCount || 0), 0)} label="Total Wishlist" trend="Permintaan aktif komunitas" /></div><div className="col-lg-4 col-sm-6"><StatCard icon={<AiOutlineStar />} value={topBooks.length} label="Buku Dipantau" trend="Prioritas pengadaan" tone="gold" /></div><div className="col-lg-4 col-sm-6"><StatCard icon={<AiOutlineRise />} value={topBooks.filter((item) => Number(item.book?.stock || 0) < Number(item.wishlistCount || 0)).length} label="Potensi Defisit Stok" trend="Butuh review kurator" tone="coral" /></div></>}
      </div>
      <div className="row g-4">
        <div className="col-lg-8"><section className="card vd-card p-4 h-100"><div className="d-flex justify-content-between align-items-center mb-4"><div><h2 className="vd-section-title">{isReading ? 'Distribusi Mood Buku' : 'Buku Paling Banyak di Wishlist'}</h2><p className="text-body-secondary small mb-0">{isReading ? 'Mood yang paling banyak dikaitkan dengan aktivitas membaca.' : 'Urutan minat member terhadap koleksi katalog.'}</p></div><span className="vd-pill">Periode berjalan</span></div>{chartData.length === 0 ? <p className="text-body-secondary mb-0">Belum ada data untuk dianalisis.</p> : <BarChart data={chartData} label={isReading ? 'Distribusi mood buku' : 'Buku paling banyak di wishlist'} />}</section></div>
        <div className="col-lg-4"><section className="card vd-card p-4 h-100"><h2 className="vd-section-title mb-3">Insight Kurator</h2><div className="d-flex flex-column gap-3"><div className="p-3 rounded" style={{ background: '#e8f6ef' }}><strong className="d-block mb-1">{isReading ? 'Waktu membaca meningkat' : 'Permintaan koleksi terkonsentrasi'}</strong><span className="small text-body-secondary">{isReading ? 'Aktivitas pembaca menunjukkan tren positif pada periode ini.' : 'Prioritaskan stok judul dengan minat tinggi dan ketersediaan rendah.'}</span></div><div className="p-3 rounded" style={{ background: '#f0eafb' }}><strong className="d-block mb-1">{isReading ? 'Mood favorit pembaca' : 'Rekomendasi tindakan'}</strong><span className="small text-body-secondary">{isReading ? `${moodTrends[0]?.name || 'Mood teratas'} mendominasi koleksi yang dibaca.` : 'Tinjau daftar wishlist dan hubungi tim pengadaan.'}</span></div></div></section></div>
      </div>
    </div>
  );
}
