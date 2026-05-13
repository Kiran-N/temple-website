'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Look up the real email from Firestore using the username
      const adminDoc = await getDoc(doc(db, 'admins', username.toLowerCase()));
      if (!adminDoc.exists()) {
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      const adminData = adminDoc.data();
      await signInWithEmailAndPassword(auth, adminData.email, password);

      sessionStorage.setItem('templeAdminSession', JSON.stringify({
        username: username.toLowerCase(),
        name: adminData.name,
        role: adminData.role,
      }));

      router.push('/admin/dashboard');
    } catch (err) {
      const authErrors = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'];
      setError(authErrors.includes(err.code) ? 'Invalid username or password' : 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕉️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Temple Admin Panel</h1>
          <p className="text-gray-600">Lakshmi Chennakeshava Swami Temple</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
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
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
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
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
              ← Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
