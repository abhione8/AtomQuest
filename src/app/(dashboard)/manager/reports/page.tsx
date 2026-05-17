'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui';

interface ReportData {
  totalGoalSheets: number;
  approvedSheets: number;
  pendingSheets: number;
  rejectedSheets: number;
  averageGoalsPerSheet: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch('/api/reports/summary');
        if (res.ok) {
          const data = await res.json();
          setReport(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Team Reports</h1>

      <div className="mb-6">
        <Select
          label="Select Cycle"
          options={[]}
          value={cycle}
          onChange={(e) => setCycle(e.target.value)}
        />
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Total Sheets</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{report.totalGoalSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{report.approvedSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{report.pendingSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{report.rejectedSheets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-gray-600 text-sm">Avg Goals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{report.averageGoalsPerSheet}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Your team has created {report?.totalGoalSheets} goal sheets with an average of{' '}
            {report?.averageGoalsPerSheet} goals per sheet. {report?.approvedSheets} sheets have been
            approved, {report?.pendingSheets} are pending review, and {report?.rejectedSheets} have
            been rejected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
