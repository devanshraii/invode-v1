'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type PipelineRecord = {
  id: string;
  status: string;
  agreed_fee: number | null;
  creators: {
    id: string;
    name: string;
    niche_category: string;
    follower_count: number;
  };
};

export default function CampaignDetailPage() {
  // Using useParams hook safely avoids the Next.js async params error
  const params = useParams();
  const campaignId = params.id as string;

  const [pipeline, setPipeline] = useState<PipelineRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only attempt to fetch if the router has successfully extracted the ID
    if (campaignId) {
      fetchPipeline();
    }
  }, [campaignId]);

  const fetchPipeline = async () => {
    try {
      const res = await fetch(`/api/campaign-creators?campaignId=${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch pipeline');
      const data = await res.json();
      setPipeline(data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to filter creators by their current status
  const getCreatorsByStatus = (status: string) => {
    return pipeline.filter((record) => record.status === status);
  };

  // Helper component for a Creator Card
  const CreatorCard = ({ record }: { record: PipelineRecord }) => (
    <div className="bg-white border border-zinc-200 rounded-md p-3 mb-3 shadow-sm hover:border-zinc-300 transition-colors cursor-pointer">
      <div className="font-medium text-sm text-zinc-900">{record.creators.name}</div>
      <div className="text-xs text-zinc-500 mt-1">{record.creators.niche_category || 'No niche'}</div>
      {record.agreed_fee && (
        <div className="mt-2 text-xs font-semibold text-zinc-700 bg-zinc-100 inline-block px-2 py-1 rounded">
          Fee: ₹{record.agreed_fee.toLocaleString()}
        </div>
      )}
    </div>
  );

  if (isLoading) return <div className="p-8 text-zinc-500">Loading campaign workspace...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Campaign Operations</h1>
          <p className="text-sm text-zinc-500">Pipeline Workspace</p>
        </div>
        <Button>+ Add Creator to Pipeline</Button>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
        
        {/* Shortlisted Column */}
        <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-zinc-700">Shortlisted</h3>
            <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-1 rounded-full">
              {getCreatorsByStatus('Shortlisted').length}
            </span>
          </div>
          {getCreatorsByStatus('Shortlisted').map(record => (
            <CreatorCard key={record.id} record={record} />
          ))}
          {getCreatorsByStatus('Shortlisted').length === 0 && (
            <div className="text-sm text-zinc-400 text-center py-4 border-2 border-dashed border-zinc-200 rounded-md">Empty</div>
          )}
        </div>

        {/* Negotiating Column */}
        <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-blue-700">Negotiating</h3>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
               {getCreatorsByStatus('Negotiating').length}
            </span>
          </div>
          {getCreatorsByStatus('Negotiating').map(record => (
            <CreatorCard key={record.id} record={record} />
          ))}
           {getCreatorsByStatus('Negotiating').length === 0 && (
            <div className="text-sm text-zinc-400 text-center py-4 border-2 border-dashed border-zinc-200 rounded-md">Empty</div>
          )}
        </div>

        {/* Content Pending Column */}
        <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-amber-700">Content Pending</h3>
            <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full">
               {getCreatorsByStatus('Content Pending').length}
            </span>
          </div>
          {getCreatorsByStatus('Content Pending').map(record => (
            <CreatorCard key={record.id} record={record} />
          ))}
           {getCreatorsByStatus('Content Pending').length === 0 && (
            <div className="text-sm text-zinc-400 text-center py-4 border-2 border-dashed border-zinc-200 rounded-md">Empty</div>
          )}
        </div>

        {/* Completed Column */}
        <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-green-700">Completed</h3>
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
               {getCreatorsByStatus('Completed').length}
            </span>
          </div>
          {getCreatorsByStatus('Completed').map(record => (
            <CreatorCard key={record.id} record={record} />
          ))}
           {getCreatorsByStatus('Completed').length === 0 && (
            <div className="text-sm text-zinc-400 text-center py-4 border-2 border-dashed border-zinc-200 rounded-md">Empty</div>
          )}
        </div>

      </div>
    </div>
  );
}