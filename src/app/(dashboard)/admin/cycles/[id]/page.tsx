'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Input, Select, Button } from '@/components/ui';

interface Cycle {
  id: string;
  quarter: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function CycleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quarter: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const res = await fetch(`/api/cycles/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCycle(data.data);
          setFormData({
            quarter: data.data.quarter,
            startDate: new Date(data.data.startDate).toISOString().split('T')[0],
            endDate: new Date(data.data.endDate).toISOString().split('T')[0],
            status: data.data.status,
          });
        }
      } catch (error) {
        console.error('Failed to fetch cycle:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycle();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/cycles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/cycles');
      }
    } catch (error) {
      console.error('Failed to update cycle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading cycle...</div>;
  }

  if (!cycle) {
    return <div className="text-center py-10 text-red-600">Cycle not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Cycle</h1>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Quarter"
              name="quarter"
              value={formData.quarter}
              onChange={handleChange}
              options={[
                { value: 'Q1', label: 'Q1' },
                { value: 'Q2', label: 'Q2' },
                { value: 'Q3', label: 'Q3' },
                { value: 'Q4', label: 'Q4' },
              ]}
            />

            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />

            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
            />

            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
