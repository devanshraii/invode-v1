'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Campaign = {
  id: string;
  name: string;
  client_brand: string;
  budget: number;
  platform: string;
  status: string;
  start_date: string;
  end_date: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    client_brand: '',
    goals: '',
    budget: '',
    platform: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
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
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      setFormData({
        name: '', client_brand: '', goals: '', budget: '', platform: '', start_date: '', end_date: ''
      });
      setIsAdding(false);
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Helper to color-code pipeline statuses
  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'Shortlisted') return 'bg-zinc-100 text-zinc-800';
    return 'bg-blue-100 text-blue-800'; // Default for mid-pipeline states
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Campaigns</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Campaign'}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Campaign Details</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Diwali Mega Sale 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_brand">Brand / Client</Label>
              <Input
                id="client_brand"
                value={formData.client_brand}
                onChange={(e) => setFormData({ ...formData, client_brand: e.target.value })}
                placeholder="e.g. Red Tape"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Primary Platform</Label>
              <Input
                id="platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="e.g. Instagram, YouTube"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. 500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit">Create Campaign</Button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Data Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">Loading campaigns...</td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">No campaigns created yet.</td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-zinc-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{campaign.client_brand || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{campaign.platform || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {campaign.budget ? `₹${campaign.budget.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
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