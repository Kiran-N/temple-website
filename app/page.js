'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function Home() {
  const [stats, setStats] = useState({ totalDonations: 0, totalExpenses: 0, balance: 0, donorCount: 0 });
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [breakdown, setBreakdown] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [donationsSnap, expensesSnap, photosSnap] = await Promise.all([
      getDocs(collection(db, 'donations')),
      getDocs(collection(db, 'expenses')),
      getDocs(query(collection(db, 'progress_photos'), orderBy('uploadedAt', 'desc'), limit(6))),
    ]);

    const totalDonations = donationsSnap.docs.reduce((sum, d) => sum + d.data().amount, 0);
    const expenseDocs = expensesSnap.docs.map((d) => d.data());
    const totalExpenses = expenseDocs.reduce((sum, e) => sum + e.amount, 0);

    setStats({
      totalDonations,
      totalExpenses,
      balance: totalDonations - totalExpenses,
      donorCount: donationsSnap.size,
    });

    const categoryTotals = {};
    expenseDocs.forEach((expense) => {
      if (expense.category !== 'Facilitation Payments') {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      }
    });
    setBreakdown(categoryTotals);

    setProgressPhotos(photosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🕉️</div>
              <div>
                <h1 className="text-3xl font-bold">Lakshmi Chennakeshava Swami Temple</h1>
                <p className="text-orange-100">Yaramalapalli</p>
              </div>
            </div>
            <Link href="/admin/login"
              className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition">
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Building a Divine Home for Lord Chennakeshava
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in constructing a sacred space for our community.
            Every contribution brings us closer to completing this holy project.
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: '💰', label: 'Total Donations', value: `₹${stats.totalDonations.toLocaleString('en-IN')}`, color: 'text-green-600' },
            { icon: '📊', label: 'Total Expenses', value: `₹${stats.totalExpenses.toLocaleString('en-IN')}`, color: 'text-red-600' },
            { icon: '💵', label: 'Current Balance', value: `₹${stats.balance.toLocaleString('en-IN')}`, color: 'text-blue-600' },
            { icon: '🙏', label: 'Generous Donors', value: stats.donorCount, color: 'text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <h3 className="text-gray-600 font-semibold mb-2">{stat.label}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Transparent Expense Breakdown</h3>
          {Object.keys(breakdown).length === 0 ? (
            <p className="text-center text-gray-500">No expenses recorded yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(breakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span className="font-semibold text-gray-700">{category}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Construction Progress Gallery */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Construction Progress</h3>
          {progressPhotos.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {progressPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition">
                  <img src={photo.url} alt={photo.description} className="w-full h-64 object-cover" />
                  <div className="p-4">
                    <p className="font-semibold text-gray-800">{photo.description || ''}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000).toLocaleDateString('en-IN') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-gray-500 text-lg">Construction photos coming soon...</p>
            </div>
          )}
        </div>

        {/* How to Donate */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Contribute to This Sacred Project</h3>
          <p className="text-xl mb-8 text-orange-100">
            Your donation helps build a spiritual sanctuary for generations to come
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4">💳 Bank Transfer</h4>
              <p className="mb-2"><strong>Account Name:</strong> Temple Construction Fund</p>
              <p className="mb-2"><strong>Account No:</strong> Coming Soon</p>
              <p className="mb-2"><strong>IFSC:</strong> Coming Soon</p>
              <p className="mb-2"><strong>Bank:</strong> Coming Soon</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4">📱 UPI Payment</h4>
              <p className="mb-4"><strong>UPI ID:</strong> Coming Soon</p>
              <p className="text-sm text-orange-100">Scan QR code or use UPI ID for instant donation</p>
            </div>
          </div>
          <p className="mt-8 text-orange-100">
            For cash donations or receipts, please contact: <strong>Nageswara Reddy</strong>
          </p>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">🕉️ Lakshmi Chennakeshava Swami Temple, Yaramalapalli</p>
          <p className="text-gray-400 text-sm">Built with devotion and transparency</p>
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
