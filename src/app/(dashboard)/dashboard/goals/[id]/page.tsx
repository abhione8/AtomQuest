'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';

interface Goal {
  id: string;
  title: string;
  description: string;
  status: string;
  targetDate: string;
  currentProgress: number;
  goalSheet: { title: string };
  keyResults?: any[];
}

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await fetch(`/api/goals/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setGoal(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch goal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-10">Loading goal...</div>;
  }

  if (!goal) {
    return <div className="text-center py-10 text-red-600">Goal not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{goal.title}</h1>
      <p className="text-gray-600 mb-4">{goal.goalSheet.title}</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Status</p>
            <Badge variant="info" size="md">
              {goal.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Progress</p>
            <p className="text-2xl font-bold text-indigo-600">{goal.currentProgress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Target Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(goal.targetDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{goal.description}</p>
        </CardContent>
      </Card>

      {goal.keyResults && goal.keyResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goal.keyResults.map((kr: any) => (
                <div key={kr.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-semibold text-gray-800">{kr.title}</p>
                  <p className="text-gray-600 text-sm">{kr.targetValue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <Button>Update Progress</Button>
      </div>
    </div>
  );
}
