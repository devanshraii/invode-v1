'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';
import { Button } from '@/components/ui/button';

const PIPELINE_STAGES = [
  'Shortlisted', 'Reached Out', 'Negotiating', 'Contract Signed',
  'Product Sent', 'Content Drafted', 'Content Approved', 'Posted', 'Completed'
];

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // --- STATE ---
  const [campaign, setCampaign] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [availableCreators, setAvailableCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boardError, setBoardError] = useState('');
  
  // Drag & Drop State
  const [draggedRecordId, setDraggedRecordId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState('');
  const [contentForm, setContentForm] = useState({ drive_link: '', caption: '', deliverable_type: 'Video Draft' });
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
      fetchPipeline();
      fetchAvailableCreators();
    }
  }, [campaignId]);

  // --- FETCHERS (Securely stamped with userId) ---
  const fetchCampaignDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/campaigns?id=${campaignId}&userId=${userId}`);
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/campaign-creators?campaignId=${campaignId}&userId=${userId}`);
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/creators?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableCreators(data.creators || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLERS ---
  const handleAddCreator = async () => {
    if (!selectedCreatorId) return;
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
    }
  };

  const handleStatusChange = async (recordId: string, newStatus: string) => {
    // Optimistic UI update for instant feedback
    setPipeline(pipeline.map(p => p.id === recordId ? { ...p, status: newStatus } : p));
    
    try {
      await fetch('/api/campaign-creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchPipeline(); // Revert on failure
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContent(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_creator_id: activeRecordId,
          drive_link: contentForm.drive_link,
          caption: contentForm.caption,
          deliverable_type: contentForm.deliverable_type,
          user_id: userId
        }),
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

  const handleDeleteCampaign = async () => {
    if (!window.confirm('Delete this campaign and all its pipeline data? This cannot be undone.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const res = await fetch(`/api/campaigns?id=${campaignId}&userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      window.location.href = '/dashboard/campaigns'; 
    } catch (err) {
      alert('Error deleting campaign');
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, recordId: string) => {
    setDraggedRecordId(recordId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedRecordId(null);
    if (e.target instanceof HTMLElement) e.target.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedRecordId) {
      handleStatusChange(draggedRecordId, newStatus);
      setDraggedRecordId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-zinc-500 font-medium">Loading workspace...</div>;
  if (!campaign) return <div className="p-8 text-red-500 font-medium">Campaign not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 shrink-0">
        <div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            {campaign.brand_name || 'Brand Campaign'}
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{campaign.name}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-500">
            <span>Budget: ₹{(campaign.budget || 0).toLocaleString()}</span>
            <span>•</span>
            <span className={`font-medium ${campaign.status === 'Active' ? 'text-green-600' : 'text-zinc-500'}`}>
              {campaign.status}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteCampaign}>
            Delete Campaign
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800">
            + Add Creator
          </Button>
        </div>
      </div>

      {boardError && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{boardError}</div>}

      {/* --- KANBAN BOARD --- */}
      <div className="mt-6 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h2 className="text-lg font-bold text-zinc-800 tracking-tight">Pipeline Workspace</h2>
          <div className="text-xs text-zinc-500 flex items-center gap-2 font-medium bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Drag and drop cards to update status
          </div>
        </div>

        {/* Scrollable Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 -mx-4 px-4 sm:-mx-8 sm:px-8 snap-x">
          <div className="flex gap-4 h-full min-h-[500px]">
            
            {PIPELINE_STAGES.map((stage) => {
              const stageRecords = pipeline.filter(p => p.status === stage);
              const isCompletionStage = stage === 'Completed' || stage === 'Posted';
              const isActionStage = stage === 'Content Drafted' || stage === 'Product Sent';
              
              return (
                <div 
                  key={stage}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`min-w-[320px] max-w-[320px] flex flex-col rounded-xl border snap-center transition-all h-full
                    ${draggedRecordId ? 'border-dashed border-zinc-300 bg-zinc-50/80' : 'border-zinc-200 bg-zinc-50/50'}
                  `}
                >
                  {/* Column Header with Counter */}
                  <div className="p-3.5 border-b border-zinc-200/60 flex items-center justify-between sticky top-0 bg-zinc-100/80 backdrop-blur-md rounded-t-xl z-10">
                    <h3 className="font-semibold text-zinc-800 text-sm tracking-tight">{stage}</h3>
                    <span className="bg-white border border-zinc-200 text-zinc-600 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      {stageRecords.length}
                    </span>
                  </div>

                  {/* Column Drop Zone */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {stageRecords.map((record) => (
                      <div 
                        key={record.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, record.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white p-4 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group border-l-4
                          ${isCompletionStage ? 'border-l-green-500' : isActionStage ? 'border-l-amber-400' : 'border-l-blue-500'}
                        `}
                      >
                        <div className="absolute top-3 right-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                        </div>

                        <div className="font-bold text-zinc-900 mb-1 pr-6 truncate">
                          {record.creators?.name || 'Unknown Creator'}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                          <span className="truncate">{record.creators?.niche_category || 'General'}</span>
                          <span className="font-medium text-zinc-700">₹{(record.creators?.pricing || 0).toLocaleString()}</span>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                          <select 
                            className="text-[11px] font-medium bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 text-zinc-600 outline-none cursor-pointer hover:bg-zinc-100 transition-colors"
                            value={record.status}
                            onChange={(e) => handleStatusChange(record.id, e.target.value)}
                          >
                            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            
                          </select>

                          {(stage === 'Product Sent' || stage === 'Content Drafted') && (
                            <Button 
                              size="sm" 
                              onClick={() => { setActiveRecordId(record.id); setIsSubmitModalOpen(true); }}
                              className="h-7 text-[10px] px-2.5 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm rounded-md"
                            >
                              Submit Content
                            </Button>
                          )}
                          
                        </div>
                      </div>
                    ))}

                    {stageRecords.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-xs text-zinc-400 font-medium bg-zinc-50/50">
                        Drop creator here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="w-1 sm:w-4 shrink-0"></div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* Add Creator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-zinc-200">
            <h2 className="text-xl font-bold mb-4 text-zinc-900">Add Creator to Pipeline</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Select from CRM</label>
                <select 
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                >
                  <option value="" disabled>Select a creator...</option>
                  {availableCreators.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.niche_category}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-2">
                <Button onClick={handleAddCreator} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">Add to Shortlist</Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Content Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-zinc-200">
            <h2 className="text-xl font-bold mb-4 text-zinc-900">Submit Content for Approval</h2>
            <form onSubmit={handleContentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Type</label>
                <select 
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm outline-none"
                  value={contentForm.deliverable_type}
                  onChange={e => setContentForm({...contentForm, deliverable_type: e.target.value})}
                >
                  <option>Video Draft</option>
                  <option>Static Post</option>
                  <option>Story Storyboard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Google Drive / Asset Link *</label>
                <input 
                  required type="url" 
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="https://drive.google.com/..."
                  value={contentForm.drive_link}
                  onChange={e => setContentForm({...contentForm, drive_link: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Caption / Notes</label>
                <textarea 
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm outline-none h-24 resize-none"
                  placeholder="Paste drafted caption here..."
                  value={contentForm.caption}
                  onChange={e => setContentForm({...contentForm, caption: e.target.value})}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button type="submit" disabled={isSubmittingContent} className="flex-1 bg-zinc-900 text-white">
                  {isSubmittingContent ? 'Sending...' : 'Send to Brand'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}