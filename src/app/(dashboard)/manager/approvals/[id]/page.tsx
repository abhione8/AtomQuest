'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Textarea } from '@/components/ui';

interface ApprovalDetail {
  id: string;
  goalSheet: {
    id: string;
    title: string;
    description: string;
    employee: { name: string; email: string };
    goals: any[];
  };
  status: string;
}

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [approval, setApproval] = useState<ApprovalDetail | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApproval = async () => {
      try {
        const res = await fetch(`/api/approvals/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setApproval(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch approval:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApproval();
  }, [params.id]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/approvals/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      });
      if (res.ok) {
        router.push('/manager/approvals');
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/approvals/${params.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      });
      if (res.ok) {
        router.push('/manager/approvals');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading approval...</div>;
  }

  if (!approval) {
    return <div className="text-center py-10 text-red-600">Approval not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{approval.goalSheet.title}</h1>
      <p className="text-gray-600 mb-4">
        By {approval.goalSheet.employee.name} ({approval.goalSheet.employee.email})
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Goal Sheet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">Description</p>
            <p className="text-gray-800">{approval.goalSheet.description}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Goals</p>
            <p className="text-2xl font-bold text-indigo-600">{approval.goalSheet.goals.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approval.goalSheet.goals.map((goal: any) => (
              <div key={goal.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                <p className="font-semibold text-gray-800">{goal.title}</p>
                <p className="text-gray-600 text-sm">{goal.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleApprove} loading={submitting}>
          Approve
        </Button>
        <Button variant="danger" onClick={handleReject} loading={submitting}>
          Reject
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
