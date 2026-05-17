'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface Cycle {
  id: string;
  quarter: string;
  year: number;
  status: string;
  startDate: string;
  endDate: string;
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await fetch('/api/cycles');
        if (res.ok) {
          const data = await res.json();
          setCycles(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch cycles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  const tableData = cycles.map((cycle) => [
    `${cycle.quarter} ${cycle.year}`,
    <Badge key={cycle.id} variant="info">
      {cycle.status}
    </Badge>,
    new Date(cycle.startDate).toLocaleDateString(),
    new Date(cycle.endDate).toLocaleDateString(),
    <Link key={`link-${cycle.id}`} href={`/admin/cycles/${cycle.id}`}>
      <Button variant="secondary" size="sm">
        Edit
      </Button>
    </Link>,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading cycles...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Cycles</h1>
        <Button>Create New Cycle</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Quarter/Year', 'Status', 'Start Date', 'End Date', 'Action']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
