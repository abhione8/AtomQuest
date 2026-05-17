'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface AdminDashboard {
  totalUsers: number;
  totalDepartments: number;
  activeCycles: number;
  totalGoalSheets: number;
  systemHealth: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const result = await res.json();
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{data.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Departments</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.totalDepartments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Active Cycles</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{data.activeCycles}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Goal Sheets</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{data.totalGoalSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">System Status</p>
              <p className="text-lg font-bold text-green-600 mt-2">Operational</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/cycles">
              <Button className="w-full">Manage Cycles</Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="secondary" className="w-full">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports &amp; Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/reports">
              <Button className="w-full">System Reports</Button>
            </Link>
            <Link href="/manager/reports">
              <Button variant="secondary" className="w-full">
                Department Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
