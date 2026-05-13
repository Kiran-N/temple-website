'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// ── Swap these URLs after uploading via admin panel ──────────────────────────
const HERO_IMAGE_URL = 'https://res.cloudinary.com/dxjjr6yyk/image/upload/f_auto,q_auto,c_limit,w_1920/v1778710082/i2t0cgelyo4vrugogl12.jpg';
const DEITY_IMAGE_URL = 'https://res.cloudinary.com/dxjjr6yyk/image/upload/f_auto,q_auto,c_limit,w_1920/v1778706623/solmbazwbshu3gkopjyk.jpg';
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [stats, setStats] = useState({ totalDonations: 0, totalExpenses: 0, balance: 0, donorCount: 0 });
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [donationsSnap, expensesSnap, photosSnap] = await Promise.all([
      getDocs(collection(db, 'donations')).catch(() => ({ docs: [], size: 0 })),
      getDocs(collection(db, 'expenses')).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, 'progress_photos'), orderBy('uploadedAt', 'desc'), limit(9)))
        .catch(() => getDocs(collection(db, 'progress_photos')).catch(() => ({ docs: [] }))),
    ]);

    const totalDonations = donationsSnap.docs.reduce((sum, d) => sum + d.data().amount, 0);
    const expenseDocs = expensesSnap.docs.map((d) => d.data());
    const totalExpenses = expenseDocs.reduce((sum, e) => sum + e.amount, 0);

    setStats({ totalDonations, totalExpenses, balance: totalDonations - totalExpenses, donorCount: donationsSnap.size });

    const categoryTotals = {};
    expenseDocs.forEach((e) => {
      if (e.category !== 'Facilitation Payments')
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    setBreakdown(categoryTotals);
    setProgressPhotos(photosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>

      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🕉️</span>
            <div>
              <p className="font-bold text-orange-800 leading-tight text-sm md:text-base">
                Lakshmi Chennakeshava Swamy Temple
              </p>
              <p className="text-xs text-orange-500">Yaramalapalli, Kadapa, Andhra Pradesh</p>
            </div>
          </div>
          <Link href="/admin/login"
            className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {HERO_IMAGE_URL ? (
          <img src={HERO_IMAGE_URL} alt="Temple" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-800 via-red-800 to-amber-900" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-yellow-300 text-sm md:text-base font-semibold tracking-widest uppercase mb-3">
            ✦ Est. approx. 1525 CE · 500 Years of Divine Grace ✦
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Lakshmi Chennakeshava<br />Swamy Temple
          </h1>
          <p className="text-orange-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Yaramalapalli Village, Kadapa District, Andhra Pradesh
          </p>
          <a href="#donate"
            className="inline-block bg-yellow-400 text-yellow-900 font-bold px-8 py-3 rounded-full text-lg hover:bg-yellow-300 transition shadow-lg">
            Support the Renovation
          </a>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm animate-bounce">↓</div>
      </div>

      {/* ── About + Deity ──────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-orange-500 font-semibold tracking-widest text-sm uppercase mb-3">About the Temple</p>
            <h2 className="text-4xl font-bold text-stone-800 mb-6 leading-tight">
              A Living Heritage of<br />Five Centuries
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-4">
              The Lakshmi Chennakeshava Swamy Temple in Yaramalapalli has stood as a beacon of faith
              and devotion for nearly 500 years. Generation after generation of our village families
              have worshipped here, found solace in times of hardship, and celebrated life's blessings
              before this sacred deity.
            </p>
            <p className="text-stone-600 text-lg leading-relaxed mb-8">
              Today, the temple needs our help. The structure requires renovation to preserve this
              divine heritage for our children and grandchildren. Together — as one community —
              we are rebuilding our temple with full transparency and accountability.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-1 bg-orange-400 rounded" />
              <p className="text-orange-600 font-semibold italic">
                "Every rupee is accounted for. Every donor is honoured."
              </p>
            </div>
          </div>
          {/* Deity photo */}
          <div className="flex justify-center">
            {DEITY_IMAGE_URL ? (
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-400 opacity-30 blur-xl" />
                <img
                  src={DEITY_IMAGE_URL}
                  alt="Lord Lakshmi Chennakeshava Swamy"
                  className="relative rounded-2xl shadow-2xl max-h-[500px] object-cover border-4 border-yellow-200"
                />
                <p className="text-center text-stone-500 text-sm mt-3 italic">
                  Lord Lakshmi Chennakeshava Swamy
                </p>
              </div>
            ) : (
              <div className="w-80 h-96 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center shadow-xl">
                <div className="text-center text-orange-700">
                  <div className="text-6xl mb-4">🛕</div>
                  <p className="font-semibold">Deity photo coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Live Stats ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-orange-700 to-red-700 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-3">Renovation Fund — Live Status</h2>
          <p className="text-orange-200 text-center mb-10">Updated in real time. Every transaction is recorded.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Donated', value: `₹${stats.totalDonations.toLocaleString('en-IN')}`, sub: `by ${stats.donorCount} donors`, icon: '💰' },
              { label: 'Total Spent', value: `₹${stats.totalExpenses.toLocaleString('en-IN')}`, sub: 'verified expenses', icon: '📋' },
              { label: 'Balance', value: `₹${stats.balance.toLocaleString('en-IN')}`, sub: 'available funds', icon: '🏦' },
              { label: 'Donors', value: stats.donorCount, sub: 'generous souls', icon: '🙏' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-white/20">
                <div className="text-4xl mb-3">{s.icon}</div>
                <p className="text-orange-200 text-sm font-medium mb-1">{s.label}</p>
                <p className="text-white text-3xl font-bold">{s.value}</p>
                <p className="text-orange-300 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Expense Breakdown ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-orange-500 font-semibold tracking-widest text-sm uppercase mb-3 text-center">Transparency</p>
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-3">Where Every Rupee Goes</h2>
          <p className="text-stone-500 text-center mb-10">We believe every donor deserves to know exactly how their money is used.</p>

          {Object.keys(breakdown).length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-stone-400 text-lg">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {Object.entries(breakdown).map(([category, amount], i) => (
                <div key={category}
                  className={`flex justify-between items-center px-6 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span className="font-semibold text-stone-700">{category}</span>
                  </div>
                  <span className="text-xl font-bold text-stone-800">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Progress Gallery ───────────────────────────────────────────────── */}
      <section className="bg-stone-100 py-20">
        <div className="container mx-auto px-4">
          <p className="text-orange-500 font-semibold tracking-widest text-sm uppercase mb-3 text-center">Construction Updates</p>
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-10">Renovation Progress</h2>

          {progressPhotos.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {progressPhotos.map((photo) => (
                <div key={photo.id}
                  className="group bg-white rounded-2xl shadow overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setLightbox(photo)}>
                  <div className="relative overflow-hidden h-56">
                    <img src={photo.url} alt={photo.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">🔍</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-stone-800">{photo.description || ''}</p>
                    <p className="text-stone-400 text-sm mt-1">
                      {photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000).toLocaleDateString('en-IN') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-stone-400 text-lg">Construction photos coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white text-4xl font-light leading-none">
              ×
            </button>
            <img src={lightbox.url} alt={lightbox.description}
              className="w-full max-h-[85vh] object-contain rounded-xl" />
            {lightbox.description && (
              <p className="text-white/80 text-center mt-4 text-lg">{lightbox.description}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Donate ─────────────────────────────────────────────────────────── */}
      <section id="donate" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 font-semibold tracking-widest text-sm uppercase mb-3 text-center">Be Part of This</p>
          <h2 className="text-4xl font-bold text-stone-800 text-center mb-4">Support the Renovation</h2>
          <p className="text-stone-500 text-center text-lg mb-12 max-w-2xl mx-auto">
            No donation is too small. Every rupee brings us closer to restoring this sacred space
            that has served our village for 500 years.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-orange-500">
              <h3 className="text-xl font-bold text-stone-800 mb-5">💳 Bank Transfer</h3>
              <div className="space-y-3 text-stone-600">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-400">Account Name</span>
                  <span className="font-semibold">Temple Construction Fund</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-400">Account No</span>
                  <span className="font-semibold">Coming Soon</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-400">IFSC</span>
                  <span className="font-semibold">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Bank</span>
                  <span className="font-semibold">Coming Soon</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-500">
              <h3 className="text-xl font-bold text-stone-800 mb-5">📱 UPI Payment</h3>
              <div className="space-y-3 text-stone-600">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-400">UPI ID</span>
                  <span className="font-semibold">Coming Soon</span>
                </div>
              </div>
              <p className="text-stone-400 text-sm mt-6">
                Scan QR code or use UPI ID for instant transfer
              </p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
            <p className="text-stone-600 text-lg">
              For cash donations or printed receipts, contact{' '}
              <strong className="text-orange-700">Nageswara Reddy</strong>
            </p>
            <p className="text-stone-400 text-sm mt-1">A receipt will be generated for every donation</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl mb-2">🕉️</p>
          <p className="font-semibold text-lg mb-1">Lakshmi Chennakeshava Swamy Temple</p>
          <p className="text-stone-400 text-sm mb-4">Yaramalapalli Village, Kadapa District, Andhra Pradesh</p>
          <div className="w-16 h-px bg-stone-700 mx-auto mb-4" />
          <p className="text-stone-500 text-xs">Built with devotion and transparency for our village community</p>
        </div>
      </footer>
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    'Travel': '🚗',
    'Food & Accommodation': '🍽️',
    'Government Fees': '🏛️',
    'Construction Materials': '🏗️',
    'Professional Fees': '👷',
    'Other': '📦',
  };
  return icons[category] || '📋';
}
