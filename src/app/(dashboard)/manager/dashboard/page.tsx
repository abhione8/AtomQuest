'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface ManagerDashboard {
  teamSize: number;
  pendingApprovals: number;
  completedSheets: number;
  averageGoalCount: number;
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<ManagerDashboard | null>(null);
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
        console.error('Failed to fetch manager dashboard:', error);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manager Dashboard</h1>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Team Members</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{data.teamSize}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{data.pendingApprovals}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Completed Sheets</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{data.completedSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Avg Goals/Sheet</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.averageGoalCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/manager/approvals">
              <Button className="w-full">Review Pending Approvals</Button>
            </Link>
            <Link href="/manager/team">
              <Button variant="secondary" className="w-full">
                View Team
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/manager/reports">
              <Button className="w-full">Team Performance</Button>
            </Link>
            <Link href="/manager/metrics">
              <Button variant="secondary" className="w-full">
                Team Metrics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
