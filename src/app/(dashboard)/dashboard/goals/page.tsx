'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface Goal {
  id: string;
  title: string;
  description: string;
  status: string;
  goalSheet: { title: string };
  targetDate: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch('/api/goals');
        if (res.ok) {
          const data = await res.json();
          setGoals(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const tableData = goals.map((goal) => [
    goal.title,
    goal.goalSheet.title,
    <Badge key={goal.id} variant="info">
      {goal.status}
    </Badge>,
    new Date(goal.targetDate).toLocaleDateString(),
    <Link key={`link-${goal.id}`} href={`/dashboard/goals/${goal.id}`}>
      <Button variant="secondary" size="sm">
        View
      </Button>
    </Link>,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading goals...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Goals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Active Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Title', 'Goal Sheet', 'Status', 'Target Date', 'Action']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
