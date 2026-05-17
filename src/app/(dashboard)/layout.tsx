'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  departmentId?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white shadow-lg">
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-2xl font-bold">AtomQuest</h1>
          <p className="text-indigo-300 text-sm mt-1">{user.role}</p>
        </div>

        <nav className="mt-6">
          {/* Employee Links */}
          {(user.role === 'EMPLOYEE' || user.role === 'MANAGER' || user.role === 'ADMIN') && (
            <>
              <Link
                href="/dashboard"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/sheets"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Goal Sheets
              </Link>
              <Link
                href="/dashboard/goals"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Goals
              </Link>
              <Link
                href="/dashboard/checkins"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Checkins
              </Link>
            </>
          )}

          {/* Manager Links */}
          {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
            <>
              <hr className="border-indigo-800 my-2" />
              <Link
                href="/manager/dashboard"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Manager Dashboard
              </Link>
              <Link
                href="/manager/approvals"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Approvals
              </Link>
              <Link
                href="/manager/team"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Team
              </Link>
              <Link
                href="/manager/reports"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Reports
              </Link>
            </>
          )}

          {/* Admin Links */}
          {user.role === 'ADMIN' && (
            <>
              <hr className="border-indigo-800 my-2" />
              <Link
                href="/admin/dashboard"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/cycles"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Cycles
              </Link>
              <Link
                href="/admin/users"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Users
              </Link>
              <Link
                href="/admin/reports"
                className="block px-6 py-3 hover:bg-indigo-800 transition border-l-4 border-transparent hover:border-indigo-400"
              >
                Reports
              </Link>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-indigo-800 p-6">
          <p className="text-indigo-300 text-sm mb-4">{user.name}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
