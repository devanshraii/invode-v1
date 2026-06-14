'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/library/supabase';

type Campaign = { id: string; name: string; budget: number; status: string; };
type Payment = { id: string; amount: number; status: string; campaign_id: string; };

export default function ReportsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW: Filter States ---
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const financialRes = await fetch(`/api/reports${userId ? `?userId=${userId}` : ''}`);
      if (!financialRes.ok) throw new Error('Failed to load financial analytics');
      const finData = await financialRes.json();
      
      setCampaigns(finData.campaigns || []);
      setPayments(finData.payments || []);

      const { data: metricsData, error: metricsError } = await supabase
        .from('campaign_creators')
        .select(`
          id, status, views, likes, comments,
          campaigns ( name, budget ),
          creators ( name, pricing )
        `);

      if (metricsError) console.error("Supabase Join Error:", metricsError);
      else setDeliverables(metricsData || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalChange = (id: string, field: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setDeliverables(deliverables.map(d => d.id === id ? { ...d, [field]: numValue } : d));
  };

  const saveMetricToDatabase = async (id: string, field: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    try {
      await fetch('/api/campaign-creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: numValue }),
      });
    } catch (err) {
      console.error('Failed to save metric to DB');
    }
  };

  if (isLoading) return <div className="p-8 text-zinc-500 font-medium tracking-tight">Compiling agency analytics...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  // --- FINANCIAL CALCULATIONS (Global) ---
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAllocated = totalPaid + totalPending;
  const budgetRemaining = Math.max(0, totalBudget - totalAllocated);
  const utilizationPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalAllocated / totalBudget) * 100)) : 0;

  // --- FILTER LOGIC ---
  const uniqueCampaigns = Array.from(new Set(deliverables.map(d => d.campaigns?.name).filter(Boolean)));

  const filteredDeliverables = deliverables.filter(item => {
    const matchesCampaign = selectedCampaignFilter === 'All' || item.campaigns?.name === selectedCampaignFilter;
    const isLive = item.status === 'Posted' || item.status === 'Completed';
    const matchesStatus = selectedStatusFilter === 'All' 
      || (selectedStatusFilter === 'Live' && isLive)
      || (selectedStatusFilter === 'Projections' && !isLive);

    return matchesCampaign && matchesStatus;
  });

  // --- DYNAMIC PERFORMANCE CALCULATIONS (Based on Filters) ---
  const totalPerformanceSpend = filteredDeliverables.reduce((sum, d) => sum + (d.creators?.pricing || 0), 0);
  const totalViews = filteredDeliverables.reduce((sum, d) => sum + (d.views || 0), 0);
  const totalEngagements = filteredDeliverables.reduce((sum, d) => sum + (d.likes || 0) + (d.comments || 0), 0);
  
  const avgCPM = totalViews > 0 ? ((totalPerformanceSpend / totalViews) * 1000).toFixed(2) : '0.00';
  const avgER = totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-12 pb-12">
      
      {/* =========================================
          SECTION 1: FINANCIAL REPORTS 
          ========================================= */}
      <section className="space-y-6">
        <div className="border-b border-zinc-200 pb-4">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Financial Ledger</h1>
          <p className="text-sm text-zinc-500">Real-time overview of your agency's cash flow and campaign health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
            <div className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Total Managed Budget</div>
            <div className="text-2xl font-black text-zinc-900">₹{totalBudget.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm border-l-4 border-l-green-500">
            <div className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Total Paid Out</div>
            <div className="text-2xl font-black text-green-600">₹{totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm border-l-4 border-l-amber-500">
            <div className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Total Pending Liability</div>
            <div className="text-2xl font-black text-amber-600">₹{totalPending.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
            <div className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Active Campaigns</div>
            <div className="text-2xl font-black text-zinc-900">{activeCampaigns} <span className="text-sm font-medium text-zinc-400">/ {totalCampaigns} total</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">Overall Budget Utilization</h3>
            
            <div className="w-full h-8 bg-zinc-100 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0}%` }} className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500">
                {totalPaid > 0 && `${Math.round((totalPaid / totalBudget) * 100)}%`}
              </div>
              <div style={{ width: `${totalBudget > 0 ? (totalPending / totalBudget) * 100 : 0}%` }} className="bg-amber-400 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500">
                {totalPending > 0 && `${Math.round((totalPending / totalBudget) * 100)}%`}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between mt-4 text-sm font-medium text-zinc-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></span> Disbursed</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-amber-400 rounded-full mr-2 shadow-sm"></span> Pending</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-zinc-200 rounded-full mr-2 shadow-sm"></span> Unallocated (₹{budgetRemaining.toLocaleString()})</div>
              </div>
              <div className="font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-md">
                {utilizationPercentage}% Utilized
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 shrink-0 tracking-tight">Campaign Level P&L</h3>
            <div className="overflow-x-auto overflow-y-auto max-h-[200px]">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-white sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Budget</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Spend</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {campaigns.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-sm text-zinc-500">No campaigns available.</td></tr>
                  ) : (
                    campaigns.map(campaign => {
                      const campaignPayments = payments.filter(p => p.campaign_id === campaign.id);
                      const campaignSpend = campaignPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                      const margin = (campaign.budget || 0) - campaignSpend;
                      const isOverBudget = margin < 0;

                      return (
                        <tr key={campaign.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-zinc-900 text-sm">{campaign.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-zinc-600">₹{(campaign.budget || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-zinc-600">₹{campaignSpend.toLocaleString()}</td>
                          <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-bold ${isOverBudget ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                            {isOverBudget ? '-' : '+'}₹{Math.abs(margin).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 2: PERFORMANCE ANALYTICS
          ========================================= */}
      <section className="space-y-6 pt-8 border-t border-zinc-200">
        <div className="pb-2">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Campaign Performance & ROI</h2>
          <p className="text-sm text-zinc-500 mt-1">Metrics calculate dynamically based on the filters selected below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm transition-all duration-300">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Views Generated</div>
            <div className="text-3xl font-black text-blue-600">{totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm transition-all duration-300">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Engagements</div>
            <div className="text-3xl font-black text-amber-500">{totalEngagements.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md transition-all duration-300">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Avg. Segment ER</div>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              {avgER}<span className="text-lg text-zinc-400 font-medium">%</span>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md transition-all duration-300">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Avg. Segment CPM</div>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span className="text-lg text-zinc-400 font-medium">₹</span>{avgCPM}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* --- NEW: INTERACTIVE FILTER BAR --- */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Deliverable Metric Tracker</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Click any number to update. Saves automatically on blur.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select 
                className="flex-1 sm:flex-none text-sm font-medium bg-white border border-zinc-300 text-zinc-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm"
                value={selectedCampaignFilter}
                onChange={(e) => setSelectedCampaignFilter(e.target.value)}
              >
                <option value="All">All Campaigns</option>
                {uniqueCampaigns.map(camp => (
                  <option key={camp as string} value={camp as string}>{camp}</option>
                ))}
              </select>

              <select 
                className="flex-1 sm:flex-none text-sm font-medium bg-white border border-zinc-300 text-zinc-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Live">🟢 Live (Posted)</option>
                <option value="Projections">⚪ Projections (Pipeline)</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-white">Creator & Campaign</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-white">Post Cost</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-blue-500 uppercase tracking-wider bg-white">Total Views</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-amber-500 uppercase tracking-wider bg-white">Total Likes</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-green-500 uppercase tracking-wider bg-white">Comments</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-white">Eng. Rate (ER)</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-white">Cost per 1k (CPM)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {filteredDeliverables.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-zinc-500">No data matches your current filters.</td></tr>
                ) : (
                  filteredDeliverables.map((item) => {
                    const cost = item.creators?.pricing || 0;
                    const views = item.views || 0;
                    const engagements = (item.likes || 0) + (item.comments || 0);
                    
                    const itemCpm = views > 0 ? ((cost / views) * 1000) : 0;
                    const itemER = views > 0 ? ((engagements / views) * 100) : 0;
                    
                    const isLive = item.status === 'Posted' || item.status === 'Completed';
                    const isGoodER = itemER > 3.0; 
                    const isBadCPM = itemCpm > 500 && views > 100;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            {item.creators?.name || 'Unknown'}
                            {!isLive && <span className="text-[9px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Proj</span>}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1 truncate max-w-[200px] font-medium">{item.campaigns?.name || 'Unassigned Campaign'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-700">
                          ₹{cost.toLocaleString()}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            value={item.views || ''}
                            placeholder="0"
                            onChange={(e) => handleLocalChange(item.id, 'views', e.target.value)}
                            onBlur={(e) => saveMetricToDatabase(item.id, 'views', e.target.value)}
                            className="w-24 bg-zinc-100 border border-transparent focus:bg-white focus:border-blue-400 rounded-md px-3 py-1.5 outline-none text-sm font-bold text-zinc-900 transition-all shadow-sm hover:border-zinc-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            value={item.likes || ''}
                            placeholder="0"
                            onChange={(e) => handleLocalChange(item.id, 'likes', e.target.value)}
                            onBlur={(e) => saveMetricToDatabase(item.id, 'likes', e.target.value)}
                            className="w-24 bg-zinc-100 border border-transparent focus:bg-white focus:border-amber-400 rounded-md px-3 py-1.5 outline-none text-sm font-bold text-zinc-900 transition-all shadow-sm hover:border-zinc-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            value={item.comments || ''}
                            placeholder="0"
                            onChange={(e) => handleLocalChange(item.id, 'comments', e.target.value)}
                            onBlur={(e) => saveMetricToDatabase(item.id, 'comments', e.target.value)}
                            className="w-24 bg-zinc-100 border border-transparent focus:bg-white focus:border-green-400 rounded-md px-3 py-1.5 outline-none text-sm font-bold text-zinc-900 transition-all shadow-sm hover:border-zinc-300"
                          />
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-black px-2.5 py-1 rounded-md inline-block ${isGoodER ? 'bg-green-100 text-green-700' : 'text-zinc-800'}`}>
                            {itemER.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-black px-2.5 py-1 rounded-md inline-block ${isBadCPM ? 'bg-red-100 text-red-700' : 'text-zinc-800'}`}>
                            ₹{itemCpm.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}