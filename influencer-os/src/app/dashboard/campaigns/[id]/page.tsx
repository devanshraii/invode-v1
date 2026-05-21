'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PIPELINE_STAGES = ['Shortlisted', 'Reached Out', 'Negotiating', 'Contract Signed', 'Product Sent', 'Content Drafted', 'Content Approved', 'Posted', 'Completed'];

type Campaign = { id: string; name: string; client_brand: string; status: string; };
type PipelineRecord = { id: string; status: string; agreed_fee: number | null; creators: { id: string; name: string; niche_category: string; follower_count: number; }; };
type Creator = { id: string; name: string; niche_category: string; };

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  // State
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boardError, setBoardError] = useState('');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableCreators, setAvailableCreators] = useState<Creator[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [isAddingCreator, setIsAddingCreator] = useState(false);
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState('');
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);
  const [contentForm, setContentForm] = useState({ drive_link: '', caption: '', deliverable_type: 'Video Draft' });

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
      fetchPipeline();
      fetchAvailableCreators();
    }
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const res = await fetch(`/api/campaigns?id=${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch campaign details');
      const data = await res.json();
      setCampaign(data.campaign);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPipeline = async () => {
    try {
      setBoardError('');
      const res = await fetch(`/api/campaign-creators?campaignId=${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch pipeline');
      const data = await res.json();
      setPipeline(data.records || []);
    } catch (err: any) {
      setBoardError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableCreators = async () => {
    try {
      const res = await fetch('/api/creators');
      if (res.ok) {
        const data = await res.json();
        setAvailableCreators(data.creators || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Master Campaign Status Update
  const handleCampaignStatusChange = async (newStatus: string) => {
    if (!campaign) return;
    setCampaign({ ...campaign, status: newStatus }); // Optimistic UI
    try {
      await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update campaign status', err);
      fetchCampaignDetails(); // Revert on fail
    }
  };

  // Creator Pipeline Status Update
  const handleStatusChange = async (recordId: string, newStatus: string) => {
    setPipeline(pipeline.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
    try {
      await fetch('/api/campaign-creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, status: newStatus }),
      });
    } catch (err: any) {
      alert(err.message);
      fetchPipeline(); 
    }
  };

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) return;
    setIsAddingCreator(true);
    try {
      const res = await fetch('/api/campaign-creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, creator_id: selectedCreatorId }),
      });
      if (!res.ok) throw new Error('Failed to add creator');
      setIsAddModalOpen(false);
      setSelectedCreatorId('');
      fetchPipeline();
    } catch (err: any) {
      alert(err.message); 
    } finally {
      setIsAddingCreator(false);
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContent(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_creator_id: activeRecordId, drive_link: contentForm.drive_link, caption: contentForm.caption, deliverable_type: contentForm.deliverable_type }),
      });
      if (!res.ok) throw new Error('Failed to submit content');
      alert('Content sent to Approval Queue!');
      handleStatusChange(activeRecordId, 'Content Drafted');
      setIsSubmitModalOpen(false);
      setContentForm({ drive_link: '', caption: '', deliverable_type: 'Video Draft' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingContent(false);
    }
  };

  const getCreatorsByStatus = (status: string) => pipeline.filter(r => r.status === status);

  if (isLoading) return <div className="p-8 text-zinc-500">Loading campaign workspace...</div>;

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      
      {/* Dynamic Header with Master Status Dropdown */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{campaign?.name || 'Loading Campaign...'}</h1>
          <p className="text-sm text-zinc-500">
            {campaign?.client_brand ? `${campaign.client_brand} • ` : ''} Pipeline Workspace
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="border border-zinc-300 rounded-md py-1.5 px-3 text-sm focus:ring-zinc-900 font-medium bg-white text-zinc-700 shadow-sm"
            value={campaign?.status || 'Active'}
            onChange={(e) => handleCampaignStatusChange(e.target.value)}
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
          <Button onClick={() => setIsAddModalOpen(true)}>+ Add Creator</Button>
        </div>
      </div>

      {boardError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">Error: {boardError}</div>}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 flex-1 min-h-[600px] snap-x">
        {PIPELINE_STAGES.map((stage) => {
          const records = getCreatorsByStatus(stage);
          return (
            <div key={stage} className="bg-zinc-50 rounded-lg border border-zinc-200 p-3 min-w-[280px] max-w-[280px] shrink-0 flex flex-col snap-start">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-2">
                <h3 className="font-semibold text-sm text-zinc-800">{stage}</h3>
                <span className="bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full font-medium">{records.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {records.length === 0 ? (
                  <div className="text-xs text-zinc-400 text-center py-6 border-2 border-dashed border-zinc-200 rounded-md">Empty</div>
                ) : (
                  records.map(record => (
                    <div key={record.id} className="bg-white border border-zinc-200 rounded-md p-3 shadow-sm hover:border-zinc-300 transition-colors">
                      <div className="font-medium text-sm text-zinc-900">{record.creators.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{record.creators.niche_category || 'No niche'}</div>
                      <div className="mt-3">
                        <select
                          className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded p-1.5 text-zinc-700 focus:ring-zinc-900 focus:border-zinc-900"
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value)}
                        >
                          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {['Product Sent', 'Content Drafted'].includes(stage) && (
                        <div className="mt-2 pt-2 border-t border-zinc-100">
                          <button 
                            onClick={() => { setActiveRecordId(record.id); setIsSubmitModalOpen(true); }}
                            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs py-1.5 rounded font-medium transition-colors"
                          >
                            Submit Content Link
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Creator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">Add Creator to Pipeline</h2>
            <form onSubmit={handleAddCreator}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Select a Creator</label>
                <select className="w-full border border-zinc-300 rounded-md p-2 text-sm focus:ring-zinc-900 focus:border-zinc-900" value={selectedCreatorId} onChange={(e) => setSelectedCreatorId(e.target.value)} required>
                  <option value="" disabled>-- Choose from CRM --</option>
                  {availableCreators.map(creator => <option key={creator.id} value={creator.id}>{creator.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAddingCreator || !selectedCreatorId}>{isAddingCreator ? 'Adding...' : 'Add to Pipeline'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Content Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-1 text-zinc-900">Submit Content</h2>
            <form onSubmit={handleContentSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Deliverable Type</label>
                <select className="w-full border border-zinc-300 rounded-md p-2 text-sm focus:ring-zinc-900" value={contentForm.deliverable_type} onChange={(e) => setContentForm({...contentForm, deliverable_type: e.target.value})} required>
                  <option value="Video Draft">Video Draft</option>
                  <option value="Static Post">Static Post</option>
                  <option value="Story">Story</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Google Drive Link *</label>
                <input type="url" className="w-full border border-zinc-300 rounded-md p-2 text-sm focus:ring-zinc-900" placeholder="https://drive.google.com/..." value={contentForm.drive_link} onChange={(e) => setContentForm({...contentForm, drive_link: e.target.value})} required />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingContent || !contentForm.drive_link}>{isSubmittingContent ? 'Submitting...' : 'Send to Approvals'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}