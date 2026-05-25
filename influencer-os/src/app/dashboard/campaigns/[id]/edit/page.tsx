'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    client_brand: '',
    budget: '',
  });

  // Fetch the existing campaign details when the page loads
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          router.push('/login');
          return;
        }

        const res = await fetch(`/api/campaigns?id=${campaignId}&userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch campaign details');
        
        const data = await res.json();
        
        // Populate the form with the existing data
        setFormData({
          name: data.campaign.name || '',
          client_brand: data.campaign.client_brand || '',
          budget: data.campaign.budget ? data.campaign.budget.toString() : '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaignId,
          name: formData.name,
          client_brand: formData.client_brand,
          budget: formData.budget,
        }),
      });

      if (!res.ok) throw new Error('Failed to update campaign');

      // Navigate back to the campaign detail page after successful save
      router.push(`/dashboard/campaigns/${campaignId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-zinc-500">Loading campaign settings...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4 text-zinc-500">
          ← Back to Workspace
        </Button>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Campaign Settings</h1>
        <p className="text-sm text-zinc-500">Update the core details of this campaign.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-200 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="brand_name">Brand Name (Prepared For)</Label>
            <Input 
              id="brand_name"
              placeholder="e.g. Nike, Acme Corp"
              value={formData.client_brand}
              onChange={(e) => setFormData({...formData, client_brand: e.target.value})}
              className="bg-zinc-50"
            />
            <p className="text-[11px] text-zinc-500">This name will appear on all generated invoices and contracts.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Campaign Title *</Label>
            <Input 
              id="name"
              required
              placeholder="e.g. Summer Launch 2026"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Total Campaign Budget (₹)</Label>
            <Input 
              id="budget"
              type="number"
              placeholder="0"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-zinc-900 text-white hover:bg-zinc-800">
              {isSaving ? 'Saving Changes...' : 'Save Campaign Details'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}