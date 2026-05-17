'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface GoalSheet {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  quarter: string;
}

export default function GoalSheetsPage() {
  const [sheets, setSheets] = useState<GoalSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const res = await fetch('/api/goal-sheets');
        if (res.ok) {
          const data = await res.json();
          setSheets(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch goal sheets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: 'warning',
      SUBMITTED: 'info',
      APPROVED: 'success',
      REJECTED: 'danger',
      LOCKED: 'primary',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const tableData = sheets.map((sheet) => [
    sheet.title,
    sheet.quarter,
    getStatusBadge(sheet.status),
    new Date(sheet.createdAt).toLocaleDateString(),
    <Link key={sheet.id} href={`/dashboard/sheets/${sheet.id}`}>
      <Button variant="secondary" size="sm">
        View
      </Button>
    </Link>,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading goal sheets...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Goal Sheets</h1>
        <Link href="/dashboard/sheets/create">
          <Button>Create New Sheet</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Title', 'Quarter', 'Status', 'Created', 'Action']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
