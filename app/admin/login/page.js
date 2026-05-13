'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Default admin credentials (in real version, this comes from Firebase)
  const defaultAdmins = {
    'kiran': { password: 'kiran123', name: 'Kiran', role: 'super_admin' },
    'nageswara': { password: 'reddy123', name: 'Nageswara Reddy', role: 'admin' }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check stored admins
    const storedAdmins = JSON.parse(localStorage.getItem('templeAdmins') || JSON.stringify(defaultAdmins));
    
    const admin = storedAdmins[username.toLowerCase()];
    
    if (admin && admin.password === password) {
      // Store session
      localStorage.setItem('templeAdminSession', JSON.stringify({
        username: username.toLowerCase(),
        name: admin.name,
        role: admin.role,
        loginTime: new Date().toISOString()
      }));
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕉️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Temple Admin Panel
          </h1>
          <p className="text-gray-600">Lakshmi Chennakeshava Swami Temple</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Admin Login
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              ← Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
