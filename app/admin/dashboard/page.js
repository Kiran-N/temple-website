'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalExpenses: 0,
    balance: 0,
    donorCount: 0
  });

  useEffect(() => {
    // Check if logged in
    const sessionData = localStorage.getItem('templeAdminSession');
    if (!sessionData) {
      router.push('/admin/login');
      return;
    }
    
    setSession(JSON.parse(sessionData));
    loadStats();
  }, [router]);

  const loadStats = () => {
    const donations = JSON.parse(localStorage.getItem('templeDonations') || '[]');
    const expenses = JSON.parse(localStorage.getItem('templeExpenses') || '[]');
    
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    setStats({
      totalDonations,
      totalExpenses,
      balance: totalDonations - totalExpenses,
      donorCount: donations.length
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('templeAdminSession');
    router.push('/admin/login');
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
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
              <Link 
                href="/"
                target="_blank"
                className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                View Public Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'overview'
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📊 Overview
                </button>
                
                <button
                  onClick={() => setActiveTab('add-donation')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'add-donation'
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  💰 Add Donation
                </button>
                
                <button
                  onClick={() => setActiveTab('add-expense')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'add-expense'
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  💸 Add Expense
                </button>
                
                <button
                  onClick={() => setActiveTab('progress-photos')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'progress-photos'
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📷 Progress Photos
                </button>
                
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'transactions'
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📋 All Transactions
                </button>

                {session.role === 'super_admin' && (
                  <button
                    onClick={() => setActiveTab('manage-admins')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                      activeTab === 'manage-admins'
                        ? 'bg-orange-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    👥 Manage Admins
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'add-donation' && <AddDonationTab onUpdate={loadStats} />}
            {activeTab === 'add-expense' && <AddExpenseTab onUpdate={loadStats} session={session} />}
            {activeTab === 'progress-photos' && <ProgressPhotosTab />}
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
      
      {/* Stats Grid */}
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition">
            <div className="text-3xl mb-2">📥</div>
            <p className="font-semibold">Download Report</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition">
            <div className="text-3xl mb-2">📧</div>
            <p className="font-semibold">Email Donors</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition">
            <div className="text-3xl mb-2">🔄</div>
            <p className="font-semibold">Sync Data</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDonationTab({ onUpdate }) {
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    paymentMode: 'Cash',
    notes: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get receipt number
    let receiptCounter = parseInt(localStorage.getItem('templeReceiptCounter') || '0');
    receiptCounter++;
    const receiptNo = `TR-${receiptCounter.toString().padStart(4, '0')}`;
    localStorage.setItem('templeReceiptCounter', receiptCounter.toString());

    // Create donation record
    const donation = {
      date: new Date().toLocaleString('en-IN'),
      donorName: formData.donorName,
      amount: parseFloat(formData.amount),
      receiptNo,
      paymentMode: formData.paymentMode,
      notes: formData.notes,
      type: 'donation'
    };

    // Save to storage
    const donations = JSON.parse(localStorage.getItem('templeDonations') || '[]');
    donations.push(donation);
    localStorage.setItem('templeDonations', JSON.stringify(donations));

    // Generate receipt
    generateReceipt(donation);

    // Reset form
    setFormData({ donorName: '', amount: '', paymentMode: 'Cash', notes: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    onUpdate();
  };

  const generateReceipt = (donation) => {
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${donation.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .receipt { border: 3px solid #333; padding: 30px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #ea580c; margin-bottom: 5px; }
          .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ddd; }
          .amount-row { font-size: 24px; font-weight: bold; color: #16a34a; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center; font-style: italic; color: #666; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>🕉️ DONATION RECEIPT</h1>
            <h2>Lakshmi Chennakeshava Swami Temple</h2>
            <p>Yaramalapalli</p>
          </div>
          <div class="row"><strong>Receipt No:</strong><span>${donation.receiptNo}</span></div>
          <div class="row"><strong>Date:</strong><span>${donation.date}</span></div>
          <div class="row"><strong>Received From:</strong><span>${donation.donorName}</span></div>
          <div class="row"><strong>Payment Mode:</strong><span>${donation.paymentMode}</span></div>
          <div class="amount-row row"><strong>Amount:</strong><span>₹${donation.amount.toLocaleString('en-IN')}</span></div>
          ${donation.notes ? `<div class="row"><strong>Notes:</strong><span>${donation.notes}</span></div>` : ''}
          <div class="footer">
            <p>Thank you for your generous contribution to the temple construction</p>
            <p style="margin-top: 10px; font-size: 12px;">This is a computer-generated receipt</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 15px 30px; font-size: 16px; background: #ea580c; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
        </div>
      </body>
      </html>
    `);
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
          <input
            type="text"
            value={formData.donorName}
            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Amount (₹) *</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Payment Mode</label>
          <select
            value={formData.paymentMode}
            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-green-800 transition"
        >
          Record Donation & Generate Receipt
        </button>
      </form>
    </div>
  );
}

function AddExpenseTab({ onUpdate, session }) {
  const [formData, setFormData] = useState({
    category: 'Travel',
    amount: '',
    paidBy: 'Nageswara Reddy',
    otherName: '',
    description: ''
  });
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if facilitation payment needs password
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

  const saveExpense = () => {
    const paidBy = formData.paidBy === 'Other' ? formData.otherName : formData.paidBy;
    
    const expense = {
      date: new Date().toLocaleString('en-IN'),
      category: formData.category,
      amount: parseFloat(formData.amount),
      paidBy,
      description: formData.description,
      addedBy: session.name,
      reimbursed: false,
      type: 'expense'
    };

    const expenses = JSON.parse(localStorage.getItem('templeExpenses') || '[]');
    expenses.push(expense);
    localStorage.setItem('templeExpenses', JSON.stringify(expenses));

    setFormData({
      category: 'Travel',
      amount: '',
      paidBy: 'Nageswara Reddy',
      otherName: '',
      description: ''
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          >
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
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Paid By *</label>
          <select
            value={formData.paidBy}
            onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option>Nageswara Reddy</option>
            <option>Chandra</option>
            <option>Other</option>
          </select>
        </div>

        {formData.paidBy === 'Other' && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Enter Name *</label>
            <input
              type="text"
              value={formData.otherName}
              onChange={(e) => setFormData({ ...formData, otherName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            rows="3"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-orange-700 hover:to-red-700 transition"
        >
          Record Expense
        </button>
      </form>

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Password</h3>
            <p className="text-gray-600 mb-4">This category requires authorization</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 mb-4"
              placeholder="Enter password"
            />
            <div className="flex space-x-4">
              <button
                onClick={verifyAndSave}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowPassword(false);
                  setPassword('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressPhotosTab() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Construction Progress Photos</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <p className="text-gray-600 text-lg mb-6">Photo upload feature coming soon!</p>
        <p className="text-sm text-gray-500">Will integrate with Cloudinary for image storage</p>
      </div>
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const donations = JSON.parse(localStorage.getItem('templeDonations') || '[]');
    const expenses = JSON.parse(localStorage.getItem('templeExpenses') || '[]');
    const all = [...donations, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(all);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">All Transactions</h2>
      
      {transactions.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((t, i) => (
            <div key={i} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800">
                  {t.type === 'donation' ? t.donorName : t.category}
                </p>
                <p className="text-sm text-gray-600">
                  {t.type === 'donation' ? t.receiptNo : t.paidBy} • {t.date}
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
  const [admins, setAdmins] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', name: '', role: 'admin' });

  useEffect(() => {
    const storedAdmins = JSON.parse(localStorage.getItem('templeAdmins') || '{}');
    setAdmins(storedAdmins);
  }, []);

  const handleAddAdmin = () => {
    const updated = {
      ...admins,
      [newAdmin.username.toLowerCase()]: {
        password: newAdmin.password,
        name: newAdmin.name,
        role: newAdmin.role
      }
    };
    localStorage.setItem('templeAdmins', JSON.stringify(updated));
    setAdmins(updated);
    setNewAdmin({ username: '', password: '', name: '', role: 'admin' });
    setShowAdd(false);
  };

  const handleRemoveAdmin = (username) => {
    if (confirm(`Remove admin: ${username}?`)) {
      const updated = { ...admins };
      delete updated[username];
      localStorage.setItem('templeAdmins', JSON.stringify(updated));
      setAdmins(updated);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Admins</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          + Add Admin
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(admins).map(([username, data]) => (
          <div key={username} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-semibold text-gray-800">{data.name}</p>
              <p className="text-sm text-gray-600">@{username} • {data.role}</p>
            </div>
            {username !== session.username && (
              <button
                onClick={() => handleRemoveAdmin(username)}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddAdmin}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Add Admin
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewAdmin({ username: '', password: '', name: '', role: 'admin' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
