'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define the shape of our Creator data
type Creator = {
  id: string;
  name: string;
  niche_category: string;
  follower_count: number;
  pricing: number;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    niche_category: '',
    follower_count: '',
    pricing: '',
  });

  // Fetch creators on load
  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const res = await fetch('/api/creators');
      if (!res.ok) throw new Error('Failed to fetch creators');
      const data = await res.json();
      setCreators(data.creators || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add creator');
      }

      // Reset form and refresh list
      setFormData({ name: '', niche_category: '', follower_count: '', pricing: '' });
      setIsAdding(false);
      fetchCreators();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Creator CRM</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add Creator'}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Add Creator Form */}
      {isAdding && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">New Creator Details</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bhuvan Bam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche / Category</Label>
              <Input
                id="niche"
                value={formData.niche_category}
                onChange={(e) => setFormData({ ...formData, niche_category: e.target.value })}
                placeholder="e.g. Tech, Fashion, Comedy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followers">Follower Count</Label>
              <Input
                id="followers"
                type="number"
                value={formData.follower_count}
                onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })}
                placeholder="e.g. 150000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing">Estimated Pricing (₹)</Label>
              <Input
                id="pricing"
                type="number"
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit">Save Creator</Button>
            </div>
          </form>
        </div>
      )}

      {/* Creators Data Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Niche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Followers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Pricing</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-zinc-500">Loading creators...</td>
              </tr>
            ) : creators.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-zinc-500">No creators added yet. Click 'Add Creator' to start.</td>
              </tr>
            ) : (
              creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{creator.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{creator.niche_category || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {creator.follower_count ? creator.follower_count.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {creator.pricing ? `₹${creator.pricing.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}