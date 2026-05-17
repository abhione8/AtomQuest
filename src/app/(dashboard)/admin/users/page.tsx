'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Table, Badge, Button } from '@/components/ui';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    return role === 'ADMIN' ? 'danger' : role === 'MANAGER' ? 'warning' : 'info';
  };

  const tableData = users.map((user) => [
    user.name,
    user.email,
    user.department,
    <Badge key={user.id} variant={getRoleBadgeVariant(user.role)}>
      {user.role}
    </Badge>,
    new Date(user.createdAt).toLocaleDateString(),
    <Button key={`btn-${user.id}`} variant="secondary" size="sm">
      Edit
    </Button>,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <Button>Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            headers={['Name', 'Email', 'Department', 'Role', 'Created', 'Action']}
            data={tableData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
