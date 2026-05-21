'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Creator = {
  id: string;
  name: string;
  niche_category: string;
  phone_number: string;
  follower_count: number;
  pricing: number;
  city: string;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    social_handles: '',
    niche_category: '',
    city: '',
    language: '',
    follower_count: '',
    engagement_rate: '',
    pricing: '',
    manager_details: '',
    notes: '',
    gst_status: false
  });

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
    
    // Convert string inputs to proper types for the database
    const payload = {
      ...formData,
      social_handles: formData.social_handles ? { primary: formData.social_handles } : null,
      follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
      engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
      pricing: formData.pricing ? parseFloat(formData.pricing) : null,
    };

    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add creator');
      }

      setFormData({
        name: '', phone_number: '', email: '', social_handles: '', niche_category: '',
        city: '', language: '', follower_count: '', engagement_rate: '', pricing: '',
        manager_details: '', notes: '', gst_status: false
      });
      setIsAdding(false);
      fetchCreators();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Creator CRM</h1>
          <p className="text-sm text-zinc-500">Centralized operational database of creators.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add Creator'}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-6 text-zinc-900 border-b border-zinc-100 pb-2">New Creator Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Core Info Group */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Bhuvan Bam" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (For WhatsApp) *</Label>
                <Input id="phone_number" required value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="e.g. 9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="hello@creator.com" />
              </div>
            </div>

            {/* Social & Demographics Group */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="social_handles">Primary Social Handle</Label>
                <Input id="social_handles" value={formData.social_handles} onChange={(e) => setFormData({ ...formData, social_handles: e.target.value })} placeholder="e.g. @username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="e.g. Mumbai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} placeholder="e.g. Hindi, English" />
              </div>
            </div>

            {/* Metrics & Pricing Group */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 bg-zinc-50 p-4 rounded-md border border-zinc-100">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche / Category</Label>
                <Input id="niche" value={formData.niche_category} onChange={(e) => setFormData({ ...formData, niche_category: e.target.value })} placeholder="e.g. Tech, Comedy" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followers">Follower Count</Label>
                <Input id="followers" type="number" value={formData.follower_count} onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })} placeholder="150000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
                <Input id="engagement_rate" type="number" step="0.01" value={formData.engagement_rate} onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })} placeholder="4.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing">Estimated Pricing (₹)</Label>
                <Input id="pricing" type="number" value={formData.pricing} onChange={(e) => setFormData({ ...formData, pricing: e.target.value })} placeholder="50000" />
              </div>
            </div>

            {/* Admin & Notes Group */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manager_details">Manager Details</Label>
                <Input id="manager_details" value={formData.manager_details} onChange={(e) => setFormData({ ...formData, manager_details: e.target.value })} placeholder="Manager Name & Contact" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any specific requirements or history..." />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-zinc-100 pt-4">
              <input 
                type="checkbox" 
                id="gst" 
                checked={formData.gst_status} 
                onChange={(e) => setFormData({ ...formData, gst_status: e.target.checked })}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <Label htmlFor="gst" className="text-sm font-normal">Creator is GST Registered</Label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit">Save Creator to CRM</Button>
            </div>
          </form>
        </div>
      )}

      {/* Creators Data Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Followers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Pricing</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">Loading creators...</td></tr>
            ) : creators.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">No creators added yet.</td></tr>
            ) : (
              creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900">{creator.name}</div>
                    <div className="text-xs text-zinc-500">{creator.niche_category || 'No niche'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-900">{creator.phone_number || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{creator.city || '-'}</td>
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