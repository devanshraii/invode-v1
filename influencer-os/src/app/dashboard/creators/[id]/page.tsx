'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;

  const [creator, setCreator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (creatorId) fetchCreator();
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/creators?id=${creatorId}&userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch creator');
      const data = await res.json();
      
      setCreator(data.creator);
      // Flatten social handles for the edit form
      setFormData({
        ...data.creator,
        social_handles: data.creator.social_handles?.primary || ''
      });
    } catch (err) {
      console.error(err);
      router.push('/dashboard/creators'); // Redirect if not found
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const payload = {
        ...formData,
        user_id: userId,
        social_handles: formData.social_handles ? { primary: formData.social_handles } : null,
      };

      const res = await fetch('/api/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update');
      
      setIsEditing(false);
      fetchCreator();
    } catch (err) {
      alert('Error updating creator');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this creator? This cannot be undone.')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const res = await fetch(`/api/creators?id=${creatorId}&userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      router.push('/dashboard/creators');
    } catch (err) {
      alert('Error deleting creator');
    }
  };

  if (isLoading) return <div className="p-8 text-zinc-500">Loading creator details...</div>;
  if (!creator) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <button onClick={() => router.push('/dashboard/creators')} className="text-sm text-zinc-500 hover:text-zinc-900 mb-2">← Back to CRM</button>
          <h1 className="text-2xl font-semibold text-zinc-900">{creator.name}</h1>
          <p className="text-sm text-zinc-500">{creator.niche_category || 'No Niche Specified'}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>Delete</Button>
          <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</Button>
        </div>
      </div>

      {!isEditing ? (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div><h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact Details</h3></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-zinc-500">Phone:</div><div className="font-medium text-zinc-900">{creator.phone_number || '-'}</div>
              <div className="text-zinc-500">Email:</div><div className="font-medium text-zinc-900">{creator.email || '-'}</div>
              <div className="text-zinc-500">Manager:</div><div className="font-medium text-zinc-900">{creator.manager_details || '-'}</div>
            </div>

            <div className="pt-4"><h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Demographics</h3></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-zinc-500">City:</div><div className="font-medium text-zinc-900">{creator.city || '-'}</div>
              <div className="text-zinc-500">Language:</div><div className="font-medium text-zinc-900">{creator.language || '-'}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div><h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Social & Pricing</h3></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-zinc-500">Primary Handle:</div><div className="font-medium text-blue-600">{creator.social_handles?.primary || '-'}</div>
              <div className="text-zinc-500">Followers:</div><div className="font-medium text-zinc-900">{creator.follower_count?.toLocaleString() || '-'}</div>
              <div className="text-zinc-500">Engagement:</div><div className="font-medium text-zinc-900">{creator.engagement_rate ? `${creator.engagement_rate}%` : '-'}</div>
              <div className="text-zinc-500">Est. Pricing:</div><div className="font-medium text-zinc-900">{creator.pricing ? `₹${creator.pricing.toLocaleString()}` : '-'}</div>
              <div className="text-zinc-500">GST Status:</div><div className="font-medium text-zinc-900">{creator.gst_status ? 'Registered' : 'Unregistered'}</div>
            </div>

            <div className="pt-4"><h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Internal Notes</h3></div>
            <div className="bg-zinc-50 p-3 rounded-md text-sm text-zinc-700 min-h-[80px] border border-zinc-100">
              {creator.notes || 'No internal notes saved.'}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Existing Core Info */}
            <div className="space-y-2"><Label>Name *</Label><Input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Social Handle</Label><Input value={formData.social_handles || ''} onChange={e => setFormData({...formData, social_handles: e.target.value})} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={formData.phone_number || ''} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            
            {/* Missing Info added back */}
            <div className="space-y-2"><Label>Niche</Label><Input value={formData.niche_category || ''} onChange={e => setFormData({...formData, niche_category: e.target.value})} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            <div className="space-y-2"><Label>Primary Language</Label><Input value={formData.language || ''} onChange={e => setFormData({...formData, language: e.target.value})} /></div>
            <div className="space-y-2"><Label>Manager Details</Label><Input value={formData.manager_details || ''} onChange={e => setFormData({...formData, manager_details: e.target.value})} /></div>
            
            {/* Metrics & Pricing */}
            <div className="space-y-2"><Label>Followers</Label><Input type="number" value={formData.follower_count || ''} onChange={e => setFormData({...formData, follower_count: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label>Eng. Rate (%)</Label><Input type="number" step="0.1" value={formData.engagement_rate || ''} onChange={e => setFormData({...formData, engagement_rate: e.target.value})} /></div>
              <div className="space-y-2"><Label>Pricing (₹)</Label><Input type="number" value={formData.pricing || ''} onChange={e => setFormData({...formData, pricing: e.target.value})} /></div>
            </div>
            
          </div>

          {/* Full Width Elements */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea 
              className="w-full border border-zinc-200 rounded-md p-3 text-sm focus:ring-zinc-900 outline-none resize-none h-20" 
              placeholder="Past performance, address, brand preferences..."
              value={formData.notes || ''} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
            />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="gst_status" 
              className="rounded border-zinc-300 w-4 h-4 text-zinc-900"
              checked={formData.gst_status || false} 
              onChange={e => setFormData({...formData, gst_status: e.target.checked})} 
            />
            <Label htmlFor="gst_status" className="font-normal cursor-pointer">Creator is GST Registered</Label>
          </div>

          <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
            Save Changes
          </Button>
        </form>
      )}
    </div>
  );
}