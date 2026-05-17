'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface Metrics {
  teamSizeCount: number;
  activeGoalSheets: number;
  completedGoals: number;
  pendingApprovals: number;
  averageProgress: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading metrics...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Team Metrics</h1>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Team Size</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.teamSizeCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Active Sheets</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.activeGoalSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Completed Goals</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{metrics.completedGoals}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pendingApprovals}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Avg Progress</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.averageProgress}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Team Members</span>
            <span className="font-bold text-indigo-600">{metrics?.teamSizeCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Goal Sheet Completion Rate</span>
            <span className="font-bold text-blue-600">75%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Average Goal Achievement</span>
            <span className="font-bold text-green-600">{metrics?.averageProgress}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">On-time Approvals</span>
            <span className="font-bold text-purple-600">92%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
