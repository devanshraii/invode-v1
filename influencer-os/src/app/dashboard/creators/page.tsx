'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/library/supabase';

export default function CreatorsPage() {
  const router = useRouter();
  
  // Data and UI State
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Form state for adding a new creator
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

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/creators?userId=${userId}`);
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const payload = {
        ...formData,
        social_handles: formData.social_handles ? { primary: formData.social_handles } : null,
        follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
        engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
        pricing: formData.pricing ? parseFloat(formData.pricing) : null,
        user_id: userId
      };

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
      fetchCreators(); // Refresh list after adding
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- Dynamic Filter Logic ---

  // 1. Extract unique tags for dropdowns
  const uniqueNiches = useMemo(() => {
    const niches = creators.map(c => c.niche_category).filter(Boolean);
    return Array.from(new Set(niches)).sort();
  }, [creators]);

  const uniqueCities = useMemo(() => {
    const cities = creators.map(c => c.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [creators]);

  // 2. Apply all active filters to the creator list
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      // Safely check search term against name and handles (handles might be a string or an object)
      const handleString = typeof creator.social_handles === 'string' 
        ? creator.social_handles 
        : creator.social_handles?.primary || '';
        
      const matchesSearch = 
        creator.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        handleString.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNiche = selectedNiche === '' || creator.niche_category === selectedNiche;
      const matchesCity = selectedCity === '' || creator.city === selectedCity;
      const matchesPrice = maxPrice === '' || (creator.pricing && creator.pricing <= Number(maxPrice));

      return matchesSearch && matchesNiche && matchesCity && matchesPrice;
    });
  }, [creators, searchTerm, selectedNiche, selectedCity, maxPrice]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Creator CRM</h1>
          <p className="text-sm text-zinc-500">Manage your entire influencer network.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add Creator'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Add Creator Form */}
      {isAdding && (
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-medium mb-4 text-zinc-900">Add New Creator</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name *</Label><Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Primary Handle</Label><Input placeholder="@username" value={formData.social_handles} onChange={e => setFormData({...formData, social_handles: e.target.value})} /></div>
            
            <div className="space-y-2"><Label>Phone Number</Label><Input type="tel" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            
            <div className="space-y-2"><Label>Niche Category</Label><Input placeholder="e.g. Tech, Beauty" value={formData.niche_category} onChange={e => setFormData({...formData, niche_category: e.target.value})} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            
            <div className="space-y-2"><Label>Primary Language</Label><Input placeholder="e.g. Hindi, English" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} /></div>
            <div className="space-y-2"><Label>Manager Details</Label><Input placeholder="Name / Contact info" value={formData.manager_details} onChange={e => setFormData({...formData, manager_details: e.target.value})} /></div>

            <div className="space-y-2"><Label>Followers</Label><Input type="number" value={formData.follower_count} onChange={e => setFormData({...formData, follower_count: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label>Eng. Rate (%)</Label><Input type="number" step="0.1" placeholder="4.5" value={formData.engagement_rate} onChange={e => setFormData({...formData, engagement_rate: e.target.value})} /></div>
              <div className="space-y-2"><Label>Pricing (₹)</Label><Input type="number" value={formData.pricing} onChange={e => setFormData({...formData, pricing: e.target.value})} /></div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Internal Notes</Label>
              <textarea 
                className="w-full border border-zinc-200 rounded-md p-3 text-sm focus:ring-zinc-900 outline-none resize-none h-20" 
                placeholder="Past performance, address, brand preferences..."
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2 pt-2 pb-4">
              <input 
                type="checkbox" 
                id="gst_status" 
                className="rounded border-zinc-300 w-4 h-4 text-zinc-900"
                checked={formData.gst_status} 
                onChange={e => setFormData({...formData, gst_status: e.target.checked})} 
              />
              <Label htmlFor="gst_status" className="font-normal cursor-pointer">Creator is GST Registered</Label>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-zinc-100 flex gap-3">
              <Button type="submit" className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800">Save Creator to CRM</Button>
            </div>
          </form>
        </div>
      )}

      {/* The Filter Bar */}
      {!isAdding && creators.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1 block">Search</Label>
            <Input 
              placeholder="Search by name or handle..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="w-full md:w-48">
            <Label className="text-xs text-zinc-500 mb-1 block">Niche</Label>
            <select 
              className="w-full h-9 border border-zinc-200 rounded-md px-3 text-sm focus:ring-zinc-900 focus:border-zinc-900"
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
            >
              <option value="">All Niches</option>
              {uniqueNiches.map(niche => (
                <option key={niche as string} value={niche as string}>{niche as string}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <Label className="text-xs text-zinc-500 mb-1 block">Location</Label>
            <select 
              className="w-full h-9 border border-zinc-200 rounded-md px-3 text-sm focus:ring-zinc-900 focus:border-zinc-900"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city as string} value={city as string}>{city as string}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <Label className="text-xs text-zinc-500 mb-1 block">Max Budget (₹)</Label>
            <Input 
              type="number" 
              placeholder="Any price" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="h-9 text-sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedNiche('');
                setSelectedCity('');
                setMaxPrice('');
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* The Data Table */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Followers</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Est. Pricing</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">Loading creators...</td></tr>
            ) : filteredCreators.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">No creators found.</td></tr>
            ) : (
              filteredCreators.map((creator) => (
                <tr 
                  key={creator.id} 
                  onClick={() => router.push('/dashboard/creators/' + creator.id)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900">{creator.name}</div>
                    <div className="text-xs text-zinc-500">{creator.niche_category || 'No niche'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-900">{creator.phone_number || '-'}</div>
                    <div className="text-xs text-zinc-500">
                      {creator.social_handles?.primary ? creator.social_handles.primary : (typeof creator.social_handles === 'string' ? creator.social_handles : '-')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {creator.city || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 text-right">
                    {creator.follower_count ? creator.follower_count.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 text-right">
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