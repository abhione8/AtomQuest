'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  completedSheets: number;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setTeam(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const tableData = team.map((member) => [
    member.name,
    member.email,
    member.department,
    <Badge key={member.id} variant="info">
      {member.role}
    </Badge>,
    member.completedSheets,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading team...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Team</h1>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({team.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Name', 'Email', 'Department', 'Role', 'Completed Sheets']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
