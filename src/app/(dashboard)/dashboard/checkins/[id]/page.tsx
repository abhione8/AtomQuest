'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Textarea } from '@/components/ui';

interface Checkin {
  id: string;
  title: string;
  comments: string;
  status: string;
  progressPercentage: number;
  goal: { title: string };
  createdAt: string;
}

export default function CheckinDetailPage({ params }: { params: { id: string } }) {
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const res = await fetch(`/api/checkins/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCheckin(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch checkin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckin();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-10">Loading checkin...</div>;
  }

  if (!checkin) {
    return <div className="text-center py-10 text-red-600">Checkin not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{checkin.goal.title}</h1>
      <p className="text-gray-600 mb-4">Checkin from {new Date(checkin.createdAt).toLocaleDateString()}</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Progress</p>
            <p className="text-2xl font-bold text-indigo-600">{checkin.progressPercentage}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Status</p>
            <Badge variant="success">{checkin.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600 text-sm">Created</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(checkin.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{checkin.comments || 'No comments provided'}</p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button>Edit Checkin</Button>
      </div>
    </div>
  );
}
