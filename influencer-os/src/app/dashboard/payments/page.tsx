'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/library/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState({
    campaign_id: '',
    creator_id: '',
    amount: '',
    due_date: '',
    notes: ''
  });

  // --- Searchable Dropdown States ---
  const [campaignSearch, setCampaignSearch] = useState('');
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  
  const [creatorSearch, setCreatorSearch] = useState('');
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const [payRes, campRes, createRes] = await Promise.all([
        fetch(`/api/payments?userId=${userId}`),
        fetch(`/api/campaigns?userId=${userId}`),
        fetch(`/api/creators?userId=${userId}`)
      ]);

      if (payRes.ok) setPayments((await payRes.json()).payments || []);
      if (campRes.ok) setCampaigns((await campRes.json()).campaigns || []);
      if (createRes.ok) setCreators((await createRes.json()).creators || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check ensuring they actually clicked an option, not just typed text
    if (!formData.campaign_id || !formData.creator_id) {
      alert('Please select a valid Campaign and Creator from the dropdown list.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: userId }),
      });

      if (!res.ok) throw new Error('Failed to log payment');
      
      // Reset everything
      setFormData({ campaign_id: '', creator_id: '', amount: '', due_date: '', notes: '' });
      setCampaignSearch('');
      setCreatorSearch('');
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert('Error logging payment');
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Paid', user_id: userId }),
      });
      fetchData();
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  // --- Filtering Logic ---
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const filteredCreators = creators.filter(c => {
    const search = creatorSearch.toLowerCase();
    return c.name?.toLowerCase().includes(search) || c.niche_category?.toLowerCase().includes(search);
  });

  // Calculate Metrics
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) return <div className="p-8 text-zinc-500">Loading financial ledger...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Payments & Ledger</h1>
          <p className="text-sm text-zinc-500">Track pending fees and completed payouts.</p>
        </div>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          setCampaignSearch('');
          setCreatorSearch('');
          setFormData({ campaign_id: '', creator_id: '', amount: '', due_date: '', notes: '' });
        }}>
          {isAdding ? 'Cancel' : '+ Log Payment'}
        </Button>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Outstanding (Pending)</div>
          <div className="text-3xl font-bold text-amber-600">₹{totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Disbursed (Paid)</div>
          <div className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
        </div>
      </div>

      {/* Add Payment Modal/Form */}
      {isAdding && (
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Log New Pending Payment</h2>
          <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Custom Searchable Campaign Dropdown */}
            <div className="space-y-2 relative">
              <Label>Campaign *</Label>
              <Input 
                required={!formData.campaign_id}
                placeholder="Search campaign..."
                value={campaignSearch}
                onChange={(e) => {
                  setCampaignSearch(e.target.value);
                  setShowCampaignDropdown(true);
                  if (formData.campaign_id) setFormData({...formData, campaign_id: ''}); // Clear actual selection if they type
                }}
                onFocus={() => setShowCampaignDropdown(true)}
                onBlur={() => setTimeout(() => setShowCampaignDropdown(false), 200)} // Delay hides so onMouseDown can fire
              />
              {showCampaignDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCampaigns.length === 0 ? (
                    <div className="p-3 text-sm text-zinc-500">No campaigns found.</div>
                  ) : (
                    filteredCampaigns.map(c => (
                      <div 
                        key={c.id}
                        onMouseDown={() => {
                          setFormData({...formData, campaign_id: c.id});
                          setCampaignSearch(c.name);
                          setShowCampaignDropdown(false);
                        }}
                        className="p-3 text-sm hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-0"
                      >
                        {c.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Custom Searchable Creator Dropdown */}
            <div className="space-y-2 relative">
              <Label>Creator *</Label>
              <Input 
                required={!formData.creator_id}
                placeholder="Search creator by name or niche..."
                value={creatorSearch}
                onChange={(e) => {
                  setCreatorSearch(e.target.value);
                  setShowCreatorDropdown(true);
                  if (formData.creator_id) setFormData({...formData, creator_id: ''}); 
                }}
                onFocus={() => setShowCreatorDropdown(true)}
                onBlur={() => setTimeout(() => setShowCreatorDropdown(false), 200)}
              />
              {showCreatorDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCreators.length === 0 ? (
                    <div className="p-3 text-sm text-zinc-500">No creators found.</div>
                  ) : (
                    filteredCreators.map(c => (
                      <div 
                        key={c.id}
                        onMouseDown={() => {
                          setFormData({...formData, creator_id: c.id});
                          setCreatorSearch(c.name);
                          setShowCreatorDropdown(false);
                        }}
                        className="p-3 text-sm hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-0 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-zinc-900">{c.name}</div>
                          <div className="text-xs text-zinc-500">{c.niche_category || 'General'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="e.g. 15000" />
            </div>
            
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label>Internal Notes</Label>
              <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. 50% Advance for Diwali Video" />
            </div>
            
            <div className="md:col-span-2 pt-2">
              <Button type="submit">Save to Ledger</Button>
            </div>
          </form>
        </div>
      )}

      {/* Payments Ledger Table */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500">No payments logged yet.</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{payment.creators?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{payment.campaigns?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900">₹{Number(payment.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${payment.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/dashboard/payments/${payment.id}/invoice`)}
                      className="h-8 text-xs hover:bg-zinc-100"
                    >
                      📄 Document
                    </Button>

                    {payment.status === 'Pending' ? (
                      <Button variant="outline" size="sm" onClick={() => markAsPaid(payment.id)} className="h-8 text-xs bg-zinc-900 text-white hover:bg-zinc-800">
                        Mark as Paid
                      </Button>
                    ) : (
                      <span className="text-zinc-400 inline-block w-20 text-center">Completed</span>
                    )}
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