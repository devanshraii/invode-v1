'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/library/supabase';

type Campaign = { id: string; name: string; budget: number; status: string; };
type Payment = { id: string; amount: number; status: string; campaign_id: string; };

export default function ReportsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/reports?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to load analytics');
      
      const data = await res.json();
      setCampaigns(data.campaigns);
      setPayments(data.payments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-zinc-500">Compiling analytics...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  // --- Calculations ---
  
  // 1. Campaign Metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  
  // 2. Financial Metrics
  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount), 0);
  
  // 3. Budget Utilization
  const totalAllocated = totalPaid + totalPending;
  const budgetRemaining = Math.max(0, totalBudget - totalAllocated);
  const utilizationPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalAllocated / totalBudget) * 100)) : 0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Financial Reports & Analytics</h1>
        <p className="text-sm text-zinc-500">Real-time overview of your agency's cash flow and campaign health.</p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Managed Budget</div>
          <div className="text-2xl font-bold text-zinc-900">₹{totalBudget.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm border-l-4 border-l-green-500">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Paid Out</div>
          <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Pending Liability</div>
          <div className="text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Active Campaigns</div>
          <div className="text-2xl font-bold text-zinc-900">{activeCampaigns} <span className="text-sm font-normal text-zinc-400">/ {totalCampaigns} total</span></div>
        </div>
      </div>

      {/* Budget Utilization Visualizer */}
      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Overall Budget Utilization</h3>
        
        {/* Progress Bar Container */}
        <div className="w-full h-8 bg-zinc-100 rounded-full overflow-hidden flex shadow-inner">
          {/* Paid Segment */}
          <div 
            style={{ width: `${totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0}%` }} 
            className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500"
          >
            {totalPaid > 0 && `${Math.round((totalPaid / totalBudget) * 100)}%`}
          </div>
          {/* Pending Segment */}
          <div 
            style={{ width: `${totalBudget > 0 ? (totalPending / totalBudget) * 100 : 0}%` }} 
            className="bg-amber-400 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500"
          >
            {totalPending > 0 && `${Math.round((totalPending / totalBudget) * 100)}%`}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between mt-4 text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Disbursed</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-amber-400 rounded-full mr-2"></span> Locked/Pending</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-zinc-200 rounded-full mr-2"></span> Unallocated (₹{budgetRemaining.toLocaleString()})</div>
          </div>
          <div className="font-semibold text-zinc-700 mt-2 sm:mt-0">
            {utilizationPercentage}% Utilized
          </div>
        </div>
      </div>

      {/* Campaign Level Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Campaign Level P&L</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Campaign Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Total Spend</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {campaigns.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-center text-sm text-zinc-500">No campaigns available.</td></tr>
              ) : (
                campaigns.map(campaign => {
                  // Calculate spend specific to this campaign
                  const campaignPayments = payments.filter(p => p.campaign_id === campaign.id);
                  const campaignSpend = campaignPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                  const margin = (campaign.budget || 0) - campaignSpend;
                  const isOverBudget = margin < 0;

                  return (
                    <tr key={campaign.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-zinc-900">{campaign.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500">{campaign.status}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-zinc-900">₹{(campaign.budget || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-zinc-900">₹{campaignSpend.toLocaleString()}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
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
  );
}