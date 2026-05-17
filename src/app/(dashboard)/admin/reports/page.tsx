'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface SystemReport {
  totalUsers: number;
  totalGoalSheets: number;
  totalGoals: number;
  totalCheckins: number;
  approvalRate: number;
  completionRate: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<SystemReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch('/api/reports/summary');
        if (res.ok) {
          const data = await res.json();
          setReport(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">System Reports</h1>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">{report.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Goal Sheets</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{report.totalGoalSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Goals</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{report.totalGoals}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Checkins</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{report.totalCheckins}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Approval Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{report.approvalRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-pink-600 mt-2">{report.completionRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-gray-800">System Overview</p>
            <p className="text-gray-700 text-sm mt-2">
              The AtomQuest system currently has {report?.totalUsers} active users with{' '}
              {report?.totalGoalSheets} goal sheets and {report?.totalGoals} individual goals. The
              system is processing {report?.totalCheckins} quarterly checkins with an overall approval
              rate of {report?.approvalRate}% and completion rate of {report?.completionRate}%.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Key Metrics</p>
            <ul className="text-gray-700 text-sm mt-2 space-y-1">
              <li>• Average goals per sheet: {Math.round((report?.totalGoals || 0) / (report?.totalGoalSheets || 1))}</li>
              <li>• Users per department: Varies by department</li>
              <li>• System health: Operational</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
