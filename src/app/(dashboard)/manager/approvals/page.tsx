'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface ApprovalItem {
  id: string;
  goalSheet: { title: string; employee: { name: string } };
  status: string;
  createdAt: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await fetch('/api/approvals');
        if (res.ok) {
          const data = await res.json();
          setApprovals(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch approvals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const tableData = approvals.map((approval) => [
    approval.goalSheet.employee.name,
    approval.goalSheet.title,
    <Badge key={approval.id} variant="warning">
      {approval.status}
    </Badge>,
    new Date(approval.createdAt).toLocaleDateString(),
    <Link key={`link-${approval.id}`} href={`/manager/approvals/${approval.id}`}>
      <Button variant="primary" size="sm">
        Review
      </Button>
    </Link>,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading approvals...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Approvals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Goal Sheets Awaiting Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Employee', 'Goal Sheet', 'Status', 'Submitted', 'Action']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
