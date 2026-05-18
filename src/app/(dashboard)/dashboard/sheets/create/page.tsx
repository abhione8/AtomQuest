'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select } from '@/components/ui';

export default function CreateGoalSheetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cycleId: '',
  });
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await fetch('/api/cycles');
        if (res.ok) {
          const data = await res.json();
          setCycles(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch cycles:', error);
      }
    };

    fetchCycles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/goal-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create goal sheet');
        return;
      }

      router.push(`/dashboard/sheets/${data.data.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Goal Sheet</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Goal Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <Input
              label="Title"
              name="title"
              placeholder="Enter goal sheet title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Enter goal sheet description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />

            <Select
              label="Cycle"
              name="cycleId"
              value={formData.cycleId}
              onChange={handleChange}
              options={cycles.map((cycle) => ({
                value: cycle.id,
                label: `${cycle.quarter} - ${new Date(cycle.startDate).getFullYear()}`,
              }))}
              required
            />

            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Create Goal Sheet
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
