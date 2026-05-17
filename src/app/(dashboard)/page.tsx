'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  totalGoalSheets: number;
  totalGoals: number;
  totalCheckins: number;
  pendingApprovals: number;
  completedGoalSheets: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
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
        console.error('Failed to fetch dashboard data:', error);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-medium">Goal Sheets</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{data.totalGoalSheets}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-medium">Total Goals</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{data.totalGoals}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-medium">Checkins</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{data.totalCheckins}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{data.pendingApprovals}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm font-medium">Completed Sheets</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{data.completedGoalSheets}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="mr-3 text-indigo-600 font-bold">1.</span>
            <span>Create a new goal sheet to start planning your quarterly goals</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-indigo-600 font-bold">2.</span>
            <span>Add goals with measurable outcomes and target dates</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-indigo-600 font-bold">3.</span>
            <span>Submit your goal sheet for manager approval</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-indigo-600 font-bold">4.</span>
            <span>Track progress with quarterly checkins</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-indigo-600 font-bold">5.</span>
            <span>Review and celebrate achievement at the end of the cycle</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
