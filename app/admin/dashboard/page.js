'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db, firebaseConfig } from '@/lib/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import {
  collection, addDoc, getDocs, doc, getDoc, setDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore';

// Secondary Firebase app to create new auth users without affecting current session
function getSecondaryAuth() {
  const existing = getApps().find((a) => a.name === 'secondary');
  const app = existing || initializeApp(firebaseConfig, 'secondary');
  return getAuth(app);
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload failed');
  return data.secure_url;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalDonations: 0, totalExpenses: 0, balance: 0, donorCount: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      const stored = sessionStorage.getItem('templeAdminSession');
      if (stored) {
        setSession(JSON.parse(stored));
      } else {
        // Re-fetch from Firestore if sessionStorage was cleared — match by email
        const snap = await getDocs(collection(db, 'admins'));
        const matched = snap.docs.find((d) => d.data().email === user.email);
        const username = matched ? matched.id : user.email;
        const adminDoc = await getDoc(doc(db, 'admins', username));
        const adminData = adminDoc.exists() ? adminDoc.data() : { name: username, role: 'admin' };
        const sessionData = { username, name: adminData.name, role: adminData.role };
        sessionStorage.setItem('templeAdminSession', JSON.stringify(sessionData));
        setSession(sessionData);
      }
      loadStats();
    });
    return () => unsubscribe();
  }, [router]);

  const loadStats = async () => {
    const [donationsSnap, expensesSnap] = await Promise.all([
      getDocs(collection(db, 'donations')),
      getDocs(collection(db, 'expenses')),
    ]);
    const totalDonations = donationsSnap.docs.reduce((sum, d) => sum + d.data().amount, 0);
    const totalExpenses = expensesSnap.docs.reduce((sum, d) => sum + d.data().amount, 0);
    setStats({
      totalDonations,
      totalExpenses,
      balance: totalDonations - totalExpenses,
      donorCount: donationsSnap.size,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('templeAdminSession');
    router.push('/admin/login');
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🕉️</div>
              <div>
                <h1 className="text-xl font-bold">Temple Admin Panel</h1>
                <p className="text-sm text-orange-100">Welcome, {session.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" target="_blank" className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                View Public Site
              </Link>
              <button onClick={handleLogout} className="text-sm bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: '📊 Overview' },
                  { id: 'add-donation', label: '💰 Add Donation' },
                  { id: 'add-expense', label: '💸 Add Expense' },
                  { id: 'progress-photos', label: '📷 Progress Photos' },
                  { id: 'transactions', label: '📋 All Transactions' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                      activeTab === tab.id ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                {session.role === 'super_admin' && (
                  <button
                    onClick={() => setActiveTab('manage-admins')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                      activeTab === 'manage-admins' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    👥 Manage Admins
                  </button>
                )}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'add-donation' && <AddDonationTab onUpdate={loadStats} />}
            {activeTab === 'add-expense' && <AddExpenseTab onUpdate={loadStats} session={session} />}
            {activeTab === 'progress-photos' && <ProgressPhotosTab session={session} />}
            {activeTab === 'transactions' && <TransactionsTab />}
            {activeTab === 'manage-admins' && <ManageAdminsTab session={session} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-sm">Total Donations</p>
              <h3 className="text-4xl font-bold">₹{stats.totalDonations.toLocaleString('en-IN')}</h3>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
          <p className="text-green-100 text-sm">{stats.donorCount} donors</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-red-100 text-sm">Total Expenses</p>
              <h3 className="text-4xl font-bold">₹{stats.totalExpenses.toLocaleString('en-IN')}</h3>
            </div>
            <div className="text-5xl opacity-50">💸</div>
          </div>
          <p className="text-red-100 text-sm">All categories</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Current Balance</p>
              <h3 className="text-5xl font-bold">₹{stats.balance.toLocaleString('en-IN')}</h3>
            </div>
            <div className="text-6xl opacity-50">💵</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddDonationTab({ onUpdate }) {
  const [formData, setFormData] = useState({ donorName: '', amount: '', paymentMode: 'Cash', notes: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Receipt number from donation count
    const snap = await getDocs(collection(db, 'donations'));
    const receiptNo = `TR-${(snap.size + 1).toString().padStart(4, '0')}`;

    const donation = {
      donorName: formData.donorName,
      amount: parseFloat(formData.amount),
      receiptNo,
      paymentMode: formData.paymentMode,
      notes: formData.notes,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'donations'), donation);
    generateReceipt({ ...donation, date: new Date().toLocaleString('en-IN') });

    setFormData({ donorName: '', amount: '', paymentMode: 'Cash', notes: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setLoading(false);
    onUpdate();
  };

  const generateReceipt = (donation) => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt - ${donation.receiptNo}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
        .receipt{border:3px solid #333;padding:30px}
        .header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:30px}
        .header h1{color:#ea580c;margin-bottom:5px}
        .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ddd}
        .amount-row{font-size:24px;font-weight:bold;color:#16a34a;margin:20px 0}
        .footer{margin-top:40px;padding-top:20px;border-top:2px solid #333;text-align:center;font-style:italic;color:#666}
      </style></head><body>
      <div class="receipt">
        <div class="header"><h1>🕉️ DONATION RECEIPT</h1>
          <h2>Lakshmi Chennakeshava Swami Temple</h2><p>Yaramalapalli</p></div>
        <div class="row"><strong>Receipt No:</strong><span>${donation.receiptNo}</span></div>
        <div class="row"><strong>Date:</strong><span>${donation.date}</span></div>
        <div class="row"><strong>Received From:</strong><span>${donation.donorName}</span></div>
        <div class="row"><strong>Payment Mode:</strong><span>${donation.paymentMode}</span></div>
        <div class="amount-row row"><strong>Amount:</strong><span>₹${parseFloat(donation.amount).toLocaleString('en-IN')}</span></div>
        ${donation.notes ? `<div class="row"><strong>Notes:</strong><span>${donation.notes}</span></div>` : ''}
        <div class="footer"><p>Thank you for your generous contribution to the temple construction</p>
          <p style="margin-top:10px;font-size:12px">This is a computer-generated receipt</p></div>
      </div>
      <div style="text-align:center;margin-top:30px">
        <button onclick="window.print()" style="padding:15px 30px;font-size:16px;background:#ea580c;color:white;border:none;border-radius:5px;cursor:pointer">Print Receipt</button>
      </div></body></html>`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Record New Donation</h2>
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Donation recorded successfully! Receipt has been generated.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Donor Name *</label>
          <input type="text" value={formData.donorName}
            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Amount (₹) *</label>
          <input type="number" value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" min="1" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Payment Mode</label>
          <select value={formData.paymentMode}
            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
            <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Notes (Optional)</label>
          <textarea value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" rows="3" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Record Donation & Generate Receipt'}
        </button>
      </form>
    </div>
  );
}

function AddExpenseTab({ onUpdate, session }) {
  const [formData, setFormData] = useState({
    category: 'Travel', amount: '', paidBy: 'Nageswara Reddy', otherName: '', description: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.category === 'Facilitation Payments') {
      setShowPassword(true);
      return;
    }
    saveExpense();
  };

  const verifyAndSave = () => {
    if (password === 'temple123') {
      setShowPassword(false);
      setPassword('');
      saveExpense();
    } else {
      alert('Incorrect password');
    }
  };

  const saveExpense = async () => {
    setLoading(true);
    const paidBy = formData.paidBy === 'Other' ? formData.otherName : formData.paidBy;
    await addDoc(collection(db, 'expenses'), {
      category: formData.category,
      amount: parseFloat(formData.amount),
      paidBy,
      description: formData.description,
      addedBy: session.name,
      reimbursed: false,
      createdAt: new Date(),
    });
    setFormData({ category: 'Travel', amount: '', paidBy: 'Nageswara Reddy', otherName: '', description: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setLoading(false);
    onUpdate();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Record New Expense</h2>
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Expense recorded successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Category *</label>
          <select value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
            <option>Travel</option>
            <option>Food & Accommodation</option>
            <option>Government Fees</option>
            <option>Facilitation Payments</option>
            <option>Construction Materials</option>
            <option>Professional Fees</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Amount (₹) *</label>
          <input type="number" value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" min="1" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Paid By *</label>
          <select value={formData.paidBy}
            onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
            <option>Nageswara Reddy</option>
            <option>Chandra</option>
            <option>Other</option>
          </select>
        </div>
        {formData.paidBy === 'Other' && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Enter Name *</label>
            <input type="text" value={formData.otherName}
              onChange={(e) => setFormData({ ...formData, otherName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" required />
          </div>
        )}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Description *</label>
          <textarea value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" rows="3" required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Record Expense'}
        </button>
      </form>

      {showPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Password</h3>
            <p className="text-gray-600 mb-4">This category requires authorization</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 mb-4"
              placeholder="Enter password" />
            <div className="flex space-x-4">
              <button onClick={verifyAndSave}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition">Submit</button>
              <button onClick={() => { setShowPassword(false); setPassword(''); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressPhotosTab({ session }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'progress_photos'), orderBy('uploadedAt', 'desc')));
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('loadPhotos error:', err);
      // Fallback: fetch without ordering if index isn't ready
      try {
        const snap = await getDocs(collection(db, 'progress_photos'));
        setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err2) {
        console.error('loadPhotos fallback error:', err2);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadToCloudinary(selectedFile);
      await addDoc(collection(db, 'progress_photos'), {
        url,
        description,
        uploadedBy: session.name,
        uploadedAt: new Date(),
      });
      setDescription('');
      setSelectedFile(null);
      setPreview(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadPhotos();
    } catch {
      setError('Upload failed. Check your Cloudinary settings and try again.');
    }
    setUploading(false);
  };

  const handleDelete = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    await deleteDoc(doc(db, 'progress_photos', photoId));
    loadPhotos();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Construction Progress Photos</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Upload New Photo</h3>
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Photo uploaded successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Select Photo *</label>
          <input type="file" accept="image/*" onChange={handleFileChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-orange-500" required />
        </div>
        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="h-48 object-cover rounded-lg" />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Foundation work completed"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
        </div>
        <button type="submit" disabled={uploading || !selectedFile}
          className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </form>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No photos uploaded yet</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-xl overflow-hidden border border-gray-200 shadow">
              <img src={photo.url} alt={photo.description} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="font-semibold text-gray-800 text-sm">{photo.description || 'No description'}</p>
                <p className="text-xs text-gray-500 mt-1">By {photo.uploadedBy}</p>
                <button onClick={() => handleDelete(photo.id)}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [donationsSnap, expensesSnap] = await Promise.all([
        getDocs(query(collection(db, 'donations'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'expenses'), orderBy('createdAt', 'desc'))),
      ]);
      const donations = donationsSnap.docs.map((d) => ({ id: d.id, type: 'donation', ...d.data() }));
      const expenses = expensesSnap.docs.map((d) => ({ id: d.id, type: 'expense', ...d.data() }));
      const all = [...donations, ...expenses].sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setTransactions(all);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">All Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800">
                  {t.type === 'donation' ? t.donorName : t.category}
                </p>
                <p className="text-sm text-gray-600">
                  {t.type === 'donation' ? t.receiptNo : t.paidBy} •{' '}
                  {t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString('en-IN') : ''}
                </p>
              </div>
              <div className={`text-xl font-bold ${t.type === 'donation' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'donation' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManageAdminsTab({ session }) {
  const [admins, setAdmins] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', name: '', role: 'admin', email: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const snap = await getDocs(collection(db, 'admins'));
    setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.name || !newAdmin.email) {
      setError('All fields are required');
      return;
    }
    setAdding(true);
    setError('');
    try {
      // Create Firebase Auth user via secondary app (won't affect current session)
      const secondaryAuth = getSecondaryAuth();
      await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, newAdmin.password);
      await secondaryAuth.signOut();

      // Save role/name/email in Firestore
      await setDoc(doc(db, 'admins', newAdmin.username.toLowerCase()), {
        name: newAdmin.name,
        role: newAdmin.role,
        email: newAdmin.email,
      });

      setNewAdmin({ username: '', password: '', name: '', role: 'admin', email: '' });
      setShowAdd(false);
      loadAdmins();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This username already exists');
      } else {
        setError('Failed to add admin: ' + err.message);
      }
    }
    setAdding(false);
  };

  const handleRemoveAdmin = async (adminId) => {
    if (adminId === session.username) return;
    if (!confirm(`Remove admin: ${adminId}?`)) return;
    await deleteDoc(doc(db, 'admins', adminId));
    loadAdmins();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Admins</h2>
        <button onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
          + Add Admin
        </button>
      </div>

      <div className="space-y-4">
        {admins.map((admin) => (
          <div key={admin.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-semibold text-gray-800">{admin.name}</p>
              <p className="text-sm text-gray-600">@{admin.id} • {admin.role}</p>
            </div>
            {admin.id !== session.username && (
              <button onClick={() => handleRemoveAdmin(admin.id)}
                className="text-red-600 hover:text-red-700 font-semibold">Remove</button>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Admin</h3>
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input type="text" value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="e.g. rama" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email (Gmail)</label>
                <input type="email" value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="e.g. rama@gmail.com" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input type="password" value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input type="text" value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Role</label>
                <select value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button onClick={handleAddAdmin} disabled={adding}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
                {adding ? 'Adding...' : 'Add Admin'}
              </button>
              <button onClick={() => { setShowAdd(false); setError(''); setNewAdmin({ username: '', password: '', name: '', role: 'admin', email: '' }); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
