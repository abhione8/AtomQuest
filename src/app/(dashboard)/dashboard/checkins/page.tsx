'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface Checkin {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  goal: { title: string };
  progressPercentage: number;
}

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const res = await fetch('/api/checkins');
        if (res.ok) {
          const data = await res.json();
          setCheckins(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch checkins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, []);

  const tableData = checkins.map((checkin) => [
    checkin.goal.title,
    <div key={`progress-${checkin.id}`} className="w-24 bg-gray-200 rounded-full h-2">
      <div
        className="bg-indigo-600 h-2 rounded-full"
        style={{ width: `${checkin.progressPercentage}%` }}
      />
    </div>,
    <Badge key={`status-${checkin.id}`} variant="success">
      {checkin.status}
    </Badge>,
    new Date(checkin.createdAt).toLocaleDateString(),
    <Link key={`link-${checkin.id}`} href={`/dashboard/checkins/${checkin.id}`}>
      <Button variant="secondary" size="sm">
        View
      </Button>
    </Link>,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading checkins...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Checkins</h1>
        <Link href="/dashboard/checkins/create">
          <Button>New Checkin</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Checkins</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Goal', 'Progress', 'Status', 'Date', 'Action']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
