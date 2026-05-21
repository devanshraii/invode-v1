'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ApprovalItem = {
  id: string;
  deliverable_type: string;
  asset_url: string; 
  caption: string;
  status: string;
  campaign_creators: {
    creators: { name: string; phone_number: string };
    campaigns: { name: string };
  };
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      if (!res.ok) throw new Error('Failed to fetch approvals queue');
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setApprovals(approvals.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));

    try {
      await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchApprovals(); // Revert on failure
    }
  };

  // WhatsApp Integration Logic
  const openWhatsApp = (phone: string, creatorName: string, campaignName: string, status: string) => {
    if (!phone) {
      alert("No phone number saved for this creator in the CRM.");
      return;
    }
    
    // Clean phone number (remove spaces, ensure country code)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone; // Default to India if no country code

    let message = '';
    if (status === 'Approved') {
      message = `Hi ${creatorName}, great news! Your content for the ${campaignName} campaign has been approved. 🚀`;
    } else {
      message = `Hi ${creatorName}, we reviewed the draft for ${campaignName}. We need a few quick tweaks. Let me know when you're free to chat!`;
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    if (status === 'Approved') return 'bg-green-100 text-green-700';
    if (status === 'Changes Requested') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  if (isLoading) return <div className="p-8 text-zinc-500">Loading approval queue...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Content Approvals</h1>
        <p className="text-sm text-zinc-500">Fast tracking and WhatsApp notifications.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {approvals.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-zinc-200 rounded-lg text-zinc-500">
            No content pending review.
          </div>
        ) : (
          approvals.map((item) => {
            const creator = item.campaign_creators?.creators;
            const campaign = item.campaign_creators?.campaigns;

            return (
              <div key={item.id} className="border border-zinc-200 rounded-lg p-5 bg-white shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-zinc-900">{creator?.name || 'Unknown'}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{campaign?.name} • {item.deliverable_type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="bg-blue-50 rounded-md p-3 w-full flex items-center justify-between mb-4 border border-blue-100">
                  <span className="text-sm font-medium text-blue-800">Deliverable Asset</span>
                  {item.asset_url ? (
                    <a href={item.asset_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline font-medium">
                      View Link ↗
                    </a>
                  ) : (
                    <span className="text-zinc-400 text-sm">No link provided</span>
                  )}
                </div>

                <div className="bg-zinc-50 p-3 rounded-md border border-zinc-100 mb-4 text-sm text-zinc-700">
                  <strong className="text-zinc-900 block mb-1">Caption:</strong>
                  {item.caption || 'No caption provided.'}
                </div>

                {/* Tracking & WhatsApp Workflow */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-zinc-100">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:bg-red-50 border-red-200 h-8 text-xs"
                      onClick={() => handleUpdateStatus(item.id, 'Changes Requested')}
                      disabled={item.status === 'Changes Requested'}
                    >
                      Set Status: Changes
                    </Button>
                    <button 
                      onClick={() => openWhatsApp(creator.phone_number, creator.name, campaign.name, 'Changes Requested')}
                      className="w-full bg-[#25D366] text-white rounded-md h-8 text-xs font-medium hover:bg-[#1ebe57] transition-colors flex items-center justify-center gap-1"
                    >
                      WhatsApp: Ask for Tweaks
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-8 text-xs"
                      onClick={() => handleUpdateStatus(item.id, 'Approved')}
                      disabled={item.status === 'Approved'}
                    >
                      Set Status: Approved
                    </Button>
                    <button 
                      onClick={() => openWhatsApp(creator.phone_number, creator.name, campaign.name, 'Approved')}
                      className="w-full bg-[#25D366] text-white rounded-md h-8 text-xs font-medium hover:bg-[#1ebe57] transition-colors flex items-center justify-center gap-1"
                    >
                      WhatsApp: Send Approval
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}