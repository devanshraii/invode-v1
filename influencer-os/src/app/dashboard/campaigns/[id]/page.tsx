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
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boardError, setBoardError] = useState('');
  
  // Drag & Drop State
  const [draggedRecordId, setDraggedRecordId] = useState<string | null>(null);

  // Modal & Drawer States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creatorSearchTerm, setCreatorSearchTerm] = useState(''); 
  const [isActivitySidebarOpen, setIsActivitySidebarOpen] = useState(false);
  
  // Multi-Select State
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [isAddingCreators, setIsAddingCreators] = useState(false);
  
  // Brief & Content States
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [briefText, setBriefText] = useState('');
  const [isSavingBrief, setIsSavingBrief] = useState(false);
  
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
      fetchActivityLogs();
    }
  }, [campaignId]);

  // --- FETCHERS ---
  const fetchCampaignDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/campaigns?id=${campaignId}&userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch campaign details');
      const data = await res.json();
      setCampaign(data.campaign);
      setBriefText(data.campaign.brief || '');
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
      if (res.ok) setAvailableCreators((await res.json()).creators || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/activity?campaignId=${campaignId}&userId=${userId}`);
      if (res.ok) setActivityLogs((await res.json()).logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const logActivity = async (action_type: string, details: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, user_id: userId, action_type, details }),
      });
      fetchActivityLogs(); 
    } catch (err) {
      console.error('Failed to log activity', err);
    }
  };

  // --- HANDLERS ---
  const handleAddCreator = async () => {
    if (selectedCreatorIds.length === 0) return;
    setIsAddingCreators(true);

    try {
      await Promise.all(
        selectedCreatorIds.map(async (creatorId) => {
          const res = await fetch('/api/campaign-creators', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaignId, creator_id: creatorId }),
          });
          if (!res.ok) throw new Error('Failed to add creator');
          
          const creatorName = availableCreators.find(c => c.id === creatorId)?.name || 'A creator';
          await logActivity('Creator Added', `Added ${creatorName} to the Shortlist.`);
        })
      );

      setIsAddModalOpen(false);
      setSelectedCreatorIds([]);
      setCreatorSearchTerm(''); 
      fetchPipeline();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingCreators(false);
    }
  };

  const toggleCreatorSelection = (id: string) => {
    setSelectedCreatorIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // --- NEW: Remove Creator Handler ---
  const handleRemoveCreator = async (recordId: string) => {
    if (!window.confirm("Remove this creator from the pipeline?")) return;

    const recordToRemove = pipeline.find(p => p.id === recordId);
    const creatorName = recordToRemove?.creators?.name || 'Creator';

    // Optimistic UI update: instantly hide from the board
    setPipeline(pipeline.filter(p => p.id !== recordId));

    try {
      const res = await fetch(`/api/campaign-creators?id=${recordId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove creator');

      await logActivity('Creator Removed', `Removed ${creatorName} from the campaign.`);
    } catch (err) {
      console.error(err);
      fetchPipeline(); // Revert board if it fails
    }
  };

  const handleStatusChange = async (recordId: string, newStatus: string) => {
    const creatorRecord = pipeline.find(p => p.id === recordId);
    const creatorName = creatorRecord?.creators?.name || 'Unknown Creator';

    setPipeline(pipeline.map(p => p.id === recordId ? { ...p, status: newStatus } : p));
    
    try {
      await fetch('/api/campaign-creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, status: newStatus }),
      });

      await logActivity('Pipeline Movement', `Moved ${creatorName} to ${newStatus}.`);
    } catch (err) {
      console.error(err);
      fetchPipeline(); 
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
      
      const creatorName = pipeline.find(p => p.id === activeRecordId)?.creators?.name || 'Creator';
      await logActivity('Content Submitted', `Submitted a ${contentForm.deliverable_type} for ${creatorName}.`);

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

  const handleCampaignStatusChange = async (newStatus: string) => {
    setCampaign({ ...campaign, status: newStatus });
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await logActivity('Campaign Update', `Changed overall campaign status to ${newStatus}.`);
    } catch (err) {
      alert('Failed to update campaign status');
      fetchCampaignDetails(); 
    }
  };

  const handleSaveBrief = async () => {
    setIsSavingBrief(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, brief: briefText }),
      });
      if (!res.ok) throw new Error('Failed to update brief');
      
      setCampaign({ ...campaign, brief: briefText });
      setIsEditingBrief(false);
      await logActivity('Brief Updated', 'Updated the campaign brief and deliverables.');
    } catch (err) {
      alert('Failed to save brief');
    } finally {
      setIsSavingBrief(false);
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

  const filteredAvailableCreators = availableCreators.filter(c => {
    const isAlreadyInPipeline = pipeline.some(p => p.creators?.id === c.id);
    if (isAlreadyInPipeline) return false;

    const searchLower = creatorSearchTerm.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(searchLower);
    const nicheMatch = c.niche_category?.toLowerCase().includes(searchLower);
    return nameMatch || nicheMatch;
  });

  if (isLoading) return <div className="p-8 text-zinc-500 font-medium">Loading workspace...</div>;
  if (!campaign) return <div className="p-8 text-red-500 font-medium">Campaign not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 shrink-0 px-1">
        <div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            {campaign.client_brand || 'Brand Campaign'}
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{campaign.name}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-500">
            <span>Budget: ₹{(campaign.budget || 0).toLocaleString()}</span>
            <span>•</span>
            
            <select
              className={`font-medium outline-none cursor-pointer bg-transparent border-b border-dashed border-zinc-300 pb-0.5 hover:border-zinc-500 transition-colors appearance-none pr-4 relative
                ${campaign.status === 'Active' ? 'text-green-600' : 
                  campaign.status === 'Completed' ? 'text-blue-600' : 'text-zinc-500'}`}
              value={campaign.status}
              onChange={(e) => handleCampaignStatusChange(e.target.value)}
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
            >
              <option value="Draft" className="text-zinc-900">Draft</option>
              <option value="Active" className="text-zinc-900">Active</option>
              <option value="Paused" className="text-zinc-900">Paused</option>
              <option value="Completed" className="text-zinc-900">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => setIsBriefModalOpen(true)}
            className="text-zinc-600 hover:bg-zinc-100 flex items-center gap-2"
          >
            <span className="text-lg">📄</span>
            View Brief
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => setIsActivitySidebarOpen(true)}
            className="text-zinc-600 hover:bg-zinc-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Activity Logs
          </Button>
          
          <Button variant="outline" onClick={() => router.push(`/dashboard/campaigns/${campaignId}/edit`)} className="hover:bg-zinc-100 hidden sm:flex">
            ⚙️ Settings
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800">
            + Add Creators
          </Button>
        </div>
      </div>

      {boardError && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{boardError}</div>}

      {/* --- KANBAN BOARD --- */}
      <div className="mt-6 flex-1 overflow-hidden flex flex-col pb-4">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h2 className="text-lg font-bold text-zinc-800 tracking-tight">Pipeline Workspace</h2>
          <div className="text-xs text-zinc-500 flex items-center gap-2 font-medium bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Drag and drop cards to update status
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:-mx-8 sm:px-8 snap-x">
          <div className="flex gap-4 h-full">
            {PIPELINE_STAGES.map((stage) => {
              const stageRecords = pipeline.filter(p => p.status === stage);
              const isCompletionStage = stage === 'Completed' || stage === 'Posted';
              const isActionStage = stage === 'Content Drafted' || stage === 'Product Sent';
              
              return (
                <div 
                  key={stage}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`min-w-[320px] max-w-[320px] flex flex-col rounded-xl border snap-center transition-all h-full max-h-full overflow-hidden
                    ${draggedRecordId ? 'border-dashed border-zinc-300 bg-zinc-50/80' : 'border-zinc-200 bg-zinc-50/50'}
                  `}
                >
                  <div className="p-3.5 border-b border-zinc-200/60 flex items-center justify-between sticky top-0 bg-zinc-100/80 backdrop-blur-md rounded-t-xl z-10 shrink-0">
                    <h3 className="font-semibold text-zinc-800 text-sm tracking-tight">{stage}</h3>
                    <span className="bg-white border border-zinc-200 text-zinc-600 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      {stageRecords.length}
                    </span>
                  </div>

                  <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
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
                        {/* UPGRADED: Remove Button in Top Right */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRemoveCreator(record.id)}
                            className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 p-1 rounded-md transition-colors"
                            title="Remove from Campaign"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
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

      {/* --- SLIDE-OUT ACTIVITY SIDEBAR --- */}
      {isActivitySidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsActivitySidebarOpen(false)}></div>
      )}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isActivitySidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50 shrink-0">
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Activity & Audit Log
          </h2>
          <button onClick={() => setIsActivitySidebarOpen(false)} className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 p-1.5 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activityLogs.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-10">No activity recorded yet. Start managing your pipeline!</div>
          ) : (
            <div className="border-l-2 border-zinc-100 ml-2 pl-5 space-y-6">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 bg-zinc-400 rounded-full border-2 border-white"></div>
                  <div className="text-sm text-zinc-900 font-medium">{log.details}</div>
                  <div className="text-xs text-zinc-400 mt-1 font-medium flex gap-2 items-center">
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">{log.action_type}</span>
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Campaign Brief Modal */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Campaign Brief & Requirements</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Reference this document for deliverables, timelines, and talking points.</p>
              </div>
              <button onClick={() => setIsBriefModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 p-1.5 rounded-md transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
              {isEditingBrief ? (
                <textarea 
                  className="w-full h-full min-h-[300px] p-4 border border-zinc-300 rounded-lg text-sm text-zinc-800 leading-relaxed focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none resize-none font-mono"
                  placeholder="Paste your Google Doc links, Do's and Don'ts, Target Demographics, and required deliverables here..."
                  value={briefText}
                  onChange={(e) => setBriefText(e.target.value)}
                  autoFocus
                />
              ) : (
                <div className="prose prose-sm max-w-none text-zinc-700 whitespace-pre-wrap leading-relaxed">
                  {campaign?.brief ? campaign.brief : <span className="text-zinc-400 italic">No brief has been drafted for this campaign yet. Click 'Edit Document' below to start typing.</span>}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex justify-end space-x-3 shrink-0">
              {isEditingBrief ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditingBrief(false)}>Cancel</Button>
                  <Button onClick={handleSaveBrief} disabled={isSavingBrief} className="bg-zinc-900 text-white">
                    {isSavingBrief ? 'Saving...' : 'Save Document'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditingBrief(true)} className="bg-white">
                  ✏️ Edit Document
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Select Add Creator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-zinc-200 flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 shrink-0">Add Creators to Pipeline</h2>
            
            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              <div className="shrink-0">
                <input 
                  type="text"
                  placeholder="Search by name or niche..."
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                  value={creatorSearchTerm}
                  onChange={(e) => setCreatorSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-zinc-200 rounded-lg bg-zinc-50/50 min-h-[200px] max-h-[350px]">
                {filteredAvailableCreators.length === 0 ? (
                  <div className="p-6 text-center text-sm text-zinc-500">
                    {availableCreators.length === 0 ? "No creators in CRM." : "No matching creators available to add."}
                  </div>
                ) : (
                  filteredAvailableCreators.map(c => {
                    const isSelected = selectedCreatorIds.includes(c.id);
                    return (
                      <div 
                        key={c.id}
                        onClick={() => toggleCreatorSelection(c.id)}
                        className={`p-3 border-b border-zinc-100 last:border-0 cursor-pointer transition-all flex items-center gap-3
                          ${isSelected ? 'bg-zinc-50/80 border-l-4 border-l-zinc-900' : 'bg-white hover:bg-zinc-50 border-l-4 border-l-transparent'}
                        `}
                      >
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 pointer-events-none"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <div className={`font-medium text-sm ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                              {c.name}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              {c.niche_category || 'General'}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded">
                            ₹{(c.pricing || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex space-x-3 pt-2 shrink-0">
                <Button 
                  onClick={handleAddCreator} 
                  disabled={selectedCreatorIds.length === 0 || isAddingCreators}
                  className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isAddingCreators 
                    ? 'Adding...' 
                    : selectedCreatorIds.length > 0 
                      ? `Add ${selectedCreatorIds.length} to Shortlist` 
                      : 'Add to Shortlist'
                  }
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCreatorSearchTerm(''); 
                    setSelectedCreatorIds([]); 
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
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