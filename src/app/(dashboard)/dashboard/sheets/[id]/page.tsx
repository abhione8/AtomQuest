'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Textarea } from '@/components/ui';

interface GoalSheetDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  cycle: { id: string; quarter: string };
  goals: any[];
}

export default function GoalSheetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sheet, setSheet] = useState<GoalSheetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const res = await fetch(`/api/goal-sheets/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSheet(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch goal sheet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [params.id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/goal-sheets/${params.id}/submit`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/dashboard/sheets');
      }
    } catch (error) {
      console.error('Failed to submit goal sheet:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading goal sheet...</div>;
  }

  if (!sheet) {
    return <div className="text-center py-10 text-red-600">Goal sheet not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{sheet.title}</h1>
        <div className="flex gap-4 items-center">
          <Badge>{sheet.status}</Badge>
          <span className="text-gray-600">{sheet.cycle.quarter}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Total Goals</p>
            <p className="text-2xl font-bold text-indigo-600">{sheet.goals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-2xl font-bold text-blue-600">{sheet.status}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Quarter</p>
            <p className="text-2xl font-bold text-green-600">{sheet.cycle.quarter}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{sheet.description || 'No description provided'}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {sheet.goals.length === 0 ? (
            <p className="text-gray-600">No goals added yet</p>
          ) : (
            <div className="space-y-4">
              {sheet.goals.map((goal: any) => (
                <div key={goal.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <p className="font-semibold text-gray-800">{goal.title}</p>
                  <p className="text-gray-600 text-sm">{goal.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {sheet.status === 'DRAFT' && (
        <div className="flex gap-4">
          <Button onClick={handleSubmit} loading={submitting}>
            Submit for Approval
          </Button>
          <Button variant="secondary">Add Goal</Button>
        </div>
      )}
    </div>
  );
}
